import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { reviews, deals, profile, stats } = await req.json()

    const reviewText = reviews.length > 0
      ? reviews.slice(0, 30).map((r: any, i: number) =>
          `Review ${i + 1} (Rating: ${r.rating}/5): "${r.text || r.comment || 'No text'}"`
        ).join('\n')
      : 'No reviews yet.'

    const dealText = deals.length > 0
      ? deals.map((d: any) => `- "${d.title}" (${d.click_count ?? 0} clicks, active: ${d.is_active})`).join('\n')
      : 'No deals yet.'

    const prompt = `You are an AI business advisor for a local business discovery platform.

Business Profile:
- Name: ${profile.name || 'Unknown'}
- Category: ${profile.category || 'Unknown'}
- Profile completion: ${stats.profileCompletion}%
- Missing fields: ${stats.missingFields.join(', ') || 'None'}

Review Stats:
- Total reviews: ${stats.totalReviews}
- Average rating: ${stats.avgRating}/5
- Positive rate: ${stats.positiveRate}%
- This month: ${stats.thisMonthReviews} reviews
- Last month: ${stats.lastMonthReviews} reviews
- Unanswered reviews: ${stats.unansweredCount}

Recent Reviews:
${reviewText}

Active Deals:
${dealText}
- Total active deals: ${stats.activeDeals}
- Expiring soon (≤7 days): ${stats.expiringDeals}

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "healthScore": <number 0-100>,
  "healthLabel": "<Excellent|Good|Fair|Needs Work>",
  "summary": "<2 sentence AI-generated business summary based on data>",
  "focusAreas": [
    { "title": "<action title>", "body": "<1 sentence why this matters>", "severity": "<critical|improve|maintain>" }
  ],
  "customerPersona": "<2-3 sentences describing what customers say and feel about this business>",
  "weeklyDigest": "<2-3 sentences: what changed recently and the single most impactful next action>",
  "dealTip": "<1 sentence tip about deal strategy based on current deal data>"
}

Rules:
- focusAreas: exactly 3 items, ranked by impact (most impactful first)
- healthScore: weighted — rating (40%), review volume/growth (25%), profile completion (20%), deal activity (15%)
- Be specific, reference actual data (ratings, counts, category)
- Return ONLY the JSON object`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: 'You are a business advisor. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.4,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Groq API error')
    }

    const data = await response.json()
    const text = data.choices[0]?.message?.content || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse JSON from response')

    const insights = JSON.parse(jsonMatch[0])
    return NextResponse.json(insights)
  } catch (error: any) {
    console.error('Business insights error:', error?.message)
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error?.message },
      { status: 500 }
    )
  }
}