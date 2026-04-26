import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY
})

export async function POST(req) {
  const { message } = await req.json()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `
        Convert user message into JSON:
        { "name": "", "quantity": number, "locationCode": "" }
        `
      },
      {
        role: 'user',
        content: message
      }
    ]
  })

  const text = completion.choices[0].message.content

  const parsed = JSON.parse(text)

  // ยิงต่อไป inbound API
  const res = await fetch('http://localhost:3000/api/inbound', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed)
  })

  return Response.json(await res.json())
}