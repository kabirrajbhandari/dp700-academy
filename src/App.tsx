import { useEffect, useState } from 'react'
import { useProgress } from './lib/progress'
import { MODULES, ALL_LESSONS, moduleOfLesson, getModule } from './data/curriculum'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { LessonView } from './components/LessonView'
import { QuizView } from './components/QuizView'
import { Flashcards } from './components/Flashcards'
import { ExamView } from './components/ExamView'
import { LabsView } from './components/LabsView'
import { ReferenceView } from './components/ReferenceView'

export type View = 'dashboard' | 'lesson' | 'quiz' | 'flashcards' | 'exam' | 'labs' | 'reference'

export default function App() {
  const api = useProgress()

  const [view, setView] = useState<View>('dashboard')
  const [lessonId, setLessonId] = useState<string>(ALL_LESSONS[0].id)
  const [quizModuleId, setQuizModuleId] = useState<string>(MODULES[0].id)

  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('dp700.theme') as 'light' | 'dark') || 'light',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('dp700.theme', theme)
  }, [theme])

  const goLesson = (id: string) => { setLessonId(id); setView('lesson') }
  const goQuiz = (moduleId: string) => { setQuizModuleId(moduleId); setView('quiz') }
  const goDashboard = () => setView('dashboard')
  const goFlashcards = () => setView('flashcards')
  const goExam = () => setView('exam')
  const goLabs = () => setView('labs')
  const goReference = () => setView('reference')

  // Lesson navigation across the whole flattened curriculum
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId)
  const currentLesson = ALL_LESSONS[idx]
  const currentModule = moduleOfLesson(lessonId)

  function navLesson(dir: 'prev' | 'next') {
    const ni = dir === 'next' ? idx + 1 : idx - 1
    if (ni >= 0 && ni < ALL_LESSONS.length) goLesson(ALL_LESSONS[ni].id)
  }

  // Is the next lesson still inside the same module? If not, the "Next" button
  // in a lesson should offer the quiz instead.
  const nextInSameModule =
    idx + 1 < ALL_LESSONS.length && moduleOfLesson(ALL_LESSONS[idx + 1].id)?.id === currentModule?.id

  return (
    <div className="app">
      <Sidebar
        view={view}
        currentLessonId={lessonId}
        api={api}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        goDashboard={goDashboard}
        goLesson={goLesson}
        goFlashcards={goFlashcards}
        goExam={goExam}
        goLabs={goLabs}
        goReference={goReference}
      />

      <main className="main">
        {view === 'dashboard' && (
          <Dashboard api={api} goLesson={goLesson} goQuiz={goQuiz} goFlashcards={goFlashcards} goExam={goExam} />
        )}

        {view === 'lesson' && currentLesson && currentModule && (
          <LessonView
            module={currentModule}
            lesson={currentLesson}
            api={api}
            hasPrev={idx > 0}
            hasNext={nextInSameModule}
            onNav={navLesson}
            onTakeQuiz={() => goQuiz(currentModule.id)}
          />
        )}

        {view === 'quiz' && (
          <QuizView module={getModule(quizModuleId)!} api={api} onDone={goDashboard} />
        )}

        {view === 'flashcards' && <Flashcards api={api} />}

        {view === 'exam' && <ExamView api={api} onExit={goDashboard} />}

        {view === 'labs' && <LabsView api={api} />}

        {view === 'reference' && <ReferenceView />}
      </main>
    </div>
  )
}
