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

    const { reviews, businessName, businessType } = await req.json()

    if (!reviews || reviews.length < 2) {
      return new Response('Not enough reviews', { status: 400 })
    }

    const reviewTexts = reviews
      .slice(0, 20)
      .map((r: any) => `${r.rating}/5: "${r.comment || r.text}"`)
      .join('\n')

    console.log(` Generating summary for "${businessName}" — ${reviews.length} reviews`)

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
            content: `You summarize customer reviews for local businesses into 2-3 clear sentences. Be specific and factual. Mention what people love and any recurring concerns. No intro phrases like "Customers say" or "Overall". Just the summary directly.`,
          },
          {
            role: 'user',
            content: `Summarize these reviews for "${businessName}", a ${businessType || 'local business'}:\n\n${reviewTexts}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
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
    console.error('Review summary error:', error?.message)
    return new Response(JSON.stringify({ error: error?.message }), { status: 500 })
  }
}