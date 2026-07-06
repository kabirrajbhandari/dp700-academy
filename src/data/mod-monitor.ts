import type { Module } from '../types'

export const modMonitor: Module = {
  id: 'monitor',
  title: 'Monitoring, Optimization & Error Handling',
  domain: 'monitor',
  difficulty: 'Advanced',
  icon: '📊',
  blurb:
    'Watch every workload, configure alerts, resolve errors across items, and optimize lakehouses, warehouses, Spark, and queries.',
  lessons: [
    {
      id: 'mo-monitor',
      title: 'Monitor Fabric items & configure alerts',
      minutes: 13,
      summary:
        'The Monitoring hub, per-item run history, semantic-model refresh, the Capacity Metrics app, and alerts.',
      keyPoints: [
        'Monitoring hub = one place for pipeline/notebook/dataflow run history & status.',
        'Capacity Metrics app tracks CU usage, throttling, and overloads.',
        'Monitor semantic-model refresh success/failure and duration.',
        'Configure alerts with Activator on metrics/conditions.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'monitoring',
          caption: 'Monitoring hub + Capacity Metrics + Activator give run-level and capacity-level visibility.',
        },
        {
          kind: 'table',
          headers: ['To monitor…', 'Use…'],
          rows: [
            ['Pipeline / notebook / dataflow runs', 'Monitoring hub (status, duration, errors, re-run)'],
            ['Capacity health (CU %, throttling)', 'Microsoft Fabric Capacity Metrics app'],
            ['Semantic model refresh', 'Refresh history on the model; alert on failure'],
            ['Spark applications', 'Spark monitoring / Spark UI from the notebook run'],
            ['Conditions & thresholds', 'Activator (Data Activator) alerts → email/Teams'],
          ],
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Know where each signal lives: item run history + Monitoring hub for jobs, Capacity Metrics app for CU/throttling, refresh history for semantic models, Spark UI for stage/executor detail. Alerts come from Activator.',
        },
      ],
    },
    {
      id: 'mo-errors',
      title: 'Identify & resolve errors',
      minutes: 15,
      summary:
        'Debugging playbook for pipelines, Dataflows, notebooks, Eventstreams/Eventhouses, T-SQL, and shortcuts.',
      keyPoints: [
        'Pipeline: read the failed activity’s error + input/output; add retries & On-failure paths.',
        'Notebook: inspect the failed cell/stage in Spark UI; check skew/OOM.',
        'T-SQL: read the error number/message; check permissions, types, and object names.',
        'Shortcut/Eventstream errors are usually auth, path, or schema mismatches.',
      ],
      blocks: [
        {
          kind: 'table',
          headers: ['Item', 'Common errors', 'First fix'],
          rows: [
            ['Pipeline', 'Copy fails, timeout, throttling', 'Open failed activity → error + input/output; add retry, check source auth'],
            ['Dataflow Gen2', 'Refresh/eval errors, type mismatch', 'Check the failing query step; fix data types & source credentials'],
            ['Notebook', 'OOM, skew, long stages', 'Spark UI → stage detail; repartition/broadcast; raise executor size'],
            ['Eventhouse', 'Ingestion failures, mapping errors', 'Check ingestion mapping & schema; look at failed ingestion logs'],
            ['Eventstream', 'Source/dest connection, backpressure', 'Verify connector auth & destination availability'],
            ['T-SQL', 'Permission, invalid object, conversion', 'Read error number; verify grants, names, and CAST/CONVERT'],
            ['Shortcut', 'Access denied, path not found', 'Re-check target path & the connection’s credentials/permissions'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Make pipelines resilient',
          body:
            'Set activity retry count & interval, add On-failure paths that log to a table and alert, and use timeouts. For idempotency, prefer MERGE so a re-run does not double-load. Capture the error via @activity(\'Copy\').error.message in a following activity.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Throttling is not a bug',
          body:
            'If jobs slow or queue, check the Capacity Metrics app — you may be over capacity and getting throttled via smoothing. The fix is scaling the capacity, scheduling heavy jobs off-peak, or optimizing the workload — not retrying blindly.',
        },
      ],
    },
    {
      id: 'mo-optimize',
      title: 'Optimize performance',
      minutes: 16,
      summary:
        'Tune lakehouse tables (OPTIMIZE/V-Order/VACUUM), pipelines, warehouses, Spark, and queries.',
      keyPoints: [
        'Lakehouse tables: OPTIMIZE (compact small files), V-Order, VACUUM old files.',
        'Avoid the small-file problem; aim for larger files/row groups in silver/gold.',
        'Spark: right-size partitions, cache reuse, broadcast small joins, avoid skew.',
        'Warehouse/queries: good statistics, appropriate data types, result-set reuse.',
      ],
      blocks: [
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Delta table maintenance (Spark SQL)',
          code: `-- Compact many small files into fewer, larger ones (+ V-Order)
OPTIMIZE products_silver;

-- Remove files no longer referenced (default 7-day retention)
VACUUM products_silver RETAIN 168 HOURS;`,
        },
        {
          kind: 'table',
          headers: ['Target', 'Optimization', 'Why it helps'],
          rows: [
            ['Lakehouse table', 'OPTIMIZE + V-Order', 'Fewer, ordered files → faster Power BI/SQL reads'],
            ['Lakehouse table', 'VACUUM', 'Removes stale files, cuts storage & metadata overhead'],
            ['Silver/Gold files', 'Aim ~1 GB files, avoid many small files', 'Less metadata & file-open overhead'],
            ['Spark job', 'Repartition, broadcast joins, cache', 'Balances work, avoids shuffles & skew'],
            ['Pipeline', 'Parallel copy, staging, degree of copy parallelism', 'Higher throughput on big moves'],
            ['Warehouse', 'Fresh statistics, right data types, star schema', 'Better plans, less scan'],
            ['Query', 'Filter early, select needed columns, result reuse', 'Less data scanned'],
          ],
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'The "many small files → slow reads" scenario is answered by OPTIMIZE (compaction). "Storage growing from old versions" → VACUUM. "Slow Spark join with one big + one small table" → broadcast the small table. "Query scans too much" → partition/filter and select fewer columns.',
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'V-Order',
          body:
            'V-Order is a write-time optimization Fabric applies to Parquet inside Delta, improving read speed for Power BI, SQL, and Spark. It is on by default. For write-heavy staging (bronze) you may disable it to speed ingestion, then rely on it for silver/gold read performance.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-mo-1',
      prompt:
        'A lakehouse Delta table has accumulated thousands of tiny files and Power BI reads have become slow. What is the correct remedy?',
      options: ['VACUUM the table', 'Run OPTIMIZE to compact the small files', 'Delete and reload', 'Disable V-Order'],
      answer: 1,
      explanation:
        'OPTIMIZE performs bin-compaction, merging many small files into fewer larger ones (with V-Order), directly fixing the small-file problem that slows reads. VACUUM removes old unreferenced files but does not compact.',
      topic: 'Lakehouse table optimization',
    },
    {
      id: 'q-mo-2',
      prompt:
        'Your Fabric jobs are suddenly queuing and running slowly across the workspace. Where do you look first to confirm a capacity problem?',
      options: [
        'The semantic model refresh history',
        'The Microsoft Fabric Capacity Metrics app',
        'The Spark UI',
        'The lakehouse explorer',
      ],
      answer: 1,
      explanation:
        'The Capacity Metrics app shows CU utilization, throttling, and overload events across the capacity — the right place to confirm whether smoothing/throttling is causing the slowdown.',
      topic: 'Capacity monitoring',
    },
    {
      id: 'q-mo-3',
      prompt:
        'A Spark job joins a huge fact DataFrame with a tiny lookup DataFrame and is slow due to shuffling. The most effective optimization is to:',
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
      id: 'q-mo-4',
      prompt:
        'You want to be notified in Teams whenever a pipeline fails. Which Fabric capability do you use to configure that alert?',
      options: ['OPTIMIZE', 'Activator (Data Activator)', 'A deployment pipeline', 'A shortcut'],
      answer: 1,
      explanation:
        'Activator monitors conditions/metrics and triggers actions such as email or Teams alerts, making it the tool for automated failure notifications. Monitoring hub shows status but Activator raises the alert.',
      topic: 'Alerts',
    },
  ],
}
