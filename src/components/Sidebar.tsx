import { MODULES, FLASHCARDS } from '../data/curriculum'
import { DOMAINS } from '../data/domains'
import { LABS, TOTAL_LAB_STEPS } from '../data/labs'
import type { ProgressApi } from '../lib/progress'
import type { View } from '../App'

interface Props {
  view: View
  currentLessonId?: string
  api: ProgressApi
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  goDashboard: () => void
  goLesson: (id: string) => void
  goFlashcards: () => void
  goExam: () => void
  goLabs: () => void
  goReference: () => void
}

export function Sidebar({
  view, currentLessonId, api, theme, onToggleTheme, goDashboard, goLesson, goFlashcards, goExam, goLabs, goReference,
}: Props) {
  const p = api.progress
  const now = Date.now()
  const dueCards = FLASHCARDS.filter((c) => (p.cardStates?.[c.id]?.due ?? 0) <= now).length
  const labStepsDone = LABS.reduce((s, l) => s + (p.labSteps?.[l.id] ?? 0), 0)

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo">🧵</span>
        <div>
          <h1>Fabric Forge</h1>
          <small>DP-700 Academy</small>
        </div>
        <div className="spacer" />
        <button className="toggle" title="Toggle theme" onClick={onToggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="nav-section">Home</div>
      <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={goDashboard}>
        <span className="ico">📊</span> Dashboard
      </div>
      <div className={`nav-item ${view === 'flashcards' ? 'active' : ''}`} onClick={goFlashcards}>
        <span className="ico">🃏</span> Flashcards
        {dueCards > 0 && <span className="cnt" style={{ color: 'var(--amber)' }}>{dueCards} due</span>}
      </div>
      <div className={`nav-item ${view === 'labs' ? 'active' : ''}`} onClick={goLabs}>
        <span className="ico">🧪</span> Scenario labs
        <span className="cnt">{labStepsDone}/{TOTAL_LAB_STEPS}</span>
      </div>
      <div className={`nav-item ${view === 'reference' ? 'active' : ''}`} onClick={goReference}>
        <span className="ico">📚</span> Reference
      </div>
      <div className={`nav-item ${view === 'exam' ? 'active' : ''}`} onClick={goExam}>
        <span className="ico">🎯</span> Practice exam
        {(p.examResults?.length ?? 0) > 0 && (
          <span className="cnt">best {Math.round(Math.max(...p.examResults!.map((r) => r.score)) * 100)}%</span>
        )}
      </div>

      {DOMAINS.map((d) => {
        const mods = MODULES.filter((m) => m.domain === d.id)
        return (
          <div key={d.id}>
            <div className="nav-section">
              <span className="tag-dom" style={{ background: d.color, marginRight: 6 }} />
              {d.title} · {d.weight}
            </div>
            {mods.map((m) => {
              const doneInMod = m.lessons.filter((l) => p.completedLessons[l.id]).length
              const allDone = doneInMod === m.lessons.length
              const activeMod = m.lessons.some((l) => l.id === currentLessonId)
              return (
                <div key={m.id}>
                  <div
                    className={`nav-item ${activeMod && view === 'lesson' ? 'active' : ''}`}
                    onClick={() => goLesson(m.lessons[0].id)}
                    title={m.blurb}
                  >
                    <span className="ico">{m.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
                    {allDone ? <span className="nav-check">✓</span> : <span className="cnt">{doneInMod}/{m.lessons.length}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      <div className="divider" />
      <div className="nav-item" onClick={() => { if (confirm('Reset all progress? This clears completed lessons and quiz scores.')) api.reset() }}>
        <span className="ico">🗑️</span> <span className="muted">Reset progress</span>
      </div>
    </aside>
  )
}
