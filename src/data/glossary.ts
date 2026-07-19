/**
 * DP-700 glossary — every term a learner is likely to meet, with a plain-English
 * definition and an exam-relevant note. Grounded in Microsoft Fabric docs.
 * Categories power the filter chips in the Reference view.
 */
export type GlossaryCategory =
  | 'Core'
  | 'Storage'
  | 'Ingest'
  | 'Transform'
  | 'Real-Time'
  | 'Warehouse'
  | 'Security'
  | 'Lifecycle'
  | 'Monitor'

export interface Term {
  term: string
  category: GlossaryCategory
  short: string
  /** optional "exam note" surfaced with a 🎯 */
  exam?: string
}

export const GLOSSARY: Term[] = [
  // --- Core ---
  { term: 'Microsoft Fabric', category: 'Core', short: 'An end-to-end SaaS analytics platform unifying data engineering, warehousing, real-time, data science and BI on one storage layer (OneLake).' },
  { term: 'OneLake', category: 'Core', short: 'The single, tenant-wide logical data lake, auto-provisioned per tenant, storing all data as open Delta-Parquet. "OneDrive for data."', exam: 'Exactly one per tenant — you cannot create more.' },
  { term: 'Workspace', category: 'Core', short: 'A logical container for Fabric items; the unit of access control and Git integration. Assigned to exactly one capacity.' },
  { term: 'Capacity (F-SKU)', category: 'Core', short: 'The pooled compute you buy, sized in Capacity Units (F2…F2048). All workloads in assigned workspaces draw from it.', exam: 'Uses smoothing & bursting; sustained overuse → throttling.' },
  { term: 'Capacity Unit (CU)', category: 'Core', short: 'The unit of compute measured/billed for a Fabric capacity. Tracked in the Capacity Metrics app.' },
  { term: 'Item', category: 'Core', short: 'Any object you create in a workspace: lakehouse, warehouse, notebook, pipeline, eventstream, semantic model, etc.' },
  { term: 'Domain', category: 'Core', short: 'A governance grouping of workspaces by business area (Sales, Finance…), enabling delegated/data-mesh governance.', exam: 'Choose domains when each business area must own & govern its own data products.' },
  { term: 'Workload / experience', category: 'Core', short: 'A Fabric capability area: Data Engineering, Data Factory, Data Warehouse, Real-Time Intelligence, Data Science, Power BI, Databases.' },
  { term: 'Trial capacity', category: 'Core', short: 'A 60-day free Fabric capacity for learning/practice with near-full functionality.' },

  // --- Storage ---
  { term: 'Lakehouse', category: 'Storage', short: 'A Spark-first store combining a data lake (any file) with tables (Delta). Has a Files area and a Tables area.', exam: 'Auto-creates a read-only SQL analytics endpoint + a default semantic model.' },
  { term: 'Delta Lake', category: 'Storage', short: 'The open storage format (Parquet + transaction log) that brings ACID transactions to the lake. Fabric’s default table format.' },
  { term: 'Tables area', category: 'Storage', short: 'The lakehouse zone holding managed Delta tables, queryable via Spark and the SQL analytics endpoint.' },
  { term: 'Files area', category: 'Storage', short: 'The lakehouse zone holding raw files of any format (CSV, JSON, images…).' },
  { term: 'Managed table', category: 'Storage', short: 'A table whose files Fabric owns (created via saveAsTable). Dropping it deletes the data.' },
  { term: 'External table', category: 'Storage', short: 'A table pointing at files you manage (e.g., in Files or via a shortcut). Dropping it does not delete the data.' },
  { term: 'Shortcut', category: 'Storage', short: 'A pointer that virtualizes data in another OneLake location, ADLS Gen2, S3, GCS, or Dataverse — no copy.', exam: 'Best answer for "analyze existing lake data without duplicating it."' },
  { term: 'V-Order', category: 'Storage', short: 'A write-time optimization applied to Parquet inside Delta that speeds reads for Power BI/SQL/Spark. On by default.', exam: 'Can disable on write-heavy bronze to speed ingestion; keep on for silver/gold.' },
  { term: 'OPTIMIZE', category: 'Storage', short: 'Delta command that bin-compacts many small files into fewer larger ones — fixes the small-file problem.' },
  { term: 'VACUUM', category: 'Storage', short: 'Delta command that removes files no longer referenced by the log. 7-day default retention protects time-travel.' },
  { term: 'Medallion architecture', category: 'Storage', short: 'Layered design: Bronze (raw), Silver (cleaned/conformed), Gold (business-ready). Quality rises left→right.' },
  { term: 'SQL analytics endpoint', category: 'Storage', short: 'A read-only T-SQL endpoint auto-created over a lakehouse’s Delta tables (SELECT, views, TVFs — no DML).' },
  { term: 'Materialized lake views', category: 'Storage', short: 'Declarative SQL views that auto-manage transformations between medallion layers with dependency ordering and refresh.' },

  // --- Ingest ---
  { term: 'Data pipeline', category: 'Ingest', short: 'A low-code orchestrator that moves data (Copy activity) and chains activities (notebook, dataflow, proc) with dependencies.' },
  { term: 'Copy activity', category: 'Ingest', short: 'The pipeline activity for high-volume source→sink data movement, with parallelism and staging options.' },
  { term: 'Dataflow Gen2', category: 'Ingest', short: 'A low-code Power Query transform tool (150+ connectors) that lands results to a lakehouse, warehouse, KQL DB, or Azure SQL.', exam: 'Best for citizen developers doing simple transforms with least code.' },
  { term: 'Mirroring', category: 'Ingest', short: 'Continuous, near-real-time replication of an operational DB (Azure SQL, Cosmos DB, Snowflake, Fabric SQL DB) into OneLake as Delta.', exam: 'Read-only, up to 1,000 tables, no ETL. DDL changes/stop-restart trigger a full reseed.' },
  { term: 'COPY INTO', category: 'Ingest', short: 'T-SQL statement for high-throughput bulk loading of Parquet/CSV files into a warehouse table.' },
  { term: 'Full load', category: 'Ingest', short: 'Reloading the entire target every run. Simple but expensive at scale.' },
  { term: 'Incremental load', category: 'Ingest', short: 'Loading only rows changed since the last run, tracked by a watermark. Efficient for large tables.' },
  { term: 'Watermark', category: 'Ingest', short: 'A stored high-value (max modified date or ever-increasing key) marking the last-processed point for incremental loads.', exam: 'Advance it only AFTER a successful load, or you risk silently skipping rows.' },
  { term: 'MERGE (upsert)', category: 'Ingest', short: 'A statement that updates matched rows and inserts new ones. Keyed on the business key, it makes loads idempotent.' },
  { term: 'Control table', category: 'Ingest', short: 'A metadata table (source list, watermarks) that drives a reusable, metadata-driven pipeline via Lookup + ForEach.' },

  // --- Transform ---
  { term: 'Notebook', category: 'Transform', short: 'A code-first Spark surface (PySpark, Spark SQL, Scala, R) for large-scale/complex transforms; schedulable or pipeline-invoked.' },
  { term: 'PySpark', category: 'Transform', short: 'The Python API for Apache Spark — the bread-and-butter language for lakehouse transformations.' },
  { term: 'Spark SQL', category: 'Transform', short: 'SQL over Spark DataFrames/Delta tables in a notebook — for SQL-comfortable teams working in a lakehouse.' },
  { term: 'Environment', category: 'Transform', short: 'A Fabric item bundling a Spark runtime version, pool selection, and library dependencies for notebooks/SJDs.' },
  { term: 'Starter pool', category: 'Transform', short: 'A pre-warmed Spark pool giving 5–10s session starts with default settings.', exam: 'Custom pools give flexibility but ~3 min first-session start.' },
  { term: 'Denormalize', category: 'Transform', short: 'Pre-joining related tables into one wide table to speed reporting reads (trades storage/freshness for speed).' },
  { term: 'SCD Type 1', category: 'Transform', short: 'Slowly Changing Dimension that overwrites the attribute in place — no history kept.' },
  { term: 'SCD Type 2', category: 'Transform', short: 'SCD that adds a new row with validity dates + current flag on change, preserving history.', exam: 'Use when facts must map to the attribute value valid at their time.' },
  { term: 'Inferred member', category: 'Transform', short: 'A placeholder dimension row inserted when a fact references a not-yet-loaded member (late-arriving dimension).' },
  { term: 'Surrogate key', category: 'Transform', short: 'An integer key that is the dimension’s primary key, independent of the source business key.' },
  { term: 'Star schema', category: 'Transform', short: 'A central fact table (measures + FKs) surrounded by dimension tables joined on surrogate keys.' },

  // --- Real-Time ---
  { term: 'Real-Time Intelligence (RTI)', category: 'Real-Time', short: 'The Fabric workload for data in motion: Eventstream, Eventhouse/KQL, Real-Time Dashboards, Activator.' },
  { term: 'Eventstream', category: 'Real-Time', short: 'A no-code canvas to ingest streaming sources (Event Hubs, IoT Hub, Kafka), transform, and route to destinations.' },
  { term: 'Eventhouse', category: 'Real-Time', short: 'A container for KQL databases optimized for high-volume time-series and log data.' },
  { term: 'KQL database', category: 'Real-Time', short: 'A Kusto database for fast, sub-second queries over streaming/log data using KQL.' },
  { term: 'KQL (Kusto Query Language)', category: 'Real-Time', short: 'The read/analytics language for Eventhouses, flowing left→right through | (pipe) operators.' },
  { term: 'Activator (Data Activator)', category: 'Real-Time', short: 'Monitors streams/queries for conditions and triggers actions — email, Teams, Power Automate, pipelines.', exam: 'The answer for "alert automatically when a condition is met."' },
  { term: 'Spark Structured Streaming', category: 'Real-Time', short: 'Code-based streaming (readStream→transform→writeStream w/ checkpoints) for complex/stateful logic and joins to lakehouse tables.' },
  { term: 'Tumbling window', category: 'Real-Time', short: 'Fixed-size, non-overlapping time windows; each event belongs to exactly one. In KQL: summarize … by bin().' },
  { term: 'Hopping window', category: 'Real-Time', short: 'Fixed-size windows that overlap by a smaller hop (e.g., 10-min window every 1 min) — smooth moving aggregates.' },
  { term: 'Session window', category: 'Real-Time', short: 'Variable-length windows grouping bursts of activity separated by idle gaps (e.g., user sessions).' },
  { term: 'Query acceleration', category: 'Real-Time', short: 'Caches/indexes OneLake shortcut data in the Eventhouse for near-native KQL performance without copying.' },

  // --- Warehouse ---
  { term: 'Warehouse', category: 'Warehouse', short: 'A fully transactional T-SQL data warehouse (DDL/DML, procs, transactions), storing Delta in OneLake.', exam: 'Use when you need writable T-SQL; the lakehouse SQL endpoint is read-only.' },
  { term: 'Cross-database query', category: 'Warehouse', short: 'A three-part-name query spanning a warehouse and a lakehouse SQL endpoint in the same workspace — no copy.' },
  { term: 'Stored procedure', category: 'Warehouse', short: 'A parameterized, reusable T-SQL routine — e.g., to run a load or the month-end close.' },
  { term: 'View', category: 'Warehouse', short: 'A saved SELECT that presents data without materializing it — a reusable serving object.' },

  // --- Security ---
  { term: 'Workspace roles', category: 'Security', short: 'Admin, Member, Contributor, Viewer — coarse access. Least privilege: pick the smallest role that fits the job.' },
  { term: 'Item permissions', category: 'Security', short: 'Sharing a single item (report, lakehouse) without granting the whole workspace.' },
  { term: 'OneLake security', category: 'Security', short: 'Role-based access (data-access roles) restricting folders/tables in OneLake; can include RLS/CLS.', exam: 'Users in no role see NO data; RLS+CLS must live in one role; DDM is NOT supported here.' },
  { term: 'Row-Level Security (RLS)', category: 'Security', short: 'Filters rows per user via a predicate. In the warehouse: a security predicate function + SECURITY POLICY.' },
  { term: 'Column-Level Security (CLS)', category: 'Security', short: 'Restricts specific columns via GRANT/DENY (warehouse) or a OneLake security role.' },
  { term: 'Object-Level Security (OLS)', category: 'Security', short: 'GRANT/DENY on specific database objects (tables, views, procedures).' },
  { term: 'Dynamic Data Masking (DDM)', category: 'Security', short: 'Obscures values in query results without changing stored data (warehouse only).', exam: 'Not real security alone — combine with RLS/CLS; not supported in OneLake security.' },
  { term: 'Sensitivity label', category: 'Security', short: 'A Microsoft Purview classification (e.g., Confidential) that flows downstream with protection.' },
  { term: 'Endorsement', category: 'Security', short: 'Promote or Certify to signal trusted, approved content. Certify is the highest trust signal.' },
  { term: 'Audit logs', category: 'Security', short: 'Microsoft Purview records of who accessed/changed what — the compliance source of truth.' },

  // --- Lifecycle ---
  { term: 'Git integration', category: 'Lifecycle', short: 'Connects a workspace to Azure DevOps/GitHub for version control, branching, and PR review.', exam: 'Tracks item metadata only — never table data. Complements deployment pipelines.' },
  { term: 'Deployment pipeline', category: 'Lifecycle', short: 'Promotes content across Dev → Test → Prod stages; copies metadata only and rebinds item dependencies.' },
  { term: 'Deployment rule', category: 'Lifecycle', short: 'A per-stage override (e.g., swap the data source) applied automatically at deploy time.' },
  { term: 'Variable library', category: 'Lifecycle', short: 'The strategic, recommended way to parameterize environment-specific config across stages.', exam: 'Now preferred over deployment rules for parameterization.' },
  { term: 'Database project', category: 'Lifecycle', short: 'A SQL project that versions warehouse schema as code for repeatable deployment.' },

  // --- Monitor ---
  { term: 'Monitoring hub', category: 'Monitor', short: 'One pane for run history across pipelines, dataflows, and notebooks — status, duration, errors, re-run.' },
  { term: 'Capacity Metrics app', category: 'Monitor', short: 'Tracks CU utilization, throttling, and overload events across a capacity.' },
  { term: 'Smoothing', category: 'Monitor', short: 'Spreading short compute spikes over time so brief heavy jobs borrow future capacity rather than failing.' },
  { term: 'Throttling', category: 'Monitor', short: 'Slowing/queuing of jobs when sustained demand exceeds capacity. Fix: scale, reschedule, or optimize — not blind retries.' },
  { term: 'Data skew', category: 'Monitor', short: 'One Spark task handling far more data than peers, stalling a stage. Fix: salt the key, repartition, or broadcast.' },
  { term: 'Broadcast join', category: 'Monitor', short: 'Sending a small table to every executor to avoid shuffling the large table — the big/small join fix.' },
  { term: 'Idempotent load', category: 'Monitor', short: 'A load that produces the same result on re-run (via MERGE keyed on business key) — safe for retries and late data.' },

  // --- Added depth ---
  { term: 'Apache Airflow job', category: 'Core', short: 'Fabric’s managed Apache Airflow for code-first (Python DAG) orchestration inside Data Factory.', exam: 'Choose over pipelines when the team prefers code/DAGs. Needs paid capacity — not Free/PPU.' },
  { term: 'DAG', category: 'Core', short: 'Directed Acyclic Graph — the Airflow structure defining tasks and their dependencies.' },
  { term: 'Data access role', category: 'Security', short: 'A OneLake security role: Data + Permission (Read/ReadWrite) + Members + Constraints (RLS/CLS).', exam: 'RLS+CLS for a table must be in ONE role; roles UNION across, INTERSECT within.' },
  { term: 'DefaultReader role', category: 'Security', short: 'A default OneLake role granting ReadAll on a lakehouse.', exam: 'Remove users from it when adding them to a restrictive role, or they keep full access.' },
  { term: 'User identity mode', category: 'Security', short: 'SQL analytics endpoint mode where OneLake security roles govern access (no SQL GRANT on tables). Default for new items.' },
  { term: 'Spark Job Definition (SJD)', category: 'Transform', short: 'A non-interactive, code-oriented Spark task — the production home for streaming and batch jobs (supports retry policy).', exam: 'Run production streams as SJDs with retries, not interactive notebooks.' },
  { term: 'Checkpoint', category: 'Real-Time', short: 'Durable storage of stream offsets + state so a Structured Streaming query resumes exactly-once after restart.', exam: 'One durable checkpointLocation PER query on a lakehouse path — never share or casually delete.' },
  { term: 'Available-now trigger', category: 'Real-Time', short: 'A Structured Streaming trigger that processes all currently available input then stops — for scheduled incremental runs.' },
  { term: 'Direct Lake', category: 'Warehouse', short: 'A semantic-model storage mode that loads OneLake Delta into VertiPaq memory — Import speed, no data copy.', exam: 'Direct Lake on OneLake never falls back; Direct Lake on SQL can fall back to DirectQuery.' },
  { term: 'Framing', category: 'Warehouse', short: 'A Direct Lake "refresh": a fast, metadata-only update pointing the model at the latest Delta Parquet files.' },
  { term: 'DirectQuery fallback', category: 'Warehouse', short: 'When Direct Lake-on-SQL reverts to slower DirectQuery — caused by SQL-endpoint RLS/DDM/OLS, SQL views, unframed tables, or exceeding guardrails.', exam: 'DirectLakeBehavior: Automatic (prod), DirectLakeOnly (dev — errors instead), DirectQueryOnly.' },
  { term: 'Reseed (mirroring)', category: 'Ingest', short: 'A full re-replication of a mirrored table, triggered by source DDL changes, stop/restart, or long capacity pauses.' },
]

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  'Core', 'Storage', 'Ingest', 'Transform', 'Real-Time', 'Warehouse', 'Security', 'Lifecycle', 'Monitor',
]
