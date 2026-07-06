import type { Module } from '../types'

export const modRti: Module = {
  id: 'rti',
  title: 'Implement Real-Time Intelligence',
  domain: 'ingest',
  difficulty: 'Advanced',
  icon: '⚡',
  blurb:
    'Stream, store, and act on data in motion: Eventstreams, Eventhouse/KQL, windowing functions, Real-Time Dashboards, and Activator.',
  lessons: [
    {
      id: 'rti-overview',
      title: 'The Real-Time Intelligence stack',
      minutes: 13,
      summary:
        'How Eventstream, Eventhouse (KQL DB), Real-Time Dashboards, and Activator fit together.',
      keyPoints: [
        'Eventstream = no-code ingest, transform, and route streaming events.',
        'Eventhouse contains KQL databases optimized for time-series & logs.',
        'Query with KQL; visualize with Real-Time Dashboards.',
        'Activator (Data Activator) triggers alerts/actions on patterns.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'rti-flow',
          caption: 'Sources → Eventstream → Eventhouse (KQL DB) → Real-Time Dashboard / Activator alerts.',
        },
        {
          kind: 'table',
          headers: ['Component', 'Role', 'Analogy'],
          rows: [
            ['Eventstream', 'Ingest + transform + route streams (no-code)', 'The pipes & valves'],
            ['Eventhouse / KQL DB', 'Store & query high-volume time-series', 'The reservoir'],
            ['KQL queryset', 'Author and save KQL queries', 'The SQL editor'],
            ['Real-Time Dashboard', 'Live tiles over KQL', 'The gauges'],
            ['Activator', 'Detect conditions → alert/act', 'The alarm system'],
          ],
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Choosing a streaming engine',
          body:
            'Eventstream (no-code routing/simple transforms) vs. Spark Structured Streaming (code, complex logic, joins with lakehouse data) vs. KQL (query-time analytics over ingested events). The exam asks you to pick based on transform complexity and whether you need code.',
        },
      ],
    },
    {
      id: 'rti-eventstream',
      title: 'Build an Eventstream (hands-on)',
      minutes: 15,
      summary:
        'Wire a source to a destination, add transforms, and land events in an Eventhouse.',
      keyPoints: [
        'Sources: Azure Event Hubs, IoT Hub, Kafka, CDC, sample data.',
        'Transforms: filter, aggregate, expand, join, manage fields — no code.',
        'Destinations: Eventhouse (KQL DB), Lakehouse, Activator, custom endpoint.',
      ],
      blocks: [
        {
          kind: 'steps',
          title: 'Create an Eventstream',
          steps: [
            {
              title: 'New Eventstream',
              detail: 'Create an Eventstream item in your workspace and open the editor canvas.',
              path: '+ New item → Eventstream',
            },
            {
              title: 'Add a source',
              detail:
                'Add a source such as Azure Event Hubs, Kafka, or the built-in Sample data (e.g. Yellow Taxi) to start streaming immediately.',
              path: 'Canvas → Add source',
            },
            {
              title: 'Add transformations',
              detail:
                'Drop in Filter, Aggregate (with a window), Group by, or Manage fields operators between source and destination — all no-code.',
            },
            {
              title: 'Add a destination',
              detail:
                'Route the stream to an Eventhouse/KQL DB for querying, a Lakehouse for batch, and/or an Activator for alerts. One stream can fan out to several destinations.',
              path: 'Canvas → Add destination → Eventhouse',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Native tables vs. shortcuts in RTI',
          body:
            'In an Eventhouse you can store data as native KQL tables (fastest queries, data ingested/managed by the KQL engine) or reference OneLake data via shortcuts (no copy, but query acceleration is optional). Choose native for hot, high-query streaming data; shortcut when the data already lives in OneLake and copying is undesirable.',
        },
      ],
    },
    {
      id: 'rti-kql',
      title: 'Query streams with KQL & windowing',
      minutes: 15,
      summary:
        'KQL basics plus the tumbling/hopping/sliding windows the exam calls out explicitly.',
      keyPoints: [
        'KQL flows left-to-right through | (pipe) operators.',
        'summarize by bin(Timestamp, 1m) creates tumbling time windows.',
        'Tumbling = fixed non-overlapping; Hopping = fixed size, overlapping; Session = activity gaps.',
      ],
      blocks: [
        {
          kind: 'code',
          lang: 'kql',
          caption: 'KQL: filter, then aggregate into 1-minute tumbling windows',
          code: `Taxi
| where tripDistance > 0
| summarize TotalFare = sum(fareAmount),
            Trips = count()
        by bin(pickupTime, 1m), borough    // 1-minute tumbling window
| order by pickupTime desc`,
        },
        {
          kind: 'compare',
          title: 'Windowing functions',
          items: [
            {
              name: 'Tumbling',
              use: 'Fixed-size, non-overlapping windows (e.g. count per 1 min). Each event belongs to exactly one window.',
              avoid: 'You need overlapping running metrics.',
            },
            {
              name: 'Hopping',
              use: 'Fixed-size windows that overlap by a smaller hop (e.g. 5-min window every 1 min) — smooth moving aggregates.',
              avoid: 'You want each event counted once only.',
            },
            {
              name: 'Session',
              use: 'Group events separated by gaps of inactivity (variable length) — e.g. user sessions.',
              avoid: 'Uniform time buckets are required.',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Spark Structured Streaming alternative',
          body:
            'When you need code-level control, joins with lakehouse tables, or custom stateful logic, use Spark Structured Streaming in a notebook (readStream → transform → writeStream to a Delta table with a checkpoint). Use it over Eventstream when the transform is too complex for no-code operators.',
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Recognize the windows by their shape: "count every fixed 5 minutes, no overlap" = tumbling; "5-minute average updated every minute" = hopping; "group by bursts of activity with idle gaps" = session. bin() in KQL builds tumbling windows.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-rti-1',
      prompt:
        'You need a no-code way to ingest events from Azure Event Hubs, apply a simple filter, and route them to both a KQL database and a lakehouse. What do you use?',
      options: ['A Spark notebook', 'An Eventstream', 'A Dataflow Gen2', 'COPY INTO'],
      answer: 1,
      explanation:
        'An Eventstream provides a no-code canvas to ingest streaming sources, apply simple transforms (filter/aggregate), and fan out to multiple destinations such as an Eventhouse/KQL DB and a Lakehouse.',
      topic: 'Eventstream',
    },
    {
      id: 'q-rti-2',
      prompt: 'Which KQL construct produces fixed, non-overlapping 5-minute time windows?',
      options: [
        'summarize ... by bin(Timestamp, 5m)',
        'A hopping window with hop = 1m',
        'A session window',
        'order by Timestamp',
      ],
      answer: 0,
      explanation:
        'bin(Timestamp, 5m) inside summarize buckets events into fixed 5-minute tumbling windows where each event belongs to exactly one window. Hopping windows overlap; session windows are gap-based.',
      topic: 'Windowing functions',
    },
    {
      id: 'q-rti-3',
      prompt:
        'Your streaming transformation requires joining events with lakehouse Delta tables and custom stateful logic. Which engine is most appropriate?',
      options: ['Eventstream no-code operators', 'Spark Structured Streaming in a notebook', 'A Real-Time Dashboard', 'Dynamic data masking'],
      answer: 1,
      explanation:
        'Complex, code-level streaming with joins to lakehouse tables and custom state is best handled by Spark Structured Streaming (readStream/writeStream with checkpoints), which exceeds what no-code Eventstream operators offer.',
      topic: 'Choosing a streaming engine',
    },
    {
      id: 'q-rti-4',
      prompt: 'Which Fabric Real-Time Intelligence component detects a condition in streaming data and triggers an alert or action?',
      options: ['Eventhouse', 'Activator', 'KQL queryset', 'Semantic model'],
      answer: 1,
      explanation:
        'Activator (Data Activator) monitors streams/queries for patterns or thresholds and automatically triggers alerts or downstream actions (email, Teams, pipeline, Power Automate).',
      topic: 'Activator',
    },
  ],
}
