import { useEffect, useRef, useState } from 'react'
import type { Lesson, Module } from '../types'
import { askTutor, lessonContext, offlineReply, tutorHealth, type TutorMsg } from '../lib/tutor'

/** Slide-in AI tutor scoped to the current lesson. Degrades gracefully offline. */
export function TutorPanel({ module, lesson, onClose }: { module: Module; lesson: Lesson; onClose: () => void }) {
  const [online, setOnline] = useState<boolean | null>(null)
  const [thread, setThread] = useState<TutorMsg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => { void tutorHealth().then(setOnline) }, [])
  useEffect(() => { scroller.current?.scrollTo({ top: 99999 }) }, [thread, busy])

  async function send(text: string, kind: 'simpler' | 'analogy' | 'quiz' | 'free') {
    if (busy) return
    const user: TutorMsg = { role: 'user', content: text }
    setThread((t) => [...t, user])
    setBusy(true)
    try {
      if (online) {
        // Prefix lesson context on the first exchange only.
        const ctx: TutorMsg[] = thread.length === 0
          ? [{ role: 'user', content: `${lessonContext(module, lesson)}\n\n${text}` }]
          : [...thread, user]
        const reply = await askTutor(ctx)
        setThread((t) => [...t, { role: 'assistant', content: reply }])
      } else {
        setThread((t) => [...t, { role: 'assistant', content: offlineReply(kind, module, lesson) }])
      }
    } catch (e) {
      setThread((t) => [...t, { role: 'assistant', content: `⚠️ Tutor error: ${String((e as Error).message)}. Falling back offline:\n\n${offlineReply(kind, module, lesson)}` }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tutor-panel">
      <div className="tutor-head">
        <span style={{ fontSize: 18 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>AI Tutor</div>
          <div className="muted" style={{ fontSize: 11 }}>
            {online === null ? 'checking…' : online ? '● online — Claude' : '○ offline mode (start tutor-server.cjs for AI)'}
          </div>
        </div>
        <button className="toggle" onClick={onClose}>✕</button>
      </div>

      <div className="tutor-presets">
        <button className="btn ghost sm" disabled={busy} onClick={() => send('Explain this lesson in simpler terms.', 'simpler')}>
          🪄 Explain simpler
        </button>
        <button className="btn ghost sm" disabled={busy} onClick={() => send('Give me a real-world analogy for this lesson.', 'analogy')}>
          🌍 Analogy
        </button>
        <button className="btn ghost sm" disabled={busy} onClick={() => send('Quiz me with one new multiple-choice question on this lesson.', 'quiz')}>
          ❓ Quiz me
        </button>
      </div>

      <div className="tutor-thread" ref={scroller}>
        {thread.length === 0 && (
          <div className="muted" style={{ fontSize: 12.5, textAlign: 'center', padding: '30px 12px' }}>
            Ask anything about “{lesson.title}”, or use a quick action above.
          </div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={`tutor-msg ${m.role}`}>
            {m.content}
          </div>
        ))}
        {busy && <div className="tutor-msg assistant">…thinking</div>}
      </div>

      <form
        className="tutor-input"
        onSubmit={(e) => {
          e.preventDefault()
          const t = input.trim()
          if (!t) return
          setInput('')
          void send(t, 'free')
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the tutor…"
          disabled={busy}
        />
        <button className="btn sm" disabled={busy || !input.trim()}>Send</button>
      </form>
    </div>
  )
}
