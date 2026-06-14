// API route that analyzes customer reviews using Groq AI to extract sentiment and key themes.
// Returns a structured JSON breakdown of praised aspects, complaints, and recommendations.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Handle review analysis requests and return AI-generated insights
export async function POST(req: NextRequest) {
  try {
    const { reviews, businessId } = await req.json()

    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: 'No reviews provided' },
        { status: 400 }
      )
    }

    console.log(`🔍 Analyzing ${reviews.length} reviews...`)


    const reviewText = reviews
      .map((r: any, i: number) => `Review ${i + 1} (Rating: ${r.rating}/5):\n"${r.text || r.title || 'No text provided'}"\n`)
      .join('\n---\n')


    const context = `You are Vicinity's intelligent review analyzer. Analyze customer reviews and provide insights in valid JSON format ONLY.

Your task:
1. Analyze sentiment (positive/neutral/negative)
2. Extract key themes (praised aspects and complaints)
3. Generate actionable recommendations
4. Provide overall trend summary

Respond with ONLY valid JSON, no markdown, no explanation. The JSON must be exactly this structure:
{
  "sentimentBreakdown": {
    "positive": <number 0-100>,
    "neutral": <number 0-100>,
    "negative": <number 0-100>
  },
  "keyThemes": {
    "praised": [<string>, <string>, <string>],
    "complaints": [<string>, <string>, <string>]
  },
  "recommendations": [<string>, <string>, <string>, <string>],
  "trend": "<string summary>"
}

Rules:
- Percentages must add up to 100
- Extract 3 praised themes and 3 complaints
- Provide 4 actionable recommendations
- Keep trend to 1-2 sentences
- Return ONLY the JSON object, nothing else`

    console.log('📡 Calling Groq API...')


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
            role: 'system',
            content: context,
          },
          {
            role: 'user',
            content: `Analyze these reviews:\n\n${reviewText}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.5,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Groq API Error:', error)
      throw new Error(error.error?.message || 'Groq API Error')
    }

    const data = await response.json()
    const responseText = data.choices[0]?.message?.content || ''

    console.log('📝 Raw Response:', responseText)


    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('❌ Could not extract JSON from response:', responseText)
      throw new Error('Could not parse JSON from Groq response')
    }

    const analysis = JSON.parse(jsonMatch[0])

    console.log('✅ Analysis Complete:', analysis)

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('❌ Review analysis error:', error?.message || error)
    return NextResponse.json(
      {
        error: 'Failed to analyze reviews',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
