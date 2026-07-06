import { useMemo, useState } from 'react'
import { FLASHCARDS, MODULES } from '../data/curriculum'
import type { ProgressApi } from '../lib/progress'
import type { CardState } from '../types'

const DAY = 86400000

/**
 * SM-2-lite scheduling:
 *  - Again → back in 10 minutes, streak resets
 *  - Good  → interval ladder 1, 3, 7, 14, 30, 60 days
 *  - Easy  → jump two rungs
 */
const LADDER = [1, 3, 7, 14, 30, 60]

function nextState(prev: CardState | undefined, grade: 'again' | 'good' | 'easy', now: number): CardState {
  if (grade === 'again') return { due: now + 10 * 60 * 1000, interval: 0, streak: 0 }
  const streak = (prev?.streak ?? 0) + (grade === 'easy' ? 2 : 1)
  const interval = LADDER[Math.min(streak - 1, LADDER.length - 1)]
  return { due: now + interval * DAY, interval, streak }
}

export function Flashcards({ api }: { api: ProgressApi }) {
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [flipped, setFlipped] = useState(false)
  const [sessionDone, setSessionDone] = useState(0)
  const now = Date.now()

  const states = api.progress.cardStates ?? {}

  const deck = useMemo(() => {
    const d = moduleFilter === 'all' ? FLASHCARDS : FLASHCARDS.filter((f) => f.moduleId === moduleFilter)
    // Order: due (or never-seen) first — earliest due leads; future cards follow by due date.
    return [...d].sort((a, b) => (states[a.id]?.due ?? 0) - (states[b.id]?.due ?? 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFilter, api.progress.cardStates])

  const dueCount = deck.filter((c) => (states[c.id]?.due ?? 0) <= now).length
  const card = deck[0]
  const cardDue = card ? (states[card.id]?.due ?? 0) <= now : false

  function grade(g: 'again' | 'good' | 'easy') {
    if (!card) return
    api.gradeCard(card.id, nextState(states[card.id], g, Date.now()))
    setFlipped(false)
    setSessionDone((n) => n + 1)
  }

  if (!card) return <div className="card">No cards.</div>

  const st = states[card.id]

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>🃏 Flashcards · spaced review</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Cards return on a widening schedule (1 → 3 → 7 → 14 → 30 → 60 days). Grade honestly — the schedule is the point.
      </p>

      <div className="row" style={{ marginBottom: 14 }}>
        <select
          className="toggle"
          value={moduleFilter}
          style={{ fontSize: 13 }}
          onChange={(e) => { setModuleFilter(e.target.value); setFlipped(false) }}
        >
          <option value="all">All modules ({FLASHCARDS.length})</option>
          {MODULES.map((m) => (
            <option key={m.id} value={m.id}>{m.icon} {m.title}</option>
          ))}
        </select>
        <div className="spacer" />
        <span className="pill" style={{ color: dueCount ? 'var(--amber)' : 'var(--green)' }}>
          {dueCount ? `${dueCount} due now` : 'All caught up ✓'}
        </span>
        <span className="pill">Reviewed this session: {sessionDone}</span>
      </div>

      {!cardDue && (
        <div className="callout tip" style={{ marginBottom: 12 }}>
          <div className="c-title"><span>🌿</span>Nothing due</div>
          Every card in this deck is scheduled in the future — next one returns{' '}
          {st ? new Date(st.due).toLocaleDateString() : 'soon'}. You can still review ahead below.
        </div>
      )}

      <div className="fc" onClick={() => setFlipped((f) => !f)}>
        <div className={`fc-inner ${flipped ? 'flipped' : ''}`}>
          <div className="fc-face fc-front">
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
                {st?.streak ? `streak ${st.streak} · interval ${st.interval}d` : 'NEW CARD'}
              </div>
              <div className="fc-q">{card.front}</div>
            </div>
            <div className="fc-hint">click to reveal ↻</div>
          </div>
          <div className="fc-face fc-back">
            <div className="fc-a">{card.back}</div>
            <div className="fc-hint">grade yourself below ↓</div>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 16, justifyContent: 'center' }}>
        {!flipped ? (
          <button className="btn" onClick={() => setFlipped(true)}>Show answer</button>
        ) : (
          <>
            <button className="btn ghost" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => grade('again')}>
              ✗ Again <small style={{ opacity: 0.7 }}>(10 min)</small>
            </button>
            <button className="btn" onClick={() => grade('good')}>
              ✓ Good <small style={{ opacity: 0.8 }}>({LADDER[Math.min(st?.streak ?? 0, LADDER.length - 1)]}d)</small>
            </button>
            <button className="btn ghost" style={{ borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => grade('easy')}>
              ⚡ Easy <small style={{ opacity: 0.7 }}>({LADDER[Math.min((st?.streak ?? 0) + 1, LADDER.length - 1)]}d)</small>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
