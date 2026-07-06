import { useMemo, useState } from 'react'
import type { Module } from '../types'
import type { ProgressApi } from '../lib/progress'
import { DOMAINS } from '../data/domains'

interface Props {
  module: Module
  api: ProgressApi
  onDone: () => void
}

export function QuizView({ module, api, onDone }: Props) {
  const domain = DOMAINS.find((d) => d.id === module.domain)!
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const prev = api.progress.quizResults.find((r) => r.moduleId === module.id)

  const { correct, total, score, missedTopics } = useMemo(() => {
    let c = 0
    const missed: string[] = []
    for (const q of module.quiz) {
      if (answers[q.id] === q.answer) c++
      else missed.push(q.topic)
    }
    return { correct: c, total: module.quiz.length, score: c / module.quiz.length, missedTopics: missed }
  }, [answers, module.quiz])

  const allAnswered = module.quiz.every((q) => answers[q.id] !== undefined)

  function submit() {
    setSubmitted(true)
    api.recordQuiz({
      moduleId: module.id,
      score,
      correct,
      total,
      takenAt: Date.now(),
      missedTopics,
    })
    window.scrollTo({ top: 0 })
  }

  function retake() {
    setAnswers({})
    setSubmitted(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <span className="pill dom" style={{ background: domain.color }}>{module.icon} {module.title}</span>
        <span className="pill">Quiz · {module.quiz.length} questions</span>
        {prev && !submitted && <span className="pill">Last score: {Math.round(prev.score * 100)}%</span>}
      </div>
      <h2 style={{ marginTop: 0 }}>Module quiz</h2>

      {submitted && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="ring-num" style={{ color: score >= 0.7 ? 'var(--green)' : 'var(--amber)' }}>
            {Math.round(score * 100)}%
          </div>
          <div className="muted">{correct} / {total} correct</div>
          <p style={{ fontSize: 14, marginTop: 10 }}>
            {score >= 0.7
              ? '✅ Solid — you’re exam-ready on this module. Review any misses below.'
              : '📚 Below the 70% bar. Re-read the flagged topics, then retake.'}
          </p>
          {missedTopics.length > 0 && (
            <div className="row" style={{ justifyContent: 'center' }}>
              {[...new Set(missedTopics)].map((t) => <span key={t} className="chip">weak: {t}</span>)}
            </div>
          )}
          <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
            <button className="btn ghost sm" onClick={retake}>Retake</button>
            <button className="btn sm" onClick={onDone}>Back to dashboard</button>
          </div>
        </div>
      )}

      {module.quiz.map((q, qi) => {
        const sel = answers[q.id]
        return (
          <div className="card" key={q.id}>
            <div style={{ fontWeight: 650, fontSize: 15, marginBottom: 4 }}>
              {qi + 1}. {q.prompt}
            </div>
            {q.options.map((opt, oi) => {
              let cls = 'q-opt'
              if (submitted) {
                if (oi === q.answer) cls += ' correct'
                else if (oi === sel) cls += ' wrong'
              } else if (sel === oi) cls += ' selected'
              return (
                <button
                  key={oi}
                  className={cls}
                  disabled={submitted}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                >
                  {String.fromCharCode(65 + oi)}. {opt}
                </button>
              )
            })}
            {submitted && (
              <div className="q-exp">
                <b>{sel === q.answer ? '✓ Correct.' : '✗ Not quite.'}</b> {q.explanation}
              </div>
            )}
          </div>
        )
      })}

      {!submitted && (
        <div className="row">
          <button className="btn" disabled={!allAnswered} onClick={submit}>
            {allAnswered ? 'Submit answers' : `Answer all ${module.quiz.length} questions`}
          </button>
          <button className="btn ghost sm" onClick={onDone}>Cancel</button>
        </div>
      )}
    </div>
  )
}
