import type { Lesson, Module } from '../types'

/**
 * Client for the local AI tutor proxy (tutor-server.cjs). Falls back to a
 * deterministic offline tutor built from lesson content when the proxy is
 * absent or has no API key — the app must stay fully usable offline.
 */
const BASE = 'http://localhost:5189'

export interface TutorMsg {
  role: 'user' | 'assistant'
  content: string
}

export async function tutorHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(1500) })
    if (!r.ok) return false
    const d = (await r.json()) as { ai?: boolean }
    return Boolean(d.ai)
  } catch {
    return false
  }
}

export async function askTutor(messages: TutorMsg[]): Promise<string> {
  const r = await fetch(`${BASE}/api/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(45000),
  })
  const d = (await r.json()) as { reply?: string; error?: string }
  if (!r.ok || !d.reply) throw new Error(d.error || `tutor error ${r.status}`)
  return d.reply
}

/** Builds the lesson-context prefix sent with the first message of a thread. */
export function lessonContext(module: Module, lesson: Lesson): string {
  return [
    `Lesson: "${lesson.title}" (module: ${module.title}, DP-700).`,
    `Summary: ${lesson.summary}`,
    `Key points:`,
    ...lesson.keyPoints.map((k) => `- ${k}`),
  ].join('\n')
}

// ---------- offline fallback ----------

export function offlineReply(kind: 'simpler' | 'analogy' | 'quiz' | 'free', module: Module, lesson: Lesson): string {
  switch (kind) {
    case 'simpler':
      return [
        `**${lesson.title} — the simple version** (offline tutor)`,
        '',
        lesson.summary,
        '',
        ...lesson.keyPoints.map((k, i) => `${i + 1}. ${k}`),
        '',
        '_Start the AI tutor for richer explanations: `node tutor-server.cjs` with an ANTHROPIC_API_KEY._',
      ].join('\n')
    case 'analogy':
      return [
        `**Think of it this way** (offline tutor)`,
        '',
        `Re-read the "Real-world use case" panel at the top of this lesson — the Fabrikam scenario IS the analogy: it maps every concept in "${lesson.title}" to a concrete retail situation.`,
        '',
        '_For fresh AI-generated analogies, start the tutor server._',
      ].join('\n')
    case 'quiz': {
      const q = module.quiz[0]
      return [
        `**Pop quiz** (offline tutor — from this module's bank)`,
        '',
        q.prompt,
        ...q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`),
        '',
        `_Answer, then check yourself: the correct choice is ${String.fromCharCode(65 + q.answer)} — ${q.explanation}_`,
      ].join('\n')
    }
    default:
      return [
        '**Offline tutor**',
        '',
        `The AI tutor server is not running, so I can only offer this lesson's key points:`,
        ...lesson.keyPoints.map((k) => `- ${k}`),
        '',
        'To enable free-form questions: `node tutor-server.cjs` with an ANTHROPIC_API_KEY, then reopen this panel.',
      ].join('\n')
  }
}
