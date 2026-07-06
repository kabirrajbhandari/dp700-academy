// ---- Core content model for the DP-700 curriculum ----

export type Difficulty = 'Foundation' | 'Core' | 'Advanced'

/** A single instructional block inside a lesson. */
export type Block =
  | { kind: 'text'; body: string }
  | { kind: 'heading'; text: string }
  | { kind: 'callout'; tone: 'tip' | 'warn' | 'exam' | 'info'; title: string; body: string }
  | { kind: 'steps'; title?: string; steps: Step[] }
  | { kind: 'code'; lang: string; caption?: string; code: string }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'diagram'; id: DiagramId; caption?: string }
  | { kind: 'compare'; title: string; items: { name: string; use: string; avoid: string }[] }

export interface Step {
  /** Short imperative title, e.g. "Create a workspace". */
  title: string
  /** What to do, written for a first-timer. */
  detail: string
  /** Optional UI-path breadcrumb the learner clicks through in the portal. */
  path?: string
}

/** IDs map to hand-drawn SVG instructional diagrams in components/Diagrams.tsx */
export type DiagramId =
  | 'fabric-arch'
  | 'onelake'
  | 'medallion'
  | 'lakehouse-vs-warehouse'
  | 'ingest-options'
  | 'rti-flow'
  | 'orchestration'
  | 'cicd'
  | 'monitoring'
  | 'security-layers'
  | 'star-schema'
  | 'incremental-load'

export interface Lesson {
  id: string
  title: string
  minutes: number
  summary: string
  blocks: Block[]
  /** 2–5 crisp takeaways surfaced in the review/flashcard flows. */
  keyPoints: string[]
}

export interface Module {
  id: string
  title: string
  /** Which of the 3 exam domains this maps to (for weighting the readiness score). */
  domain: DomainId
  difficulty: Difficulty
  icon: string
  blurb: string
  lessons: Lesson[]
  quiz: Question[]
}

export type DomainId = 'implement' | 'ingest' | 'monitor'

export interface Domain {
  id: DomainId
  title: string
  weight: string // e.g. "30–35%"
  color: string
  description: string
}

export interface Question {
  id: string
  /** The scenario/question stem. */
  prompt: string
  options: string[]
  answer: number // index into options
  explanation: string
  /** Tag used by the recommendation engine to point back at a lesson. */
  topic: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  moduleId: string
}

// ---- Learner progress (persisted to localStorage) ----

export interface QuizResult {
  moduleId: string
  score: number // 0..1
  correct: number
  total: number
  takenAt: number
  /** topics the learner got wrong, for targeted recommendations */
  missedTopics: string[]
}

export interface ExamResult {
  takenAt: number
  score: number // 0..1
  correct: number
  total: number
  /** per-domain breakdown, mirroring the real exam's skill-area report */
  perDomain: Record<DomainId, { correct: number; total: number }>
  missedTopics: string[]
  durationSec: number
  passed: boolean
}

export interface Progress {
  completedLessons: Record<string, number> // lessonId -> timestamp
  quizResults: QuizResult[]
  flashcardsSeen: Record<string, number>
  lastVisited?: string // lessonId
  streakDays: number
  lastActiveDay?: string // yyyy-mm-dd
  goalDate?: string // exam target date yyyy-mm-dd
  examResults?: ExamResult[]
  /** labId -> number of steps completed (steps are strictly sequential) */
  labSteps?: Record<string, number>
  /** flashcard spaced-repetition state: cardId -> scheduling info */
  cardStates?: Record<string, CardState>
}

/** SM-2-lite scheduling state for one flashcard. */
export interface CardState {
  /** next due time (ms epoch) */
  due: number
  /** current interval in days */
  interval: number
  /** consecutive successful reviews */
  streak: number
}
