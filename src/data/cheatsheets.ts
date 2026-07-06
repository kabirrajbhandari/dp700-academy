/**
 * Quick-reference cheat sheets — the "night-before-the-exam" printable knowledge.
 * Each sheet is a titled set of either a decision table or code snippets.
 */
export interface CheatTable {
  kind: 'table'
  headers: string[]
  rows: string[][]
}
export interface CheatCode {
  kind: 'code'
  lang: string
  label: string
  code: string
}
export type CheatBlock = CheatTable | CheatCode

export interface CheatSheet {
  id: string
  icon: string
  title: string
  blurb: string
  blocks: CheatBlock[]
}

export const CHEATSHEETS: CheatSheet[] = [
  {
    id: 'cs-decisions',
    icon: '🧭',
    title: 'Decision guide — pick the right tool',
    blurb: 'The choices the exam tests most. Match the keyword to the answer.',
    blocks: [
      {
        kind: 'table',
        headers: ['If you need…', 'Choose', 'Why'],
        rows: [
          ['Spark transforms over files + Delta', 'Lakehouse', 'Spark-first; Files + Tables'],
          ['Writable T-SQL, procs, transactions', 'Warehouse', 'Full DML; lakehouse endpoint is read-only'],
          ['Sub-second queries over billions of events', 'Eventhouse / KQL', 'Time-series optimized'],
          ['Read lakehouse tables with T-SQL', 'SQL analytics endpoint', 'Read-only SELECT/views/TVFs'],
          ['Low-code transform, least effort', 'Dataflow Gen2', 'Power Query, citizen developer'],
          ['High-volume move + orchestrate', 'Pipeline (Copy activity)', 'Movement + activity chaining'],
          ['Complex/large-scale code transform', 'Notebook (Spark)', 'PySpark, custom logic, MERGE'],
          ['Analyze existing lake data, no copy', 'Shortcut', 'Virtualize in place'],
          ['Keep an operational DB in sync', 'Mirroring', 'Continuous Delta replica, no ETL'],
          ['No-code streaming ingest + route', 'Eventstream', 'Sources → transforms → destinations'],
          ['Streaming w/ joins to lakehouse + state', 'Spark Structured Streaming', 'Beyond no-code operators'],
          ['Alert when a condition is met', 'Activator', 'Triggers email/Teams/actions'],
          ['Version control a workspace', 'Git integration', 'Branches, PRs, history'],
          ['Promote Dev → Test → Prod', 'Deployment pipeline', 'Metadata promotion + rules'],
        ],
      },
    ],
  },
  {
    id: 'cs-security',
    icon: '🛡️',
    title: 'Security & access — layered controls',
    blurb: 'From coarse workspace roles down to row/column/masking.',
    blocks: [
      {
        kind: 'table',
        headers: ['Control', 'Granularity', 'Key fact'],
        rows: [
          ['Workspace roles', 'Whole workspace', 'Admin / Member / Contributor / Viewer (least privilege)'],
          ['Item permissions', 'One item', 'Share a report without workspace access'],
          ['OneLake security', 'Folder/table', 'No role = no data; RLS+CLS in ONE role; no DDM here'],
          ['Row-Level Security', 'Rows', 'Predicate function + SECURITY POLICY (warehouse)'],
          ['Column-Level Security', 'Columns', 'GRANT/DENY on columns'],
          ['Object-Level Security', 'Tables/views/procs', 'GRANT/DENY on objects'],
          ['Dynamic Data Masking', 'Result values', 'Obscures output only — combine with RLS/CLS'],
          ['Sensitivity labels', 'Item classification', 'Purview; flows downstream'],
          ['Endorsement', 'Trust signal', 'Promote or Certify'],
          ['Audit logs', 'Activity trail', 'Purview — who did what'],
        ],
      },
      {
        kind: 'code',
        lang: 'sql',
        label: 'Row-Level Security (warehouse)',
        code: `CREATE FUNCTION dbo.fn_region(@r sysname) RETURNS TABLE WITH SCHEMABINDING
AS RETURN SELECT 1 AS ok WHERE @r = USER_NAME() OR IS_ROLEMEMBER('HQ') = 1;

CREATE SECURITY POLICY dbo.RegionPolicy
  ADD FILTER PREDICATE dbo.fn_region(Region) ON dbo.fact_sales WITH (STATE = ON);`,
      },
      {
        kind: 'code',
        lang: 'sql',
        label: 'Column-Level Security & masking',
        code: `DENY SELECT ON dbo.dim_customer(SSN) TO Analysts;         -- CLS
ALTER TABLE dbo.dim_customer ALTER COLUMN Email ADD MASKED WITH (FUNCTION='email()');  -- DDM`,
      },
    ],
  },
  {
    id: 'cs-pyspark',
    icon: '🐍',
    title: 'PySpark quick reference',
    blurb: 'The transformation patterns you write in every lakehouse notebook.',
    blocks: [
      {
        kind: 'code',
        lang: 'python',
        label: 'Read → clean → write Delta',
        code: `df = spark.read.option("header","true").option("inferSchema","true").csv("Files/bronze/x.csv")
clean = df.dropDuplicates(["ID"]).na.drop(subset=["ID"])
clean.write.format("delta").mode("overwrite").saveAsTable("x_silver")  # managed table`,
      },
      {
        kind: 'code',
        lang: 'python',
        label: 'Dedupe — keep latest per key',
        code: `from pyspark.sql.window import Window
from pyspark.sql.functions import row_number, col
w = Window.partitionBy("ID").orderBy(col("LastModified").desc())
latest = df.withColumn("rn", row_number().over(w)).filter(col("rn")==1).drop("rn")`,
      },
      {
        kind: 'code',
        lang: 'python',
        label: 'Aggregate & broadcast join',
        code: `from pyspark.sql.functions import sum as _sum, broadcast
g = df.groupBy("Category").agg(_sum("Amount").alias("Total"))
joined = fact.join(broadcast(small_dim), "Key", "left")  # avoids shuffle`,
      },
      {
        kind: 'code',
        lang: 'python',
        label: 'Delta MERGE (idempotent upsert)',
        code: `from delta.tables import DeltaTable
t = DeltaTable.forName(spark, "dim")
(t.alias("t").merge(src.alias("s"), "t.Key = s.Key")
  .whenMatchedUpdateAll("s.Modified > t.Modified")
  .whenNotMatchedInsertAll().execute())`,
      },
    ],
  },
  {
    id: 'cs-kql',
    icon: '⚡',
    title: 'KQL quick reference',
    blurb: 'Kusto flows left→right through | pipes. Windows via bin().',
    blocks: [
      {
        kind: 'code',
        lang: 'kql',
        label: 'Filter → aggregate into tumbling windows',
        code: `Events
| where value > 0
| summarize Total = sum(value), Count = count()
        by bin(Timestamp, 1m), category   // 1-min tumbling window
| order by Timestamp desc`,
      },
      {
        kind: 'table',
        headers: ['Window', 'Shape', 'Recognize it by'],
        rows: [
          ['Tumbling', 'Fixed, non-overlapping', '"every 5 min, no overlap" → bin()'],
          ['Hopping', 'Fixed size, overlapping', '"10-min avg updated every 1 min"'],
          ['Session', 'Variable, gap-based', '"group bursts separated by idle gaps"'],
        ],
      },
      {
        kind: 'table',
        headers: ['KQL operator', 'Does'],
        rows: [
          ['where', 'Filter rows'],
          ['summarize … by', 'Aggregate/group'],
          ['project', 'Select/rename columns'],
          ['extend', 'Add computed columns'],
          ['join', 'Join tables'],
          ['top N by', 'Sort + limit'],
        ],
      },
    ],
  },
  {
    id: 'cs-tsql',
    icon: '🗄️',
    title: 'T-SQL / Warehouse quick reference',
    blurb: 'Loading, modeling, and serving in a Fabric warehouse.',
    blocks: [
      {
        kind: 'code',
        lang: 'sql',
        label: 'Bulk load & cross-query',
        code: `COPY INTO dbo.stage FROM 'https://onelake.../Files/x/*.parquet'
  WITH (FILE_TYPE='PARQUET', CREDENTIAL=(IDENTITY='Managed Identity'));

-- three-part name spans warehouse + lakehouse (same workspace, no copy)
SELECT * FROM sales_dw.dbo.orders o JOIN sales_lh.dbo.customers c ON o.CustID = c.CustID;`,
      },
      {
        kind: 'code',
        lang: 'sql',
        label: 'MERGE (upsert)',
        code: `MERGE INTO dim_customer AS t
USING staging AS s ON t.Key = s.Key
WHEN MATCHED AND s.Modified > t.Modified THEN UPDATE SET t.Name = s.Name
WHEN NOT MATCHED THEN INSERT (Key, Name) VALUES (s.Key, s.Name);`,
      },
      {
        kind: 'table',
        headers: ['SCD type', 'Behavior', 'Use when'],
        rows: [
          ['Type 1', 'Overwrite attribute', 'History not needed (error fixes)'],
          ['Type 2', 'New row + validity dates + IsCurrent', 'Must report value as-of the fact’s time'],
        ],
      },
    ],
  },
  {
    id: 'cs-optimize',
    icon: '⚙️',
    title: 'Optimization & errors — fast fixes',
    blurb: 'The symptom → fix table the exam loves.',
    blocks: [
      {
        kind: 'table',
        headers: ['Symptom', 'Fix'],
        rows: [
          ['Thousands of tiny files, slow reads', 'OPTIMIZE (bin-compaction + V-Order)'],
          ['Storage growing from old versions', 'VACUUM (7-day default retention)'],
          ['Slow big-table/small-table Spark join', 'Broadcast the small table'],
          ['One task 100× slower (straggler)', 'Data skew → salt key / repartition'],
          ['Write-heavy bronze slow to ingest', 'Disable V-Order for that table'],
          ['Query scans too much', 'Filter early, select fewer columns, partition'],
          ['Jobs queuing workspace-wide', 'Capacity Metrics → scale / reschedule / optimize'],
          ['Transient Copy timeout', 'Activity retry count + interval'],
          ['Re-run double-loads data', 'MERGE keyed on business key (idempotent)'],
          ['Semantic model silently stale', 'Alert on refresh failure (Activator)'],
          ['Poor warehouse query plans', 'Keep statistics up to date'],
        ],
      },
    ],
  },
  {
    id: 'cs-exam',
    icon: '🎯',
    title: 'Exam-day facts to memorize',
    blurb: 'High-yield numbers and gotchas.',
    blocks: [
      {
        kind: 'table',
        headers: ['Fact', 'Value'],
        rows: [
          ['Pass score', '700 / 1000 (~70%)'],
          ['Skill areas (each ~equal)', 'Implement/manage · Ingest/transform · Monitor/optimize (30–35% each)'],
          ['OneLake per tenant', 'Exactly one'],
          ['Workspace ↔ capacity', 'One capacity per workspace'],
          ['Mirroring table limit', '1,000 tables'],
          ['VACUUM default retention', '7 days'],
          ['Silver/gold target file size', '~1 GB'],
          ['Starter pool session start', '5–10 seconds (custom ~3 min)'],
          ['Spark session timeout default', '20 minutes'],
          ['Airflow starter-pool idle shutdown', '~20 minutes (custom = always-on)'],
          ['Enable mirroring role', 'Admin or Member'],
          ['Deployment copies…', 'Metadata only — never data'],
          ['Preferred parameterization', 'Variable libraries (over deployment rules)'],
        ],
      },
    ],
  },
]
