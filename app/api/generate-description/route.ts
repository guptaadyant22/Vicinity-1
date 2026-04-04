// API route that generates professional business descriptions using Groq AI.
// Creates engaging 150-200 word descriptions based on business type, location, and details.

import { NextRequest, NextResponse } from 'next/server'

// Generate a professional business description via Groq AI
export async function POST(req: NextRequest) {
  try {
    const { businessContext } = await req.json()

    if (!businessContext?.name || !businessContext?.type) {
      return NextResponse.json(
        { error: 'Business name and type are required' },
        { status: 400 }
      )
    }

    console.log('═══════════════════════════════════════════')
    console.log('✍️ GENERATING BUSINESS DESCRIPTION')
    console.log('═══════════════════════════════════════════')
    console.log(`Business: ${businessContext.name}`)
    console.log(`Type: ${businessContext.type}`)
    console.log(`Location: ${businessContext.location || 'Not specified'}`)


    const prompt = `You are a professional business description writer. Create a compelling, concise business description (150-200 words) for this business.

Business Information:
- Name: ${businessContext.name}
- Type: ${businessContext.type}
- Location: ${businessContext.location || 'Not specified'}
- Phone: ${businessContext.phone || 'Not provided'}
- Website: ${businessContext.website || 'Not provided'}
- Hours: ${businessContext.hoursOpen ? `Open ${businessContext.hoursOpen} hours` : 'Hours not specified'}

Write a professional, engaging description that:
1. Highlights what makes this ${businessContext.type} unique
2. Emphasizes quality and customer service
3. Mentions key contact information if provided
4. Sounds welcoming and professional
5. Is between 150-200 words

Return ONLY the description text, nothing else.`

    console.log('\n🤖 Calling Groq API...')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7, 
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Groq API Error:', error)
      throw new Error(error.error?.message || 'Groq API Error')
    }

    const data = await response.json()
    const description = data.choices[0]?.message?.content?.trim() || ''

    if (!description) {
      throw new Error('No description generated')
    }

    console.log('\n📝 Description Generated:')
    console.log(`Length: ${description.length} characters`)
    console.log(`Preview: ${description.substring(0, 100)}...`)

    console.log('\n═══════════════════════════════════════════')
    console.log('✅ GENERATION COMPLETE')
    console.log('═══════════════════════════════════════════\n')

    return NextResponse.json({ description })

  } catch (error: any) {
    console.error('❌ Description generation error:', error?.message || error)
    return NextResponse.json(
      { 
        error: 'Failed to generate description', 
        details: error?.message || 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
