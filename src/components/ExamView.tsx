import { useEffect, useMemo, useRef, useState } from 'react'
import type { DomainId, ExamResult } from '../types'
import type { ProgressApi } from '../lib/progress'
import { buildExam, buildDomainDrill, poolSize, poolByDomain, type ExamQuestion } from '../data/exam-bank'
import { DOMAINS } from '../data/domains'

const PASS_BAR = 0.7 // mirrors the real exam's 700/1000 cut score
const SECONDS_PER_Q = 100 // ~1:40 per question, like the real ~100-min/60-q pace

/** Selectable exam formats. */
const FORMATS = [
  { key: 'quick', label: 'Quick check', perDomain: 5, blurb: '15 questions · ~25 min' },
  { key: 'standard', label: 'Standard mock', perDomain: 10, blurb: '30 questions · ~50 min' },
  { key: 'full', label: 'Full exam', perDomain: 20, blurb: '60 questions · ~100 min' },
] as const

type Phase = 'intro' | 'run' | 'result'

export function ExamView({ api, onExit }: { api: ProgressApi; onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [cur, setCur] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [examMinutes, setExamMinutes] = useState(50)
  const startedAt = useRef(0)
  const submitted = useRef(false)

  // countdown
  useEffect(() => {
    if (phase !== 'run') return
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          finish() // time is up — auto-submit
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const result: ExamResult | null = useMemo(() => {
    if (phase !== 'result') return null
    const perDomain: Record<DomainId, { correct: number; total: number }> = {
      implement: { correct: 0, total: 0 },
      ingest: { correct: 0, total: 0 },
      monitor: { correct: 0, total: 0 },
    }
    const missed: string[] = []
    let correct = 0
    for (const q of questions) {
      perDomain[q.domain].total++
      if (answers[q.id] === q.answer) {
        correct++
        perDomain[q.domain].correct++
      } else {
        missed.push(q.topic)
      }
    }
    const score = questions.length ? correct / questions.length : 0
    return {
      takenAt: startedAt.current,
      score,
      correct,
      total: questions.length,
      perDomain,
      missedTopics: missed,
      durationSec: Math.round(examMinutes * 60 - secondsLeft),
      passed: score >= PASS_BAR,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // persist once when the result materializes
  useEffect(() => {
    if (result && !submitted.current) {
      submitted.current = true
      api.recordExam(result)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  function launch(qs: ExamQuestion[]) {
    const minutes = Math.max(5, Math.round((qs.length * SECONDS_PER_Q) / 60))
    setQuestions(qs)
    setAnswers({})
    setFlagged({})
    setCur(0)
    setExamMinutes(minutes)
    setSecondsLeft(minutes * 60)
    startedAt.current = Date.now()
    submitted.current = false
    setPhase('run')
    window.scrollTo({ top: 0 })
  }

  const startFormat = (perDomain: number) => launch(buildExam(perDomain))
  const startDrill = (d: DomainId) => launch(buildDomainDrill(d, 15))

  function finish() {
    setPhase('result')
    window.scrollTo({ top: 0 })
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length

  // ---------- intro ----------
  if (phase === 'intro') {
    const history = api.progress.examResults ?? []
    const best = history.length ? Math.max(...history.map((r) => r.score)) : null
    const total = poolSize()
    const byDom = poolByDomain()
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>🎯 Practice exam</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Timed mocks drawn fresh from a bank of <b>{total}</b> scenario questions, balanced across the
          three skill areas. Pass bar {Math.round(PASS_BAR * 100)}% (mirrors the real 700/1000).
        </p>

        <div className="card">
          <h3 className="block-heading" style={{ marginTop: 0 }}>Choose a format</h3>
          <div className="grid grid-3">
            {FORMATS.map((f) => (
              <button key={f.key} className="format-card" onClick={() => startFormat(f.perDomain)}>
                <div className="fmt-title">{f.label}</div>
                <div className="fmt-blurb">{f.blurb}</div>
                <div className="fmt-go">Start →</div>
              </button>
            ))}
          </div>
          <div className="callout exam" style={{ marginTop: 14 }}>
            <div className="c-title"><span>🎯</span>Exam-day tip</div>
            All three skill areas are weighted ~equally (30–35%). Don’t camp on one question — flag it,
            move on, and come back. Every attempt draws a new random set, so retake freely.
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <button className="btn ghost" onClick={onExit}>Back</button>
            {best !== null && <span className="pill">Best: {Math.round(best * 100)}%</span>}
            {history.length > 0 && <span className="pill">Attempts: {history.length}</span>}
          </div>
        </div>

        <div className="card">
          <h3 className="block-heading" style={{ marginTop: 0 }}>Or drill one skill area (15 Q)</h3>
          <div className="grid grid-3">
            {DOMAINS.map((d) => (
              <button key={d.id} className="format-card" onClick={() => startDrill(d.id)} style={{ borderColor: d.color }}>
                <div className="fmt-title" style={{ color: d.color }}>{d.title.split(' ').slice(0, 2).join(' ')}</div>
                <div className="fmt-blurb">{byDom[d.id]} questions available · {d.weight}</div>
                <div className="fmt-go">Drill →</div>
              </button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div className="card">
            <h3 className="block-heading" style={{ marginTop: 0 }}>📈 Attempt history</h3>
            <table className="tbl">
              <thead><tr><th>When</th><th>Score</th><th>Result</th><th>Time used</th></tr></thead>
              <tbody>
                {[...history].reverse().map((r, i) => (
                  <tr key={i}>
                    <td>{new Date(r.takenAt).toLocaleString()}</td>
                    <td>{Math.round(r.score * 100)}% ({r.correct}/{r.total})</td>
                    <td style={{ color: r.passed ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                      {r.passed ? 'PASS' : 'FAIL'}
                    </td>
                    <td>{Math.floor(r.durationSec / 60)}m {r.durationSec % 60}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ---------- result ----------
  if (phase === 'result' && result) {
    return (
      <div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="ring-num" style={{ color: result.passed ? 'var(--green)' : 'var(--red)' }}>
            {Math.round(result.score * 100)}%
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: result.passed ? 'var(--green)' : 'var(--red)' }}>
            {result.passed ? '✅ PASS' : '❌ Below the bar'}
          </div>
          <div className="muted" style={{ marginTop: 4 }}>
            {result.correct}/{result.total} correct · {Math.floor(result.durationSec / 60)}m {result.durationSec % 60}s used
          </div>
        </div>

        <div className="card">
          <h3 className="block-heading" style={{ marginTop: 0 }}>Skill-area breakdown</h3>
          {DOMAINS.map((d) => {
            const pd = result.perDomain[d.id]
            const pct = pd.total ? Math.round((pd.correct / pd.total) * 100) : 0
            return (
              <div key={d.id} style={{ margin: '10px 0' }}>
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 13 }}>
                  <span><span className="tag-dom" style={{ background: d.color, marginRight: 7 }} />{d.title}</span>
                  <b>{pct}% ({pd.correct}/{pd.total})</b>
                </div>
                <div className="bar" style={{ marginTop: 5 }}>
                  <i style={{ width: `${pct}%`, background: d.color }} />
                </div>
              </div>
            )
          })}
          {result.missedTopics.length > 0 && (
            <>
              <div className="divider" />
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 6 }}>Missed topics (feed these into your review):</div>
              {[...new Set(result.missedTopics)].map((t) => <span key={t} className="chip" style={{ margin: '2px 4px 2px 0', display: 'inline-block' }}>{t}</span>)}
            </>
          )}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={() => setPhase('intro')}>New exam</button>
            <button className="btn ghost" onClick={onExit}>Back to dashboard</button>
          </div>
        </div>

        <h3 className="block-heading">Review your answers</h3>
        {questions.map((q, qi) => {
          const sel = answers[q.id]
          const dom = DOMAINS.find((d) => d.id === q.domain)!
          return (
            <div className="card" key={q.id}>
              <div className="row" style={{ marginBottom: 6 }}>
                <span className="pill dom" style={{ background: dom.color }}>{dom.title.split(' ')[0]}</span>
                <span className="chip">{q.topic}</span>
              </div>
              <div style={{ fontWeight: 650, fontSize: 15, marginBottom: 4 }}>{qi + 1}. {q.prompt}</div>
              {q.options.map((opt, oi) => {
                let cls = 'q-opt'
                if (oi === q.answer) cls += ' correct'
                else if (oi === sel) cls += ' wrong'
                return <button key={oi} className={cls} disabled>{String.fromCharCode(65 + oi)}. {opt}</button>
              })}
              <div className="q-exp">
                <b>{sel === q.answer ? '✓ Correct.' : sel === undefined ? '— Unanswered.' : '✗ Not quite.'}</b> {q.explanation}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ---------- run ----------
  const q = questions[cur]
  if (!q) return null
  const dom = DOMAINS.find((d) => d.id === q.domain)!

  return (
    <div>
      <div className="exam-topbar">
        <span className={`exam-timer ${secondsLeft < 300 ? 'low' : ''}`}>⏱ {mm}:{ss}</span>
        <span className="muted" style={{ fontSize: 13 }}>Answered {answeredCount}/{questions.length}</span>
        <div className="spacer" />
        <button className="btn sm" onClick={() => { if (confirm(`Submit now? ${questions.length - answeredCount} unanswered.`)) finish() }}>
          Submit exam
        </button>
      </div>

      <div className="exam-palette">
        {questions.map((qq, i) => {
          let cls = 'pal'
          if (i === cur) cls += ' cur'
          else if (flagged[qq.id]) cls += ' flag'
          else if (answers[qq.id] !== undefined) cls += ' done'
          return <button key={qq.id} className={cls} onClick={() => setCur(i)}>{i + 1}</button>
        })}
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="pill dom" style={{ background: dom.color }}>{dom.title}</span>
          <div className="spacer" />
          <button
            className="btn ghost sm"
            onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
          >
            {flagged[q.id] ? '🚩 Flagged' : '⚐ Flag for review'}
          </button>
        </div>
        <div style={{ fontWeight: 650, fontSize: 15.5, marginBottom: 6, lineHeight: 1.55 }}>
          {cur + 1}. {q.prompt}
        </div>
        {q.options.map((opt, oi) => (
          <button
            key={oi}
            className={`q-opt ${answers[q.id] === oi ? 'selected' : ''}`}
            onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
          >
            {String.fromCharCode(65 + oi)}. {opt}
          </button>
        ))}
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn ghost sm" disabled={cur === 0} onClick={() => setCur((c) => c - 1)}>← Prev</button>
          <div className="spacer" />
          {cur < questions.length - 1
            ? <button className="btn sm" onClick={() => setCur((c) => c + 1)}>Next →</button>
            : <button className="btn sm" onClick={() => { if (confirm(`Submit now? ${questions.length - answeredCount} unanswered.`)) finish() }}>Finish & submit</button>}
        </div>
      </div>
    </div>
  )
}
