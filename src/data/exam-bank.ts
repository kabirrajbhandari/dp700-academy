import type { Question, DomainId } from '../types'
import { MODULES } from './curriculum'
import { BANK_IMPLEMENT } from './exam-implement'
import { BANK_INGEST } from './exam-ingest'
import { BANK_MONITOR } from './exam-monitor'

/** A question tagged with the exam domain it belongs to. */
export type ExamQuestion = Question & { domain: DomainId }

/**
 * Supplementary exam-style questions (beyond the module quizzes) so the
 * practice exam can sample a deep, balanced pool. Written to the same
 * standard as the module quizzes: scenario stem, one defensible answer,
 * explanation, and a topic tag for the recommendation engine.
 */
export const EXAM_BANK: ExamQuestion[] = [
  // ─── Domain 1: Implement & manage an analytics solution ───
  {
    id: 'xb-imp-1',
    domain: 'implement',
    prompt:
      'Data engineers complain that ad-hoc notebook sessions take minutes to start. You want new Spark sessions in the workspace to start in seconds with default settings. What should you use?',
    options: [
      'A custom Spark pool with large nodes',
      'Starter pools',
      'A bigger F-SKU',
      'A high-concurrency warehouse',
    ],
    answer: 1,
    explanation:
      'Starter pools are pre-warmed, always-ready Spark pools that give fast (seconds) session startup with default configurations. Custom pools allow tailored sizes but nodes must spin up, which is slower.',
    topic: 'Spark workspace settings',
  },
  {
    id: 'xb-imp-2',
    domain: 'implement',
    prompt:
      'Your organization wants Sales and Finance workspaces grouped so each business area can manage its own data estate in a data-mesh style. What Fabric feature do you configure?',
    options: ['Deployment pipelines', 'Domains', 'Sensitivity labels', 'Starter pools'],
    answer: 1,
    explanation:
      'Domains group workspaces by business area and support federated (data mesh) governance, letting each area manage its own data products.',
    topic: 'Domains',
  },
  {
    id: 'xb-imp-3',
    domain: 'implement',
    prompt:
      'A deployment pipeline promotes a pipeline item from Dev to Prod, but in Prod it must read from the production lakehouse instead of the dev lakehouse. How do you handle this without editing the item after each deployment?',
    options: [
      'Manually edit the connection after every deploy',
      'Configure a deployment rule on the Prod stage',
      'Use a different Git branch',
      'Duplicate the pipeline per stage',
    ],
    answer: 1,
    explanation:
      'Deployment rules define stage-specific values (data sources, parameters) that are applied automatically when content is deployed to that stage — no manual post-deploy edits.',
    topic: 'Deployment pipelines',
  },
  {
    id: 'xb-imp-4',
    domain: 'implement',
    prompt:
      'Two engineers must work on the same workspace items simultaneously without overwriting each other, with changes reviewed before reaching the shared workspace. Which workflow fits?',
    options: [
      'Both edit the workspace directly',
      'Each works in a feature branch (separate workspace), merging via pull request through Git integration',
      'Export/import .pbip files by email',
      'One engineer works at night',
    ],
    answer: 1,
    explanation:
      'Git integration supports branching: each developer connects an isolated workspace to a feature branch and merges via pull request, giving parallel development with review.',
    topic: 'Git integration',
  },
  {
    id: 'xb-imp-5',
    domain: 'implement',
    prompt:
      'You must let an external audit team read ONLY the /gold/finance folder of a lakehouse — not the rest of the lakehouse or workspace. What is the best mechanism?',
    options: [
      'Add them as workspace Viewers',
      'OneLake security role scoped to that folder',
      'Give them the SQL analytics endpoint connection string',
      'Certify the lakehouse',
    ],
    answer: 1,
    explanation:
      'OneLake security (data access roles) grants access to specific folders/tables within a lakehouse. Workspace Viewer would expose all items in the workspace.',
    topic: 'OneLake security',
  },
  {
    id: 'xb-imp-6',
    domain: 'implement',
    prompt:
      'Compliance requires that every item containing customer PII is visibly classified and that the classification follows the data into exports. What do you apply?',
    options: ['Endorsement', 'Sensitivity labels', 'Item permissions', 'A domain'],
    answer: 1,
    explanation:
      'Sensitivity labels (Microsoft Purview) classify items and persist protection downstream, including on some export paths. Endorsement signals quality/trust, not classification.',
    topic: 'Sensitivity labels',
  },
  {
    id: 'xb-imp-7',
    domain: 'implement',
    prompt:
      'A nightly process must run a notebook with a different parameter value per region, sequentially, and stop if any region fails. What is the best orchestration design?',
    options: [
      'Three separately scheduled notebooks',
      'A pipeline with a ForEach (sequential) over regions invoking a parameterized Notebook activity',
      'A Dataflow Gen2 with three queries',
      'One notebook with hard-coded regions',
    ],
    answer: 1,
    explanation:
      'A pipeline ForEach configured for sequential execution passes each region as a parameter to the Notebook activity, and a failure stops the loop — exactly the required control flow.',
    topic: 'Orchestration patterns',
  },
  {
    id: 'xb-imp-8',
    domain: 'implement',
    prompt: 'Security asks: "who deleted the sales pipeline last Tuesday?" Where do you find the answer?',
    options: [
      'The Monitoring hub',
      'Microsoft Purview audit logs',
      'The Capacity Metrics app',
      'The lakehouse explorer',
    ],
    answer: 1,
    explanation:
      'Fabric user activities (create/delete/access) are recorded in the Microsoft Purview audit log, which is the compliance source for "who did what, when". The Monitoring hub shows job runs, not user audit events.',
    topic: 'Audit logs',
  },

  // ─── Domain 2: Ingest & transform data ───
  {
    id: 'xb-ing-1',
    domain: 'ingest',
    prompt:
      'A streaming transform must join incoming events against a large lakehouse Delta dimension table and maintain custom state across events. Which engine do you choose?',
    options: ['Eventstream operators', 'Spark Structured Streaming', 'A KQL update policy', 'Dataflow Gen2'],
    answer: 1,
    explanation:
      'Joins against lakehouse Delta tables plus custom stateful logic exceed no-code Eventstream operators — Spark Structured Streaming in a notebook is designed for exactly this.',
    topic: 'Choosing a streaming engine',
  },
  {
    id: 'xb-ing-2',
    domain: 'ingest',
    prompt:
      'A KQL database references cold Delta data in OneLake through a shortcut, but analysts complain those queries are much slower than native tables. Without copying the data, what do you enable?',
    options: [
      'V-Order on the KQL database',
      'Query acceleration for the OneLake shortcut',
      'A larger capacity',
      'An update policy',
    ],
    answer: 1,
    explanation:
      'Query acceleration for OneLake shortcuts caches/indexes the shortcut data in the Eventhouse engine, giving near-native KQL performance without duplicating the data.',
    topic: 'Query acceleration for shortcuts',
  },
  {
    id: 'xb-ing-3',
    domain: 'ingest',
    prompt:
      'For an incremental load, which source column makes the most reliable high-watermark?',
    options: [
      'A free-text status column',
      'A monotonically increasing LastModified timestamp or ID maintained by the source',
      'A random GUID',
      'The row count of the table',
    ],
    answer: 1,
    explanation:
      'A watermark must reliably increase as rows change — a source-maintained LastModified datetime or ever-increasing key qualifies. GUIDs are unordered; row counts and status text don’t identify changed rows.',
    topic: 'Incremental loads & MERGE',
  },
  {
    id: 'xb-ing-4',
    domain: 'ingest',
    prompt: 'Why do dimension tables use integer surrogate keys instead of source business keys?',
    options: [
      'Integers compress better, insulate the model from source-key changes, and enable SCD Type 2 versioning',
      'Business keys cannot be indexed',
      'Surrogate keys are required by Delta Lake',
      'They make full loads faster only',
    ],
    answer: 0,
    explanation:
      'Surrogate keys decouple the warehouse from source systems (which may reuse/change keys), join efficiently, and allow multiple versions of the same business entity for SCD Type 2 history.',
    topic: 'Star schema & surrogate keys',
  },
  {
    id: 'xb-ing-5',
    domain: 'ingest',
    prompt:
      'Analysts need near-real-time access to a Snowflake database in OneLake as Delta tables, with no pipelines to build or maintain. What do you configure?',
    options: ['A OneLake shortcut to Snowflake', 'Mirroring', 'A nightly Copy pipeline', 'An Eventstream'],
    answer: 1,
    explanation:
      'Mirroring supports Snowflake (alongside Azure SQL DB, Cosmos DB, and others) and continuously replicates it into OneLake as Delta with no ETL. Shortcuts target lake/file storage, not a Snowflake database engine.',
    topic: 'Mirroring',
  },
  {
    id: 'xb-ing-6',
    domain: 'ingest',
    prompt:
      'A Dataflow Gen2 cleans supplier files. Where can its output land? (Choose the most complete answer.)',
    options: [
      'Only a CSV download',
      'A data destination such as a lakehouse, warehouse, KQL database, or Azure SQL',
      'Only the dataflow’s internal staging',
      'A Power BI report directly',
    ],
    answer: 1,
    explanation:
      'Dataflow Gen2 supports configurable data destinations including Fabric lakehouses, warehouses, KQL databases, and external targets like Azure SQL — that output binding is a key Gen2 improvement over Gen1.',
    topic: 'Dataflow Gen2',
  },
  {
    id: 'xb-ing-7',
    domain: 'ingest',
    prompt:
      'You need the average sensor temperature over the last 10 minutes, recalculated every minute, from an Eventhouse. Which window type is this?',
    options: ['Tumbling', 'Hopping', 'Session', 'Snapshot'],
    answer: 1,
    explanation:
      'A fixed 10-minute window that advances every 1 minute overlaps — that is a hopping window. Tumbling windows never overlap; session windows are gap-based.',
    topic: 'Windowing functions',
  },
  {
    id: 'xb-ing-8',
    domain: 'ingest',
    prompt:
      'Till reboots occasionally send the same sales transaction twice with identical TransactionID but different arrival times. Which cleanse guarantees exactly one row, keeping the latest?',
    options: [
      'df.distinct()',
      'row_number() over (partition by TransactionID order by ArrivalTime desc) and keep rn = 1',
      'dropna()',
      'A full outer join to itself',
    ],
    answer: 1,
    explanation:
      'distinct() only removes rows identical in every column — these differ by arrival time. The window-function pattern deterministically keeps the newest row per TransactionID.',
    topic: 'Deduplication',
  },

  // ─── Domain 3: Monitor & optimize ───
  {
    id: 'xb-mon-1',
    domain: 'monitor',
    prompt:
      'The finance semantic model silently failed to refresh twice this week; the team found out from stale dashboards. What is the most direct fix?',
    options: [
      'Ask users to check the numbers daily',
      'Configure an alert on refresh failure (e.g., via Activator or refresh notification settings)',
      'Run OPTIMIZE on the model',
      'Move the model to another workspace',
    ],
    answer: 1,
    explanation:
      'Refresh failures should raise an automated alert — refresh failure notifications or an Activator rule can email/Teams the team the moment a refresh fails, eliminating silent staleness.',
    topic: 'Semantic model refresh monitoring',
  },
  {
    id: 'xb-mon-2',
    domain: 'monitor',
    prompt:
      'A Copy activity fails once or twice a week with a transient source timeout and succeeds when re-run manually. What is the best remediation?',
    options: [
      'Set a retry count and retry interval on the activity',
      'Schedule the pipeline twice',
      'Increase the capacity SKU',
      'Convert the pipeline to a Dataflow',
    ],
    answer: 0,
    explanation:
      'Transient failures are what the activity retry policy exists for — configure retries with an interval so the run self-heals without human intervention.',
    topic: 'Pipeline errors & resilience',
  },
  {
    id: 'xb-mon-3',
    domain: 'monitor',
    prompt:
      'In the Spark UI you see one task in a stage processing 100× more data than its peers, causing the whole job to crawl. What is the problem and a standard fix?',
    options: [
      'Too many small files — run VACUUM',
      'Data skew — repartition or salt the hot key (or broadcast the small side of the join)',
      'Wrong SKU — buy more capacity',
      'V-Order is disabled',
    ],
    answer: 1,
    explanation:
      'One straggler task with disproportionate data is classic key skew. Fixes include salting the skewed key, repartitioning, or broadcasting the smaller join side to avoid the shuffle entirely.',
    topic: 'Spark optimization',
  },
  {
    id: 'xb-mon-4',
    domain: 'monitor',
    prompt:
      'A bronze staging table is written every 5 minutes and read only once nightly by Spark. Ingestion latency matters most. Which write-time setting is it reasonable to disable here?',
    options: ['Delta transaction log', 'V-Order', 'Checkpointing', 'Schema enforcement'],
    answer: 1,
    explanation:
      'V-Order optimizes reads (Power BI/SQL) at a small write cost. For a write-heavy bronze table barely read by BI engines, disabling V-Order speeds ingestion; keep it on for silver/gold.',
    topic: 'V-Order trade-offs',
  },
  {
    id: 'xb-mon-5',
    domain: 'monitor',
    prompt:
      'An Eventstream shows growing input lag: events arrive faster than the destination Eventhouse ingests them. Which action addresses the bottleneck most directly?',
    options: [
      'Add another source',
      'Optimize the destination/processing path (e.g., reduce heavy transforms, scale event processing, or tune the destination)',
      'Turn off the Eventstream at night',
      'Add a sensitivity label',
    ],
    answer: 1,
    explanation:
      'Backpressure means the processing/destination side can’t keep up. Reducing per-event transformation cost, scaling processing, or tuning the destination ingestion restores throughput; adding sources worsens it.',
    topic: 'Eventstream optimization',
  },
  {
    id: 'xb-mon-6',
    domain: 'monitor',
    prompt:
      "A new analyst runs SELECT on warehouse table dbo.fact_sales and gets 'The SELECT permission was denied'. What resolves it with least privilege?",
    options: [
      'Make them a workspace Admin',
      'GRANT SELECT on the specific object (or add them to a role with that grant)',
      'Disable RLS',
      'Give them the capacity admin role',
    ],
    answer: 1,
    explanation:
      'Least privilege means granting exactly the missing permission: GRANT SELECT on the object or membership in a database role scoped to it. Workspace Admin massively over-grants.',
    topic: 'T-SQL errors & permissions',
  },
  {
    id: 'xb-mon-7',
    domain: 'monitor',
    prompt:
      'Warehouse queries have gradually slowed as tables grew, and query plans look poor. Which routine maintenance most directly improves plan quality?',
    options: [
      'Keeping statistics up to date',
      'Renaming the tables',
      'Adding more columns',
      'Exporting to CSV weekly',
    ],
    answer: 0,
    explanation:
      'The optimizer relies on statistics to estimate row counts and choose good plans. Fabric maintains statistics automatically in most cases, but understanding that stale stats → bad plans (and updating them) is the tested concept.',
    topic: 'Warehouse query optimization',
  },
  {
    id: 'xb-mon-8',
    domain: 'monitor',
    prompt:
      'You need to see, in one place, the status and duration of last night’s pipeline runs, dataflow refreshes, and notebook executions across the workspace. Where do you go?',
    options: ['The Monitoring hub', 'The lakehouse explorer', 'OneLake settings', 'The semantic model lineage view'],
    answer: 0,
    explanation:
      'The Monitoring hub is the single pane for run history across pipelines, dataflows, notebooks and more — status, duration, error details, and re-run.',
    topic: 'Monitoring hub',
  },
]

/**
 * Full pool: every module quiz question (tagged with its module's domain) +
 * the exam bank + the three comprehensive domain banks. Deduped by id so a
 * question never appears twice in one exam.
 */
export function fullPool(): ExamQuestion[] {
  const fromModules: ExamQuestion[] = MODULES.flatMap((m) =>
    m.quiz.map((q) => ({ ...q, domain: m.domain })),
  )
  const all = [...fromModules, ...EXAM_BANK, ...BANK_IMPLEMENT, ...BANK_INGEST, ...BANK_MONITOR]
  const seen = new Set<string>()
  return all.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)))
}

/** Count of unique questions available across the whole bank. */
export function poolSize(): number {
  return fullPool().length
}

/** How many questions exist per domain (for the exam-setup UI). */
export function poolByDomain(): Record<DomainId, number> {
  const pool = fullPool()
  return {
    implement: pool.filter((q) => q.domain === 'implement').length,
    ingest: pool.filter((q) => q.domain === 'ingest').length,
    monitor: pool.filter((q) => q.domain === 'monitor').length,
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Build a balanced practice exam: nPerDomain random questions from each of the
 * three domains (mirroring the real exam's ~equal skill-area weighting),
 * then shuffled overall. Caps per-domain at what the pool actually holds.
 */
export function buildExam(nPerDomain = 10): ExamQuestion[] {
  const pool = fullPool()
  const domains: DomainId[] = ['implement', 'ingest', 'monitor']
  const picked = domains.flatMap((d) =>
    shuffle(pool.filter((q) => q.domain === d)).slice(0, nPerDomain),
  )
  return shuffle(picked)
}

/** Build a single-domain drill of up to n questions from one skill area. */
export function buildDomainDrill(domain: DomainId, n = 15): ExamQuestion[] {
  return shuffle(fullPool().filter((q) => q.domain === domain)).slice(0, n)
}
