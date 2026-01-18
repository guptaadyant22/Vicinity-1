// Searches businesses using AI with smart keyword pre-filtering
// Matches by category, name, and description to find relevant results

import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

function normalizeId(id) {
  return String(id).trim().toLowerCase()
}

// Smart keyword pre-filter 
function smartPreFilter(query, businesses) {
  const q = query.toLowerCase().trim()
  const keywords = q.split(/\s+/).filter(k => k.length > 0)

  // Category mappings for better matching
  const categoryMap = {
    'coffee': ['coffee', 'cafe', 'bakery'],
    'cafe': ['cafe', 'coffee', 'bakery'],
    'pizza': ['pizza', 'italian'],
    'burger': ['burger', 'fast food', 'restaurant'],
    'sushi': ['sushi', 'japanese', 'asian'],
    'food': ['restaurant', 'cafe', 'pizza', 'burger', 'sushi', 'coffee', 'dessert', 'bakery', 'fast food', 'korean', 'japanese'],
    'eat': ['restaurant', 'cafe', 'pizza', 'burger', 'sushi', 'coffee', 'dessert', 'bakery', 'fast food'],
    'dining': ['restaurant', 'cafe', 'pizza', 'burger', 'sushi', 'coffee', 'dessert', 'bakery'],
    'restaurant': ['restaurant', 'cafe', 'pizza', 'burger', 'sushi', 'coffee', 'dessert', 'bakery', 'fast food'],
    'salon': ['salon', 'hair', 'barber'],
    'gym': ['gym', 'fitness'],
    'bar': ['bar', 'cafe', 'coffee'],
    'dessert': ['dessert', 'bakery', 'cafe', 'coffee'],
    'drink': ['cafe', 'coffee', 'bar', 'dessert'],
    'beverage': ['cafe', 'coffee', 'bar', 'dessert'],
  }

  return businesses.filter(b => {
    const name = b.name.toLowerCase()
    const type = b.type.toLowerCase()
    const desc = (b.description || '').toLowerCase()
    const text = `${name} ${type} ${desc}`

    // Check each keyword
    for (const kw of keywords) {
      
      if (name.includes(kw) || type.includes(kw) || desc.includes(kw)) {
        return true
      }

      // Check category mapping
      if (categoryMap[kw]) {
        const relatedCategories = categoryMap[kw]
        if (relatedCategories.some(cat => type.includes(cat))) {
          return true
        }
      }
    }

    return false
  })
}

export async function POST(request) {
  try {
    console.log('🔵 API received request')
    const body = await request.json()
    const { query, businesses } = body

    console.log(`📥 Query: "${query}" | Businesses count: ${businesses?.length || 0}`)

    if (!query?.trim()) {
      console.log('❌ Empty query')
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
      console.log('⚠️ No businesses provided - returning empty')
      return NextResponse.json({ 
        success: true,
        query: query,
        matchedBusinesses: [],
      })
    }

    // STEP 1: Smart pre-filter to reduce noise
    let preFiltered = smartPreFilter(query, businesses)
    console.log(`📊 Pre-filter: ${preFiltered.length} potential matches`)

    // If pre-filter finds nothing, search all
    if (preFiltered.length === 0) {
      console.log('⚠️ Pre-filter found nothing, searching all businesses')
      preFiltered = businesses
    }

    if (!GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY missing')
      return NextResponse.json({
        success: false,
        error: 'API key not configured',
        matchedBusinesses: [],
      })
    }

    // STEP 2: Send only pre-filtered businesses to AI (max 30 to save tokens)
    const lightweightBusinesses = preFiltered
      .slice(0, 30)
      .map((b) => ({
        id: normalizeId(b.id),
        name: String(b.name || 'Unknown').trim(),
        type: String(b.type || 'Other').trim(),
        description: String(b.description || b.bio || '').trim().slice(0, 100),
      }))

    console.log(`📦 Sending to AI: ${lightweightBusinesses.length} pre-filtered businesses`)

    const businessList = lightweightBusinesses
      .map((b) => `ID:${b.id}|NAME:${b.name}|TYPE:${b.type}|DESC:${b.description}`)
      .join('\n')

    // STRICT AI SEARCH PROMPT
    const prompt = `You are a strict business search assistant. From the provided businesses, find ONLY those that match the search query.

SEARCH QUERY: "${query}"

BUSINESSES TO FILTER:
${businessList}

INSTRUCTIONS:
- Only return businesses that are directly relevant to the search query
- Match by business TYPE/CATEGORY first
- Match by business NAME
- Match by DESCRIPTION content
- For "coffee": Return ONLY coffee shops, cafes with coffee
- For "pizza": Return ONLY pizza restaurants
- For "sushi": Return ONLY sushi restaurants
- For "salon": Return ONLY salons
- For "gym": Return ONLY gyms/fitness
- DO NOT return unrelated businesses
- If a business type doesn't match the query, exclude it
- Return empty list if NO relevant businesses found

RETURN ONLY VALID JSON: {"ids": ["id1", "id2"]} or {"ids": []} if no matches`

    let groqResponse
    try {
      console.log('🌐 Calling Groq API...')
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a strict business search assistant. Return ONLY businesses that match the query. Return ONLY valid JSON, no explanation.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1, // Very low for strict matching
          max_tokens: 300,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)
    } catch (e) {
      console.error('❌ Groq fetch failed:', e)
      return NextResponse.json({
        success: false,
        error: 'Search service unavailable',
        matchedBusinesses: [],
      })
    }

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error(`❌ Groq error (${groqResponse.status}):`, errorText.slice(0, 200))
      return NextResponse.json({
        success: false,
        error: 'Search service error',
        matchedBusinesses: [],
      })
    }

    let aiResponse = ''
    try {
      const groqData = await groqResponse.json()
      aiResponse = groqData.choices?.[0]?.message?.content || ''
      console.log(`✅ Groq response: ${aiResponse.slice(0, 200)}`)
    } catch (e) {
      console.error('❌ Failed to parse Groq response:', e)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse search results',
        matchedBusinesses: [],
      })
    }

    let matchingIds = []
    try {
      const parsed = JSON.parse(aiResponse)
      if (parsed.ids && Array.isArray(parsed.ids)) {
        matchingIds = parsed.ids
          .map((id) => normalizeId(id))
          .filter(id => id.length > 0)
      }
    } catch (e) {
      console.warn('⚠️ Could not parse JSON response')
      console.warn('Response was:', aiResponse.slice(0, 200))
      return NextResponse.json({
        success: false,
        error: 'Invalid search response format',
        matchedBusinesses: [],
      })
    }

    console.log(`📊 AI found ${matchingIds.length} matching businesses`)

    // Filter from original businesses to get full data
    const matchedBusinesses = businesses.filter(b => {
      return matchingIds.includes(normalizeId(b.id))
    })

    console.log(`✅ Final result: ${matchedBusinesses.length} businesses matched`)

    // Return COMPLETE business objects with all fields
    return NextResponse.json({
      success: true,
      query: query,
      matchedBusinesses: matchedBusinesses.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        description: b.description || 'No description available',
        address: b.address || 'Address not available',
        phone: b.phone || '',
        hours: b.hours || 'Hours not specified',
        image_url: b.image_url || null,
        rating: b.rating ?? 0,
        review_count: b.review_count ?? 0,
        is_open: b.is_open ?? true,
        created_at: b.created_at || new Date().toISOString(),
      })),
    })

  } catch (error) {
    console.error('❌ CRITICAL API ERROR:', error?.message || error)
    
    return NextResponse.json({
      success: false,
      error: 'Search error',
      matchedBusinesses: [],
    })
  }
}
