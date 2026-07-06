import { useState } from 'react'
import { LABS, type Lab, type LabStep } from '../data/labs'
import type { ProgressApi } from '../lib/progress'

export function LabsView({ api }: { api: ProgressApi }) {
  const [openLab, setOpenLab] = useState<string | null>(null)
  const lab = LABS.find((l) => l.id === openLab)
  if (lab) return <LabRunner lab={lab} api={api} onBack={() => setOpenLab(null)} />

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>🧪 Scenario labs</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Fabrikam’s real project, step by step. Do each step in your own Fabric trial tenant, then pass the
        checkpoint to unlock the next. Labs build on each other — take them in order.
      </p>
      {LABS.map((l) => {
        const done = api.progress.labSteps?.[l.id] ?? 0
        const pct = Math.round((done / l.steps.length) * 100)
        return (
          <div className="card" key={l.id}>
            <div className="row">
              <span style={{ fontSize: 26 }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{l.title}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{l.scenario}</div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <div className="bar" style={{ flex: 1 }}><i style={{ width: `${pct}%` }} /></div>
              <span className="pill">{done}/{l.steps.length} steps</span>
              <span className="pill">⏱ ~{l.minutes} min</span>
              <button className="btn sm" onClick={() => setOpenLab(l.id)}>
                {done === 0 ? 'Start lab' : done === l.steps.length ? 'Review ✓' : 'Continue'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LabRunner({ lab, api, onBack }: { lab: Lab; api: ProgressApi; onBack: () => void }) {
  const done = api.progress.labSteps?.[lab.id] ?? 0

  return (
    <div>
      <button className="btn ghost sm" onClick={onBack}>← All labs</button>
      <h2 style={{ margin: '12px 0 4px' }}>{lab.icon} {lab.title}</h2>
      <p className="muted" style={{ marginTop: 2 }}>{lab.scenario}</p>
      <div className="callout info" style={{ marginTop: 10 }}>
        <div className="c-title"><span>🏁</span>Outcome</div>
        {lab.outcome}
      </div>

      {lab.steps.map((s, i) => (
        <LabStepCard
          key={i}
          step={s}
          index={i}
          state={i < done ? 'done' : i === done ? 'current' : 'locked'}
          onComplete={() => api.completeLabStep(lab.id, i)}
        />
      ))}

      {done === lab.steps.length && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 34 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>Lab complete!</div>
          <p className="muted" style={{ fontSize: 13.5 }}>{lab.outcome}</p>
          <button className="btn sm" onClick={onBack}>Back to labs</button>
        </div>
      )}
    </div>
  )
}

function LabStepCard({
  step, index, state, onComplete,
}: { step: LabStep; index: number; state: 'done' | 'current' | 'locked'; onComplete: () => void }) {
  const [sel, setSel] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  const correct = step.checkpoint && sel === step.checkpoint.answer

  function check() {
    setChecked(true)
    if (step.checkpoint && sel === step.checkpoint.answer) onComplete()
  }

  if (state === 'locked') {
    return (
      <div className="card lab-locked">
        <div className="row">
          <span className="lab-num">🔒</span>
          <span className="muted" style={{ fontWeight: 600 }}>Step {index + 1} · {step.title}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${state === 'done' ? 'lab-done' : ''}`}>
      <div className="row" style={{ marginBottom: state === 'done' ? 0 : 8 }}>
        <span className="lab-num" style={{ background: state === 'done' ? 'var(--green)' : 'var(--accent)' }}>
          {state === 'done' ? '✓' : index + 1}
        </span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{step.title}</span>
      </div>

      {state === 'current' && (
        <>
          <p className="block-text" style={{ marginTop: 4 }}>{step.instruction}</p>
          {step.path && <div className="s-path">{step.path}</div>}
          {step.code && (
            <pre className="code" style={{ marginTop: 10 }}><code>{step.code.code}</code></pre>
          )}

          {step.checkpoint ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 650, fontSize: 14, marginBottom: 4 }}>
                ✅ Checkpoint: {step.checkpoint.prompt}
              </div>
              {step.checkpoint.options.map((opt, oi) => {
                let cls = 'q-opt'
                if (checked && step.checkpoint) {
                  if (oi === step.checkpoint.answer && sel === oi) cls += ' correct'
                  else if (oi === sel) cls += ' wrong'
                } else if (sel === oi) cls += ' selected'
                return (
                  <button key={oi} className={cls} onClick={() => { setSel(oi); setChecked(false) }}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                )
              })}
              {checked && step.checkpoint && (
                <div className="q-exp">
                  <b>{correct ? '✓ Correct — step unlocked.' : '✗ Not quite — re-read the step and try again.'}</b>{' '}
                  {correct ? step.checkpoint.explanation : ''}
                </div>
              )}
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn sm" disabled={sel === null} onClick={check}>Check answer</button>
              </div>
            </div>
          ) : (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn sm" onClick={onComplete}>I’ve done this — next step →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
