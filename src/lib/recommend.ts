import type { Progress, Module } from '../types'
import { MODULES, ALL_LESSONS } from '../data/curriculum'
import { DOMAINS } from '../data/domains'

export interface Recommendation {
  kind: 'next-lesson' | 'weak-quiz' | 'review' | 'take-quiz' | 'exam-ready' | 'start' | 'mock-exam'
  title: string
  reason: string
  /** where to send the learner */
  target: { view: 'lesson' | 'quiz' | 'flashcards' | 'exam'; id?: string }
  priority: number // higher = more urgent
}

export interface DomainReadiness {
  domainId: string
  title: string
  weight: string
  color: string
  lessonPct: number // 0..100 lessons completed in domain
  quizPct: number // 0..100 avg quiz score in domain (of quizzes taken)
  readiness: number // 0..100 blended
}

const lessonDone = (p: Progress, id: string) => Boolean(p.completedLessons[id])

/** Blended per-domain readiness: 55% lessons completed, 45% quiz performance. */
export function domainReadiness(p: Progress): DomainReadiness[] {
  return DOMAINS.map((d) => {
    const mods = MODULES.filter((m) => m.domain === d.id)
    const lessons = mods.flatMap((m) => m.lessons)
    const done = lessons.filter((l) => lessonDone(p, l.id)).length
    const lessonPct = lessons.length ? (done / lessons.length) * 100 : 0

    const modResults = p.quizResults.filter((r) => mods.some((m) => m.id === r.moduleId))
    const quizPct = modResults.length
      ? (modResults.reduce((s, r) => s + r.score, 0) / modResults.length) * 100
      : 0

    // If no quiz taken yet, don't punish readiness on the quiz axis — weight lessons fully.
    const readiness = modResults.length
      ? Math.round(lessonPct * 0.55 + quizPct * 0.45)
      : Math.round(lessonPct * 0.7)

    return {
      domainId: d.id,
      title: d.title,
      weight: d.weight,
      color: d.color,
      lessonPct: Math.round(lessonPct),
      quizPct: Math.round(quizPct),
      readiness,
    }
  })
}

/** Overall exam-readiness = weighted by the three equally-weighted domains. */
export function overallReadiness(p: Progress): number {
  const dr = domainReadiness(p)
  if (!dr.length) return 0
  return Math.round(dr.reduce((s, d) => s + d.readiness, 0) / dr.length)
}

function firstIncompleteLesson(p: Progress, m: Module) {
  return m.lessons.find((l) => !lessonDone(p, l.id))
}

/**
 * The adaptive engine. Produces a ranked list of what to do next based on:
 *  - modules with weak quiz scores (highest priority — targeted remediation)
 *  - modules fully read but not yet quizzed (take the quiz to prove it)
 *  - the next unread lesson in the learning path
 *  - spaced review when lessons are done but quizzes are stale/low
 */
export function recommend(p: Progress): Recommendation[] {
  const recs: Recommendation[] = []
  const totalDone = Object.keys(p.completedLessons).length

  // Cold start — no lessons read, no quizzes, and no exam attempts yet
  if (totalDone === 0 && p.quizResults.length === 0 && (p.examResults ?? []).length === 0) {
    const first = MODULES[0].lessons[0]
    recs.push({
      kind: 'start',
      title: `Start with “${first.title}”`,
      reason: 'Every DP-700 topic builds on Fabric’s core architecture. Begin here to build the mental model.',
      target: { view: 'lesson', id: first.id },
      priority: 100,
    })
    return recs
  }

  // 1) Weak quizzes → remediate the specific module (and point at a missed topic)
  for (const r of p.quizResults) {
    if (r.score < 0.7) {
      const m = MODULES.find((mm) => mm.id === r.moduleId)
      if (!m) continue
      const missed = r.missedTopics[0]
      const lesson =
        m.lessons.find((l) => l.keyPoints.join(' ').toLowerCase().includes((missed ?? '').toLowerCase())) ??
        m.lessons[0]
      recs.push({
        kind: 'weak-quiz',
        title: `Revisit ${m.icon} ${m.title}`,
        reason: `You scored ${Math.round(r.score * 100)}% on this quiz${
          missed ? ` — weakest area: “${missed}”` : ''
        }. Re-read, then retake to lock it in.`,
        target: { view: 'lesson', id: lesson.id },
        priority: 90 + (0.7 - r.score) * 20,
      })
    }
  }

  // 2) Module fully read but not quizzed → prove it
  for (const m of MODULES) {
    const allRead = m.lessons.every((l) => lessonDone(p, l.id))
    const quizzed = p.quizResults.some((r) => r.moduleId === m.id)
    if (allRead && !quizzed) {
      recs.push({
        kind: 'take-quiz',
        title: `Test yourself: ${m.icon} ${m.title}`,
        reason: 'You finished every lesson in this module. Take the quiz to confirm you’re exam-ready on it.',
        target: { view: 'quiz', id: m.id },
        priority: 80,
      })
    }
  }

  // 3) Continue the path → next unread lesson
  for (const m of MODULES) {
    const next = firstIncompleteLesson(p, m)
    if (next) {
      recs.push({
        kind: 'next-lesson',
        title: `Continue: “${next.title}”`,
        reason: `Next in your path (${m.icon} ${m.title}). About ${next.minutes} min.`,
        target: { view: 'lesson', id: next.id },
        priority: 70,
      })
      break // only surface the single next lesson
    }
  }

  // 4) Spaced review once you've covered a lot
  if (totalDone >= Math.ceil(ALL_LESSONS.length * 0.5)) {
    recs.push({
      kind: 'review',
      title: 'Run a flashcard review',
      reason: 'You’ve covered half the curriculum — reinforce key points with a quick spaced-repetition pass.',
      target: { view: 'flashcards' },
      priority: 50,
    })
  }

  // 5) Mock-exam nudges
  const exams = p.examResults ?? []
  const readinessNow = overallReadiness(p)
  if (exams.length === 0 && readinessNow >= 55) {
    recs.push({
      kind: 'mock-exam',
      title: 'Take your first timed practice exam',
      reason:
        'You’ve built a solid base. A timed mock reveals pacing problems and blind spots that lesson-by-lesson quizzes can’t.',
      target: { view: 'exam' },
      priority: 75,
    })
  } else if (exams.length > 0) {
    const last = exams[exams.length - 1]
    if (!last.passed) {
      recs.push({
        kind: 'mock-exam',
        title: `Retake the practice exam (last: ${Math.round(last.score * 100)}%)`,
        reason:
          'Review your missed topics first, then retake — each attempt draws a fresh random question set.',
        target: { view: 'exam' },
        priority: 65,
      })
    }
  }

  // 6) Exam-ready nudge
  const lastExam = exams[exams.length - 1]
  if (readinessNow >= 85 && lastExam?.passed) {
    recs.push({
      kind: 'exam-ready',
      title: '🎯 You’re tracking exam-ready',
      reason: 'Readiness is 85%+ and you passed a timed mock. Do a final flashcard sweep and book the real exam.',
      target: { view: 'flashcards' },
      priority: 40,
    })
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 5)
}
