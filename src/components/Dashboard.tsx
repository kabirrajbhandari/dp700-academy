import type { ProgressApi } from '../lib/progress'
import { MODULES, TOTAL_LESSONS, ALL_LESSONS, moduleOfLesson } from '../data/curriculum'
import { recommend, domainReadiness, overallReadiness } from '../lib/recommend'
import type { Recommendation } from '../lib/recommend'
import { EXAM_LINKS } from '../data/resources'

interface Props {
  api: ProgressApi
  goLesson: (id: string) => void
  goQuiz: (moduleId: string) => void
  goFlashcards: () => void
  goExam: () => void
}

const REC_ICON: Record<Recommendation['kind'], string> = {
  start: '🚀', 'weak-quiz': '🎯', 'take-quiz': '📝', 'next-lesson': '▶️', review: '🔁', 'exam-ready': '🏅', 'mock-exam': '⏱️',
}

function Ring({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 34, c = 2 * Math.PI * r, off = c - (pct / 100) * c
  return (
    <div className="stat">
      <svg width={92} height={92} viewBox="0 0 92 92">
        <circle cx={46} cy={46} r={r} fill="none" stroke="var(--panel-2)" strokeWidth={9} />
        <circle
          cx={46} cy={46} r={r} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 46 46)"
          style={{ transition: 'stroke-dashoffset 0.6s' }}
        />
        <text x={46} y={52} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--text)">{pct}%</text>
      </svg>
      <div className="l" style={{ marginTop: 4 }}>{label}</div>
    </div>
  )
}

export function Dashboard({ api, goLesson, goQuiz, goFlashcards, goExam }: Props) {
  const p = api.progress
  const recs = recommend(p)
  const readiness = domainReadiness(p)
  const overall = overallReadiness(p)
  const doneCount = Object.keys(p.completedLessons).length
  const donePct = Math.round((doneCount / TOTAL_LESSONS) * 100)
  const quizzesTaken = p.quizResults.length
  const avgQuiz = quizzesTaken
    ? Math.round((p.quizResults.reduce((s, r) => s + r.score, 0) / quizzesTaken) * 100)
    : 0

  const daysLeft = p.goalDate
    ? Math.ceil((new Date(p.goalDate + 'T00:00:00').getTime() - Date.now()) / 86400000)
    : null

  // Continue-where-you-left-off: last visited lesson, else the first lesson.
  const continueLesson =
    ALL_LESSONS.find((l) => l.id === p.lastVisited) ?? ALL_LESSONS.find((l) => !p.completedLessons[l.id])
  const continueModule = continueLesson ? moduleOfLesson(continueLesson.id) : undefined

  // Focus areas: weak topics aggregated across every quiz taken, worst first.
  const focusAreas = p.quizResults
    .flatMap((r) => [...new Set(r.missedTopics)].map((t) => ({ topic: t, moduleId: r.moduleId, score: r.score })))
    .sort((a, b) => a.score - b.score)
    .slice(0, 6)

  function act(r: Recommendation) {
    if (r.target.view === 'lesson' && r.target.id) goLesson(r.target.id)
    else if (r.target.view === 'quiz' && r.target.id) goQuiz(r.target.id)
    else if (r.target.view === 'flashcards') goFlashcards()
    else if (r.target.view === 'exam') goExam()
  }

  const lastExam = (p.examResults ?? [])[p.examResults ? p.examResults.length - 1 : 0]

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 style={{ margin: 0 }}>Your DP-700 journey</h2>
        <span className="pill">🔥 {p.streakDays}-day streak</span>
      </div>
      <p className="muted" style={{ marginTop: 2 }}>
        Implementing Data Engineering Solutions Using Microsoft Fabric — {MODULES.length} modules, {TOTAL_LESSONS} lessons.
      </p>

      {/* Continue hero */}
      {continueLesson && continueModule && doneCount < TOTAL_LESSONS && (
        <div className="hero-continue">
          <span style={{ fontSize: 26 }}>{continueModule.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {p.lastVisited ? 'Continue where you left off' : 'Begin your journey'}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              {continueLesson.title} · {continueModule.title} · ⏱ {continueLesson.minutes} min
            </div>
          </div>
          <button className="btn" onClick={() => goLesson(continueLesson.id)}>
            {p.lastVisited ? 'Resume →' : 'Start →'}
          </button>
        </div>
      )}

      {/* Readiness */}
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 className="block-heading" style={{ margin: 0 }}>🎓 Exam readiness</h3>
          <span className="row" style={{ gap: 8 }}>
            {lastExam && (
              <span className="pill" style={{ color: lastExam.passed ? 'var(--green)' : 'var(--red)' }}>
                ⏱ last mock: {Math.round(lastExam.score * 100)}% {lastExam.passed ? '· pass' : '· fail'}
              </span>
            )}
            <span className="muted" style={{ fontSize: 12.5 }}>
              {overall >= 85 ? 'On track — book the exam' : overall >= 50 ? 'Making progress' : 'Just getting started'}
            </span>
          </span>
        </div>
        <div className="grid grid-2" style={{ alignItems: 'center', marginTop: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <Ring pct={overall} color="var(--accent)" label="Overall readiness" />
          </div>
          <div className="grid grid-3">
            {readiness.map((d) => <Ring key={d.domainId} pct={d.readiness} color={d.color} label={d.title.split(' ').slice(0, 2).join(' ')} />)}
          </div>
        </div>
        <div className="divider" />
        <div className="grid grid-3">
          <div className="stat"><div className="n">{doneCount}/{TOTAL_LESSONS}</div><div className="l">Lessons done</div></div>
          <div className="stat"><div className="n">{quizzesTaken}/{MODULES.length}</div><div className="l">Quizzes taken</div></div>
          <div className="stat"><div className="n">{avgQuiz}%</div><div className="l">Avg quiz score</div></div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="block-heading" style={{ marginTop: 0 }}>🤖 Recommended for you</h3>
        <p className="muted" style={{ fontSize: 12.5, marginTop: -4 }}>
          Adaptive next steps based on what you’ve read and how you scored.
        </p>
        {recs.map((r, i) => (
          <div className="rec-item" key={i}>
            <div className="rec-ico">{REC_ICON[r.kind]}</div>
            <div style={{ flex: 1 }}>
              <div className="rec-title">{r.title}</div>
              <div className="rec-reason">{r.reason}</div>
            </div>
            <button className="btn sm" onClick={() => act(r)}>Go</button>
          </div>
        ))}
      </div>

      {/* Focus areas from quiz misses */}
      {focusAreas.length > 0 && (
        <div className="card">
          <h3 className="block-heading" style={{ marginTop: 0 }}>🧭 Focus areas</h3>
          <p className="muted" style={{ fontSize: 12.5, marginTop: -4 }}>
            Topics you missed in quizzes, weakest module first. Review, then retake that quiz.
          </p>
          <div>
            {focusAreas.map((f, i) => {
              const m = MODULES.find((mm) => mm.id === f.moduleId)
              if (!m) return null
              return (
                <span className="focus-chip" key={i}>
                  {m.icon} {f.topic}
                  <button onClick={() => goLesson(m.lessons[0].id)}>Review</button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Official exam resources */}
      <div className="card">
        <h3 className="block-heading" style={{ marginTop: 0 }}>🎓 Official exam resources</h3>
        <ul className="res-list">
          {EXAM_LINKS.map((r, i) => (
            <li key={i}>
              <span className="res-kind">{r.kind === 'Video' ? '▶ Video' : '🎓 Learn'}</span>
              <a className="link" href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Overall progress + goal */}
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 className="block-heading" style={{ margin: 0 }}>Curriculum progress</h3>
          <span className="muted" style={{ fontSize: 12.5 }}>{donePct}% · {ALL_LESSONS.length} lessons</span>
        </div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${donePct}%` }} /></div>
        <div className="row" style={{ marginTop: 14 }}>
          <label className="muted" style={{ fontSize: 13 }}>🗓 Exam goal date:</label>
          <input
            type="date"
            className="toggle"
            style={{ fontSize: 13 }}
            value={p.goalDate ?? ''}
            onChange={(e) => api.setGoalDate(e.target.value || undefined)}
          />
          {daysLeft !== null && (
            <span className="pill">{daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? 'Exam is today!' : 'date passed'}</span>
          )}
          {p.goalDate && daysLeft !== null && daysLeft > 0 && (
            <span className="muted" style={{ fontSize: 12.5 }}>
              ≈ {Math.max(1, Math.ceil((TOTAL_LESSONS - doneCount) / Math.max(1, daysLeft)))} lessons/day to finish in time
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
