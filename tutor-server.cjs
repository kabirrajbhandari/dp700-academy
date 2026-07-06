// Fabric Forge — DP-700 AI Tutor proxy.
// Pure Node stdlib (no deps). The Anthropic API key lives ONLY here, never in
// the browser. Without a key, /api/health reports ai:false and the app uses
// its built-in offline tutor (lesson key points).
//
// Run:  ANTHROPIC_API_KEY=sk-ant-... node tutor-server.cjs
//   or: echo sk-ant-... > .anthropic-key && node tutor-server.cjs

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.TUTOR_PORT || 5189
const MODEL = process.env.TUTOR_MODEL || 'claude-opus-4-8'

function apiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim()
  try {
    return fs.readFileSync(path.join(__dirname, '.anthropic-key'), 'utf8').trim()
  } catch {
    return ''
  }
}

const SYSTEM = `You are a friendly, precise tutor for the Microsoft DP-700 exam
(Implementing Data Engineering Solutions Using Microsoft Fabric).
Rules:
- Be accurate to Microsoft Fabric as documented on Microsoft Learn; if unsure, say so.
- Keep answers short and scannable: a few sentences or a tight bullet list.
- Prefer concrete Fabric examples (lakehouse, pipeline, KQL, warehouse) over abstractions.
- When asked to quiz, produce ONE multiple-choice question (A-D), then wait; reveal the
  answer + a one-line explanation only after the learner answers.
- Never invent exam questions verbatim from the real exam; write original practice items.`

function json(res, code, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  res.end(body)
}

async function callClaude(messages) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      system: SYSTEM,
      messages,
    }),
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Anthropic ${r.status}: ${t.slice(0, 300)}`)
  }
  const data = await r.json()
  return (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {})

  if (req.url === '/api/health') return json(res, 200, { ai: !!apiKey(), model: MODEL })

  if (req.url === '/api/tutor' && req.method === 'POST') {
    let body = ''
    req.on('data', (c) => { body += c; if (body.length > 200_000) req.destroy() })
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body || '{}')
        if (!Array.isArray(messages) || !messages.length) return json(res, 400, { error: 'messages required' })
        if (!apiKey()) return json(res, 503, { error: 'no API key configured' })
        const reply = await callClaude(
          messages.slice(-12).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 8000) })),
        )
        json(res, 200, { reply })
      } catch (e) {
        json(res, 500, { error: String(e.message || e) })
      }
    })
    return
  }

  json(res, 404, { error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`DP-700 tutor proxy on http://localhost:${PORT}  (ai: ${apiKey() ? 'ON' : 'OFF — set ANTHROPIC_API_KEY'})`)
})
