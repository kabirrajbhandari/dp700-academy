import type { Module, Flashcard, Lesson } from '../types'
import { modArchitecture } from './mod-architecture'
import { modLakehouse } from './mod-lakehouse'
import { modIngest } from './mod-ingest'
import { modTransform } from './mod-transform'
import { modWarehouse } from './mod-warehouse'
import { modRti } from './mod-rti'
import { modOrchestration } from './mod-orchestration'
import { modManage } from './mod-manage'
import { modMonitor } from './mod-monitor'

/** Ordered for a coherent learning journey: concepts → build → operate. */
export const MODULES: Module[] = [
  modArchitecture,
  modLakehouse,
  modIngest,
  modTransform,
  modWarehouse,
  modRti,
  modOrchestration,
  modManage,
  modMonitor,
]

export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons)
export const TOTAL_LESSONS = ALL_LESSONS.length
export const TOTAL_MINUTES = ALL_LESSONS.reduce((s, l) => s + l.minutes, 0)
export const TOTAL_QUIZ_QUESTIONS = MODULES.reduce((s, m) => s + m.quiz.length, 0)

export function getModule(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id)
}

export function moduleOfLesson(lessonId: string): Module | undefined {
  return MODULES.find((m) => m.lessons.some((l) => l.id === lessonId))
}

/** Flashcards are derived from every lesson's keyPoints so review stays in sync with content. */
export const FLASHCARDS: Flashcard[] = MODULES.flatMap((m) =>
  m.lessons.flatMap((l) =>
    l.keyPoints.map((kp, i) => ({
      id: `${l.id}-fc-${i}`,
      front: `${m.icon} ${l.title}`,
      back: kp,
      moduleId: m.id,
    })),
  ),
)
