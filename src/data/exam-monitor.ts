import type { ExamQuestion } from './exam-bank'

/**
 * Domain 3 — Monitor & optimize an analytics solution (30–35%).
 * Monitoring (ingestion, transformation, semantic-model refresh, alerts),
 * error identification & resolution across every workload, and optimization
 * (lakehouse tables, pipelines, warehouse, Eventstreams/Eventhouses, Spark,
 * queries). Grounded in Microsoft Learn.
 */
export const BANK_MONITOR: ExamQuestion[] = [
  // --- Monitoring ---
  {
    id: 'm-mon-1',
    domain: 'monitor',
    prompt:
      'You want one place to see status, duration, and errors for last night’s pipeline runs, dataflow refreshes, and notebook executions. Where do you go?',
    options: ['The lakehouse explorer', 'The Monitoring hub', 'OneLake settings', 'The semantic model lineage view'],
    answer: 1,
    explanation:
      'The Monitoring hub is the single pane for run history across pipelines, dataflows, notebooks, and more — status, duration, errors, and re-run.',
    topic: 'Monitoring hub',
  },
  {
    id: 'm-mon-2',
    domain: 'monitor',
    prompt:
      'Jobs across the workspace are suddenly queuing and slow. Where do you confirm a capacity/throttling problem?',
    options: ['Semantic model refresh history', 'The Microsoft Fabric Capacity Metrics app', 'The Spark UI', 'The lakehouse explorer'],
    answer: 1,
    explanation:
      'The Capacity Metrics app shows CU utilization, throttling, and overload events — the place to confirm whether smoothing/throttling is causing slowdowns.',
    topic: 'Capacity monitoring',
  },
  {
    id: 'm-mon-3',
    domain: 'monitor',
    prompt:
      'The finance semantic model silently failed to refresh twice; the team learned from stale dashboards. Best fix?',
    options: [
      'Ask users to check daily',
      'Configure a refresh-failure alert (refresh notifications or an Activator rule)',
      'Run OPTIMIZE on the model',
      'Move it to another workspace',
    ],
    answer: 1,
    explanation:
      'Refresh failures should raise an automated alert — refresh failure notifications or an Activator rule email/Teams the team immediately, eliminating silent staleness.',
    topic: 'Semantic model refresh monitoring',
  },
  {
    id: 'm-mon-4',
    domain: 'monitor',
    prompt:
      'You want to be notified in Teams whenever a specific pipeline fails. Which capability raises the alert?',
    options: ['OPTIMIZE', 'Activator (Data Activator)', 'A deployment pipeline', 'A shortcut'],
    answer: 1,
    explanation:
      'Activator monitors conditions/metrics and triggers actions such as email or Teams alerts. The Monitoring hub shows status, but Activator raises the automated alert.',
    topic: 'Alerts',
  },
  {
    id: 'm-mon-5',
    domain: 'monitor',
    prompt:
      'To inspect stage-level detail, executor memory, and task skew for a failed Spark notebook run, use:',
    options: ['The Capacity Metrics app', 'The Spark UI / Spark monitoring from the run', 'OneLake settings', 'The SQL endpoint'],
    answer: 1,
    explanation:
      'The Spark UI (accessible from the notebook/Spark application run) exposes stages, tasks, executor memory, and skew — the right tool for diagnosing Spark performance.',
    topic: 'Monitoring Spark',
  },
  // --- Errors ---
  {
    id: 'm-err-1',
    domain: 'monitor',
    prompt:
      'A Copy activity fails once or twice a week with a transient source timeout and works on manual re-run. Best remediation?',
    options: [
      'Schedule the pipeline twice',
      'Set a retry count and retry interval on the activity',
      'Increase the capacity SKU',
      'Convert it to a Dataflow',
    ],
    answer: 1,
    explanation:
      'Transient failures are what the activity retry policy exists for — configure retries with an interval so the run self-heals without manual intervention.',
    topic: 'Pipeline errors',
  },
  {
    id: 'm-err-2',
    domain: 'monitor',
    prompt:
      "A new analyst runs SELECT on dbo.fact_sales and gets 'The SELECT permission was denied'. Least-privilege fix?",
    options: [
      'Make them workspace Admin',
      'GRANT SELECT on the object (or add them to a role that has it)',
      'Disable RLS',
      'Give them capacity admin',
    ],
    answer: 1,
    explanation:
      'Grant exactly the missing permission — GRANT SELECT on the object or membership in a scoped role. Workspace Admin massively over-grants.',
    topic: 'T-SQL errors',
  },
  {
    id: 'm-err-3',
    domain: 'monitor',
    prompt:
      'A Dataflow Gen2 refresh fails after a source column was renamed. First diagnostic step?',
    options: [
      'Increase capacity',
      'Open the failing query step and fix the reference/data type against the new schema',
      'Delete the dataflow',
      'Run VACUUM',
    ],
    answer: 1,
    explanation:
      'Dataflow errors surface at a specific query step. Inspect the failing step and correct the column reference/type (or update credentials) against the changed source schema.',
    topic: 'Dataflow Gen2 errors',
  },
  {
    id: 'm-err-4',
    domain: 'monitor',
    prompt:
      'An Eventstream shows growing input lag — events arrive faster than the Eventhouse ingests them. Best action?',
    options: [
      'Add another source',
      'Reduce heavy in-stream transforms / scale processing / tune the destination ingestion',
      'Turn it off at night',
      'Apply a sensitivity label',
    ],
    answer: 1,
    explanation:
      'Backpressure means the processing/destination side can’t keep up. Reduce per-event transform cost, scale processing, or tune destination ingestion. Adding sources worsens it.',
    topic: 'Eventstream errors',
  },
  {
    id: 'm-err-5',
    domain: 'monitor',
    prompt: 'A OneLake shortcut query fails with "access denied / path not found". Most likely cause?',
    options: [
      'V-Order is off',
      'The target path or the connection’s credentials/permissions are wrong or expired',
      'The table is too big',
      'Too few partitions',
    ],
    answer: 1,
    explanation:
      'Shortcut errors are usually authorization or path issues — verify the external target path and the connection’s credentials/permissions (e.g., rotated keys).',
    topic: 'Shortcut errors',
  },
  {
    id: 'm-err-6',
    domain: 'monitor',
    prompt: 'An Eventhouse ingestion is failing for some rows. First place to look?',
    options: [
      'The Capacity Metrics app',
      'The ingestion mapping/schema and failed-ingestion logs',
      'The deployment pipeline',
      'The semantic model',
    ],
    answer: 1,
    explanation:
      'Eventhouse ingestion failures typically stem from schema/mapping mismatches. Check the ingestion mapping and the failed-ingestion logs to pinpoint the offending rows/columns.',
    topic: 'Eventhouse errors',
  },
  {
    id: 'm-err-7',
    domain: 'monitor',
    prompt: 'To make a pipeline resilient AND idempotent so a re-run never double-loads, you combine retries with:',
    options: [
      'INSERT-only loads',
      'A MERGE (upsert) keyed on the business key',
      'TRUNCATE + INSERT',
      'Disabling logging',
    ],
    answer: 1,
    explanation:
      'Retries handle transient failure; an idempotent MERGE keyed on the business key ensures a re-run converges to the same correct state without duplicates.',
    topic: 'Error handling & idempotency',
  },
  // --- Optimization ---
  {
    id: 'm-opt-1',
    domain: 'monitor',
    prompt:
      'A lakehouse Delta table has thousands of tiny files and Power BI reads are slow. Correct remedy?',
    options: ['VACUUM', 'OPTIMIZE (bin-compaction)', 'Delete and reload', 'Disable V-Order'],
    answer: 1,
    explanation:
      'OPTIMIZE compacts many small files into fewer larger ones (with V-Order), fixing the small-file problem that slows reads. VACUUM removes old files but does not compact.',
    topic: 'Lakehouse table optimization',
  },
  {
    id: 'm-opt-2',
    domain: 'monitor',
    prompt: 'Storage keeps growing from old Delta versions you no longer need. Which command reclaims it?',
    options: ['OPTIMIZE', 'VACUUM (respecting the 7-day default retention)', 'MERGE', 'REFRESH'],
    answer: 1,
    explanation:
      'VACUUM removes files no longer referenced by the Delta log. By default it will not delete files within the last 7 days to protect time-travel/consistency.',
    topic: 'Lakehouse table optimization',
  },
  {
    id: 'm-opt-3',
    domain: 'monitor',
    prompt:
      'A Spark job joins a huge fact DataFrame with a tiny lookup and is slow due to shuffling. Best fix?',
    options: [
      'Increase VACUUM retention',
      'Broadcast the small lookup table in the join',
      'Add more small files',
      'Disable V-Order',
    ],
    answer: 1,
    explanation:
      'Broadcasting the small table sends it to every executor, avoiding a large shuffle of the fact table — the standard fix for a big-table/small-table join.',
    topic: 'Spark optimization',
  },
  {
    id: 'm-opt-4',
    domain: 'monitor',
    prompt:
      'In the Spark UI, one task processes 100× more data than its peers and stalls the stage. Diagnosis and fix?',
    options: [
      'Small files — run VACUUM',
      'Data skew — salt the hot key, repartition, or broadcast the small side',
      'Wrong SKU — buy capacity',
      'V-Order disabled',
    ],
    answer: 1,
    explanation:
      'A single straggler with disproportionate data is key skew. Salt the skewed key, repartition, or broadcast the smaller join side to avoid the skewed shuffle.',
    topic: 'Spark optimization',
  },
  {
    id: 'm-opt-5',
    domain: 'monitor',
    prompt:
      'A write-heavy BRONZE staging table is written every 5 minutes and read only nightly. Ingestion latency matters most. Reasonable optimization?',
    options: [
      'Disable the transaction log',
      'Disable V-Order for the write-heavy bronze table (keep it on for silver/gold)',
      'Drop schema enforcement',
      'Remove checkpoints',
    ],
    answer: 1,
    explanation:
      'V-Order speeds reads at a small write cost. For write-heavy bronze data barely touched by BI engines, disabling V-Order speeds ingestion; keep it on for read-heavy silver/gold.',
    topic: 'V-Order trade-offs',
  },
  {
    id: 'm-opt-6',
    domain: 'monitor',
    prompt: 'Warehouse queries have slowed as tables grew and plans look poor. Which routine most directly helps plan quality?',
    options: ['Keeping statistics up to date', 'Renaming tables', 'Adding columns', 'Weekly CSV export'],
    answer: 0,
    explanation:
      'The optimizer relies on statistics for row-count estimates. Stale stats produce poor plans; Fabric maintains stats automatically in most cases, but understanding stats→plan quality is the tested concept.',
    topic: 'Warehouse query optimization',
  },
  {
    id: 'm-opt-7',
    domain: 'monitor',
    prompt: 'For silver/gold layers, Microsoft recommends targeting file sizes around…',
    options: ['1 MB', '~1 GB (and larger row groups)', '10 KB', 'As many small files as possible'],
    answer: 1,
    explanation:
      'Big-data engines perform better with fewer, larger files. Aim for ~1 GB files and larger row groups in silver/gold to reduce metadata/file-open overhead and speed reads.',
    topic: 'File size optimization',
  },
  {
    id: 'm-opt-8',
    domain: 'monitor',
    prompt: 'To speed a very large pipeline Copy of many files, which setting most directly raises throughput?',
    options: [
      'Lower the retry count',
      'Increase parallel copy / degree-of-copy-parallelism (and use staging where appropriate)',
      'Add a sensitivity label',
      'Disable logging',
    ],
    answer: 1,
    explanation:
      'The Copy activity’s parallelism (degree of copy parallelism) and staging raise throughput on large moves by copying files concurrently.',
    topic: 'Pipeline optimization',
  },
  {
    id: 'm-opt-9',
    domain: 'monitor',
    prompt: 'A query scans far more data than needed. Which change reduces scan the most?',
    options: [
      'SELECT * on every query',
      'Filter early, select only needed columns, and partition/prune appropriately',
      'Add more joins',
      'Disable statistics',
    ],
    answer: 1,
    explanation:
      'Projecting only needed columns, filtering early, and partition pruning cut the volume scanned — the core levers for query performance over columnar Delta/Parquet.',
    topic: 'Query optimization',
  },
  {
    id: 'm-opt-10',
    domain: 'monitor',
    prompt: 'Throttling appears in the Capacity Metrics app during peak. Which is NOT an appropriate response?',
    options: [
      'Scale up/out the capacity',
      'Schedule heavy jobs off-peak',
      'Optimize the heaviest workloads',
      'Blindly retry the same jobs in a tight loop',
    ],
    answer: 3,
    explanation:
      'Throttling is a capacity signal, not a transient bug. Scale the capacity, shift heavy work off-peak, or optimize workloads. Blindly retrying wastes CUs and worsens contention.',
    topic: 'Capacity optimization',
  },
]
