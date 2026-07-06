import type { Module } from '../types'

export const modOrchestration: Module = {
  id: 'orchestration',
  title: 'Orchestrate Processes',
  domain: 'implement',
  difficulty: 'Core',
  icon: '🎼',
  blurb:
    'Choose between pipelines, Dataflows, and notebooks; schedule and event-trigger them; and build robust orchestration patterns.',
  lessons: [
    {
      id: 'or-choose',
      title: 'Pipeline vs. Dataflow vs. Notebook for orchestration',
      minutes: 11,
      summary:
        'When to orchestrate with a pipeline, transform with a Dataflow, or code with a notebook.',
      keyPoints: [
        'Pipeline orchestrates & moves; it calls Dataflows, notebooks, procs.',
        'Dataflow Gen2 = low-code transform; not a general orchestrator.',
        'Notebook = code-first compute; scheduled directly or called by a pipeline.',
      ],
      blocks: [
        {
          kind: 'compare',
          title: 'Three tools, three jobs',
          items: [
            {
              name: 'Data pipeline',
              use: 'Orchestrate multiple steps, move data (Copy), branch on success/failure, loop, schedule, and trigger on events.',
              avoid: 'Rich row-level transforms — delegate those to a Dataflow or notebook activity.',
            },
            {
              name: 'Dataflow Gen2',
              use: 'Low-code Power Query transforms with many connectors, landing to a lakehouse/warehouse.',
              avoid: 'Complex orchestration/branching or huge-scale compute.',
            },
            {
              name: 'Notebook',
              use: 'Custom, large-scale Spark transforms and logic; can be scheduled or invoked by a pipeline with parameters.',
              avoid: 'Pure citizen-developer, no-code scenarios.',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'The classic combo: a pipeline orchestrates the run, a Copy activity lands raw data, a Notebook activity transforms it, and a Dataflow feeds a low-code refined layer — all scheduled/triggered by the pipeline.',
        },
      ],
    },
    {
      id: 'or-triggers',
      title: 'Schedules, event triggers & parameters',
      minutes: 13,
      summary:
        'Time-based schedules, event-based triggers, and passing parameters/dynamic expressions.',
      keyPoints: [
        'Schedule = time-based (cron-like) recurrence.',
        'Event trigger = run on a OneLake/storage event (file arrival) via Activator/reflex.',
        'Parameters + dynamic content (@pipeline(), @variables()) make runs reusable.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'orchestration',
          caption: 'A trigger starts the pipeline; parameters drive which data each activity processes.',
        },
        {
          kind: 'table',
          headers: ['Trigger type', 'Fires when', 'Use for'],
          rows: [
            ['Scheduled', 'A time recurrence hits (e.g. daily 02:00)', 'Nightly batch loads'],
            ['Event-based', 'A file lands / storage event occurs', 'Ingest as soon as data arrives'],
            ['Manual', 'You click Run', 'Testing / ad-hoc'],
          ],
        },
        {
          kind: 'code',
          lang: 'text',
          caption: 'Dynamic content examples',
          code: `Source folder:   Files/raw/@{formatDateTime(pipeline().parameters.loadDate,'yyyy/MM/dd')}
Table name:      @{variables('targetTable')}
Filter (query):  WHERE ModifiedDate > '@{pipeline().parameters.watermark}'`,
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Orchestration patterns',
          body:
            'Use ForEach to fan a load over many tables, If Condition to branch, Lookup to read a watermark/control table, and On failure paths to send alerts. A metadata-driven pipeline reads a control table and loops — one pipeline loads dozens of tables.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-or-1',
      prompt:
        'You need to run an ingestion the moment a new file lands in OneLake, rather than on a fixed schedule. What do you configure?',
      options: ['A manual trigger', 'A scheduled (time) trigger', 'An event-based trigger', 'A Viewer role'],
      answer: 2,
      explanation:
        'An event-based trigger fires on a storage/OneLake event (such as a file arrival), so the pipeline runs as soon as data appears rather than waiting for a scheduled time.',
      topic: 'Triggers',
    },
    {
      id: 'q-or-2',
      prompt:
        'To load 40 tables with one reusable pipeline that reads table names from a control table and loops over them, which activity is central?',
      options: ['ForEach (with a Lookup feeding it)', 'A single Copy activity', 'A Dataflow Gen2', 'Set variable only'],
      answer: 0,
      explanation:
        'A metadata-driven pattern uses Lookup to read the control table and ForEach to iterate, running the Copy/transform per table — one pipeline serves many tables via parameters/dynamic content.',
      topic: 'Orchestration patterns',
    },
    {
      id: 'q-or-3',
      prompt: 'Which statement best distinguishes a Dataflow Gen2 from a data pipeline?',
      options: [
        'A Dataflow orchestrates multi-step runs; a pipeline only transforms',
        'A pipeline orchestrates and moves data; a Dataflow does low-code Power Query transforms',
        'They are identical',
        'A Dataflow can trigger on events; a pipeline cannot',
      ],
      answer: 1,
      explanation:
        'Pipelines orchestrate and move data (and can call other activities); Dataflows Gen2 are low-code Power Query transformation tools. A pipeline can even invoke a Dataflow as one of its activities.',
      topic: 'Pipeline vs Dataflow',
    },
  ],
}
