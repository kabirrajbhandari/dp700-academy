import { useCallback, useEffect, useState } from 'react'
import type { Progress, QuizResult, ExamResult, CardState } from '../types'

const KEY = 'dp700.progress.v1'

const EMPTY: Progress = {
  completedLessons: {},
  quizResults: [],
  flashcardsSeen: {},
  streakDays: 0,
}

function todayStr(): string {
  // Local calendar day; avoids Date.now determinism issues in normal app runtime.
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    return { ...EMPTY, ...(JSON.parse(raw) as Progress) }
  } catch {
    return { ...EMPTY }
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage may be unavailable (private mode) — degrade gracefully */
  }
}

/** Single source of truth for learner progress, persisted to localStorage. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)

  // Maintain a simple day-streak whenever the app is opened.
  useEffect(() => {
    setProgress((prev) => {
      const today = todayStr()
      if (prev.lastActiveDay === today) return prev
      const y = new Date()
      y.setDate(y.getDate() - 1)
      const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
      const streak = prev.lastActiveDay === yStr ? prev.streakDays + 1 : 1
      const next = { ...prev, lastActiveDay: today, streakDays: streak }
      save(next)
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = useCallback((mut: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = mut(prev)
      save(next)
      return next
    })
  }, [])

  const completeLesson = useCallback(
    (lessonId: string) =>
      update((p) => ({
        ...p,
        completedLessons: { ...p.completedLessons, [lessonId]: Date.now() },
        lastVisited: lessonId,
      })),
    [update],
  )

  const uncompleteLesson = useCallback(
    (lessonId: string) =>
      update((p) => {
        const c = { ...p.completedLessons }
        delete c[lessonId]
        return { ...p, completedLessons: c }
      }),
    [update],
  )

  const recordQuiz = useCallback(
    (result: QuizResult) =>
      update((p) => ({
        ...p,
        // keep only the most recent result per module + full history append
        quizResults: [...p.quizResults.filter((r) => r.moduleId !== result.moduleId), result],
      })),
    [update],
  )

  const recordExam = useCallback(
    (result: ExamResult) =>
      update((p) => ({
        ...p,
        examResults: [...(p.examResults ?? []), result],
      })),
    [update],
  )

  const markFlashcard = useCallback(
    (id: string) =>
      update((p) => ({
        ...p,
        flashcardsSeen: { ...p.flashcardsSeen, [id]: Date.now() },
      })),
    [update],
  )

  const completeLabStep = useCallback(
    (labId: string, stepIndex: number) =>
      update((p) => {
        const cur = p.labSteps?.[labId] ?? 0
        // steps are sequential; only advance if this is the next step
        if (stepIndex !== cur) return p
        return { ...p, labSteps: { ...(p.labSteps ?? {}), [labId]: cur + 1 } }
      }),
    [update],
  )

  const gradeCard = useCallback(
    (id: string, state: CardState) =>
      update((p) => ({
        ...p,
        cardStates: { ...(p.cardStates ?? {}), [id]: state },
        flashcardsSeen: { ...p.flashcardsSeen, [id]: Date.now() },
      })),
    [update],
  )

  const setGoalDate = useCallback(
    (goalDate?: string) => update((p) => ({ ...p, goalDate })),
    [update],
  )

  const setLastVisited = useCallback(
    (lessonId: string) => update((p) => ({ ...p, lastVisited: lessonId })),
    [update],
  )

  const reset = useCallback(() => {
    save(EMPTY)
    setProgress({ ...EMPTY })
  }, [])

  return {
    progress,
    completeLesson,
    uncompleteLesson,
    recordQuiz,
    recordExam,
    markFlashcard,
    completeLabStep,
    gradeCard,
    setGoalDate,
    setLastVisited,
    reset,
  }
}

export type ProgressApi = ReturnType<typeof useProgress>
