import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return new Response('Unauthorized', { status: 401 })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return new Response('Unauthorized', { status: 401 })

    const { businessName, businessType, rating } = await req.json()

    if (!businessName || !rating) {
      return new Response('Missing required fields', { status: 400 })
    }

    const sentiment =
      rating === 5 ? 'excellent experience, everything was perfect' :
        rating === 4 ? 'good experience with minor things that could be better' :
          rating === 3 ? 'mixed experience, some things were good but others needed improvement' :
            rating === 2 ? 'poor experience, several things went wrong' :
              'very bad experience, extremely disappointed'

    console.log(` Drafting ${rating}/5 review for "${businessName}"`)

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
            content: `You write short genuine-sounding customer reviews. Casual first-person tone. 2-3 sentences max. Sound like a real person, not a template. Never end with "I would recommend".`,
          },
          {
            role: 'user',
            content: `Write a ${rating}/5 star review for "${businessName}", a ${businessType || 'local business'}. It was a ${sentiment}.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Groq API error:', error)
      throw new Error(error.error?.message || 'Groq API error')
    }

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const data = line.replace('data: ', '')
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content
              if (delta) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta: { text: delta } })}\n\n`)
                )
              }
            } catch { /* skip malformed chunks */ }
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Review draft error:', error?.message)
    return new Response(JSON.stringify({ error: error?.message }), { status: 500 })
  }
}