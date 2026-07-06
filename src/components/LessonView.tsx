import { useEffect, useState } from 'react'
import type { Module, Lesson } from '../types'
import { TutorPanel } from './TutorPanel'
import type { ProgressApi } from '../lib/progress'
import { DOMAINS } from '../data/domains'
import { SCENARIOS } from '../data/scenarios'
import { RESOURCES } from '../data/resources'
import { BlockView } from './Blocks'

interface Props {
  module: Module
  lesson: Lesson
  api: ProgressApi
  onNav: (dir: 'prev' | 'next') => void
  onTakeQuiz: () => void
  hasPrev: boolean
  hasNext: boolean
}

export function LessonView({ module, lesson, api, onNav, onTakeQuiz, hasPrev, hasNext }: Props) {
  const done = Boolean(api.progress.completedLessons[lesson.id])
  const domain = DOMAINS.find((d) => d.id === module.domain)!
  const [tutorOpen, setTutorOpen] = useState(false)

  useEffect(() => {
    api.setLastVisited(lesson.id)
    window.scrollTo({ top: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  return (
    <div className="lesson">
      <div className="row" style={{ marginBottom: 14 }}>
        <span className="pill dom" style={{ background: domain.color }}>{module.icon} {module.title}</span>
        <span className="pill">{module.difficulty}</span>
        <span className="pill">⏱ {lesson.minutes} min</span>
        <div className="spacer" />
        <button className="btn ghost sm" onClick={() => setTutorOpen(true)}>🤖 Ask tutor</button>
      </div>

      {tutorOpen && <TutorPanel module={module} lesson={lesson} onClose={() => setTutorOpen(false)} />}

      <h2>{lesson.title}</h2>
      <p className="summary">{lesson.summary}</p>

      {SCENARIOS[lesson.id] && (
        <div className="scenario">
          <div className="sc-ico">🏔️</div>
          <div>
            <div className="sc-label">Real-world use case · Fabrikam Outdoor Gear</div>
            <div className="sc-body">{SCENARIOS[lesson.id]}</div>
          </div>
        </div>
      )}

      <div className="card">
        {lesson.blocks.map((b, i) => <BlockView key={i} block={b} />)}
      </div>

      <div className="card">
        <h3 className="block-heading" style={{ marginTop: 0 }}>🔑 Key takeaways</h3>
        <ul className="keypoints">
          {lesson.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
        </ul>
      </div>

      {RESOURCES[module.id] && (
        <div className="card">
          <h3 className="block-heading" style={{ marginTop: 0 }}>📚 Go deeper — trusted references</h3>
          <p className="muted" style={{ fontSize: 12.5, marginTop: -4 }}>
            Official Microsoft Learn docs and video starting points for this module.
          </p>
          <ul className="res-list">
            {RESOURCES[module.id].map((r, i) => (
              <li key={i}>
                <span className="res-kind">{r.kind === 'Video' ? '▶ Video' : r.kind === 'Learn' ? '🎓 Learn' : '📄 Docs'}</span>
                <a className="link" href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="row">
        <button
          className={done ? 'btn ghost' : 'btn'}
          onClick={() => (done ? api.uncompleteLesson(lesson.id) : api.completeLesson(lesson.id))}
        >
          {done ? '✓ Completed — mark incomplete' : 'Mark lesson complete'}
        </button>
        <div className="spacer" />
        <button className="btn ghost sm" disabled={!hasPrev} onClick={() => onNav('prev')}>← Prev</button>
        {hasNext ? (
          <button className="btn sm" onClick={() => onNav('next')}>Next lesson →</button>
        ) : (
          <button className="btn sm" onClick={onTakeQuiz}>Take module quiz →</button>
        )}
      </div>
    </div>
  )
}
