import type { ExamQuestion } from './exam-bank'

/**
 * Domain 2 — Ingest & transform data (30–35%).
 * Loading patterns (full/incremental/dimensional/streaming), batch ingest &
 * transform (store choice, tool choice, shortcuts, mirroring, pipelines,
 * PySpark/SQL/KQL, denormalize/aggregate, dedupe/missing/late), and streaming
 * (engine choice, native vs shortcut, query acceleration, Eventstreams, Spark
 * structured streaming, KQL, windowing). Grounded in Microsoft Learn.
 */
export const BANK_INGEST: ExamQuestion[] = [
  // --- Loading patterns ---
  {
    id: 'g-lp-1',
    domain: 'ingest',
    prompt:
      'A 200M-row table is fully reloaded nightly, taking hours and risking throttling. Only ~50k rows change daily. What loading pattern should you switch to?',
    options: [
      'Keep full load but at 3 AM',
      'Incremental load using a high-watermark to fetch only changed rows',
      'Mirror the table',
      'Copy to CSV first',
    ],
    answer: 1,
    explanation:
      'An incremental (watermark-based) load pulls only rows changed since the last successful run, cutting runtime and capacity use dramatically versus a nightly full reload.',
    topic: 'Full vs incremental loads',
  },
  {
    id: 'g-lp-2',
    domain: 'ingest',
    prompt:
      'To make an incremental load safe against re-runs and late-arriving duplicates, apply changes with:',
    options: ['INSERT only', 'A MERGE (upsert) keyed on the business key', 'TRUNCATE + INSERT', 'A shortcut'],
    answer: 1,
    explanation:
      'MERGE matched on the business/surrogate key updates existing rows and inserts new ones, making the load idempotent — re-runs and late duplicates converge without double-counting.',
    topic: 'Incremental loads & MERGE',
  },
  {
    id: 'g-lp-3',
    domain: 'ingest',
    prompt:
      'You must preserve the customer’s city as it was at the time of each historical sale. Which dimension pattern?',
    options: [
      'SCD Type 1 (overwrite)',
      'SCD Type 2 (new row + StartDate/EndDate + IsCurrent)',
      'Drop history',
      'A masked column',
    ],
    answer: 1,
    explanation:
      'SCD Type 2 versions the dimension: a change adds a new row with validity dates and a current flag, so each fact links to the version valid at its time — preserving history.',
    topic: 'Slowly changing dimensions',
  },
  {
    id: 'g-lp-4',
    domain: 'ingest',
    prompt:
      'A fact arrives referencing a product not yet loaded into the product dimension. To keep the fact loadable and preserve referential integrity, you:',
    options: [
      'Reject the fact',
      'Insert an inferred-member placeholder dimension row, link the fact, and update attributes later',
      'Duplicate the fact across products',
      'Convert the fact to a dimension',
    ],
    answer: 1,
    explanation:
      'The late-arriving dimension (inferred member) pattern inserts a placeholder with the business key and Unknown attributes so the fact loads now; real attributes update when the dimension data arrives.',
    topic: 'Late-arriving data',
  },
  {
    id: 'g-lp-5',
    domain: 'ingest',
    prompt: 'Preparing data for a dimensional model, you should assign each dimension a…',
    options: [
      'Random GUID as the key',
      'Integer surrogate key (independent of the source business key)',
      'Free-text natural key only',
      'No key',
    ],
    answer: 1,
    explanation:
      'Surrogate keys (integers) decouple the model from source-key changes/reuse, join efficiently, and enable SCD Type 2 versioning. The business key is retained as an attribute for lookups.',
    topic: 'Dimensional modeling',
  },
  {
    id: 'g-lp-6',
    domain: 'ingest',
    prompt: 'A reliable high-watermark column must be one that…',
    options: [
      'Is a random value',
      'Monotonically increases as rows are inserted/updated (e.g., LastModified or identity)',
      'Holds the store name',
      'Is always NULL for new rows',
    ],
    answer: 1,
    explanation:
      'A watermark must move forward as data changes so "rows > last watermark" captures exactly the new/changed rows. Source-maintained timestamps or ever-increasing IDs qualify.',
    topic: 'Incremental loads & MERGE',
  },
  // --- Choosing a store / tool ---
  {
    id: 'g-ch-1',
    domain: 'ingest',
    prompt:
      'A team writes all transforms in PySpark over a mix of JSON files and Delta tables. Which store?',
    options: ['Warehouse', 'Lakehouse', 'KQL database', 'Semantic model'],
    answer: 1,
    explanation:
      'A lakehouse is Spark-first and holds both files (JSON) and Delta tables — the natural home for PySpark. A warehouse is T-SQL only and cannot store arbitrary files.',
    topic: 'Choosing a data store',
  },
  {
    id: 'g-ch-2',
    domain: 'ingest',
    prompt:
      'SQL developers need writable T-SQL with stored procedures, multi-table transactions, and INSERT/UPDATE/DELETE. Which store?',
    options: ['Lakehouse', 'Warehouse', 'Eventhouse', 'Lakehouse SQL analytics endpoint'],
    answer: 1,
    explanation:
      'The Warehouse is the fully transactional T-SQL store (DDL/DML/procs/transactions). The lakehouse SQL analytics endpoint is read-only (SELECT/views/TVFs only).',
    topic: 'Choosing a data store',
  },
  {
    id: 'g-ch-3',
    domain: 'ingest',
    prompt:
      'A citizen developer must combine three CSVs with simple column transforms at ingest, least code. Which tool?',
    options: ['Spark notebook', 'Dataflow Gen2', 'Bare Copy activity', 'KQL queryset'],
    answer: 1,
    explanation:
      'Dataflow Gen2 provides a low-code Power Query experience ideal for citizen developers doing simple transforms with minimal effort.',
    topic: 'Choosing an ingestion tool',
  },
  {
    id: 'g-ch-4',
    domain: 'ingest',
    prompt: 'Which is the best fit for high-throughput, sub-second queries over billions of streaming/log events?',
    options: ['Warehouse', 'Lakehouse', 'Eventhouse / KQL database', 'Dataflow Gen2'],
    answer: 2,
    explanation:
      'Eventhouse/KQL databases are optimized for high-volume time-series and log data with sub-second KQL queries — the streaming/analytics-in-motion store.',
    topic: 'Choosing a data store',
  },
  // --- Shortcuts ---
  {
    id: 'g-sc-1',
    domain: 'ingest',
    prompt:
      'Source data already sits in Amazon S3 and you want to analyze it in a lakehouse without copying it. What do you create?',
    options: ['A Copy activity', 'A OneLake shortcut', 'A mirrored database', 'A Dataflow Gen2'],
    answer: 1,
    explanation:
      'A OneLake shortcut virtualizes external data (ADLS Gen2, S3, GCS, Dataverse, or other OneLake) in place — no data movement.',
    topic: 'Shortcuts',
  },
  {
    id: 'g-sc-2',
    domain: 'ingest',
    prompt: 'When a lakehouse is deployed across stages, an INTERNAL OneLake shortcut is…',
    options: [
      'Broken and must be recreated',
      'Automatically remapped to the target stage’s equivalent item',
      'Copied with its data',
      'Ignored',
    ],
    answer: 1,
    explanation:
      'Deployment pipelines track shortcut definitions; internal OneLake shortcuts are automatically remapped across stages (external shortcuts keep the same target unless remapped via a Variable Library).',
    topic: 'Shortcuts',
  },
  // --- Mirroring ---
  {
    id: 'g-mr-1',
    domain: 'ingest',
    prompt:
      'You must continuously replicate an Azure SQL Database into OneLake as Delta, near-real-time, with no ETL to maintain. What do you use?',
    options: ['A OneLake shortcut', 'Mirroring', 'A scheduled full Copy', 'A Dataflow Gen2'],
    answer: 1,
    explanation:
      'Mirroring continuously replicates a supported operational database (Azure SQL DB, Cosmos DB, Snowflake, Fabric SQL DB) into OneLake as Delta with no ETL. Shortcuts reference files, not a live DB.',
    topic: 'Mirroring',
  },
  {
    id: 'g-mr-2',
    domain: 'ingest',
    prompt: 'A mirrored database in Fabric is…',
    options: [
      'Read-write from the SQL analytics endpoint',
      'Read-only — you cannot write to it or add calculated columns directly',
      'Editable only by Viewers',
      'A CSV export',
    ],
    answer: 1,
    explanation:
      'Mirrored databases are read-only in Fabric. To add calculated columns, create a lakehouse with shortcuts to the mirrored data and compute there.',
    topic: 'Mirroring',
  },
  {
    id: 'g-mr-3',
    domain: 'ingest',
    prompt: 'What is the maximum number of tables you can mirror into Fabric from a single source?',
    options: ['100', '500', '1,000', 'Unlimited'],
    answer: 2,
    explanation:
      'Mirroring supports up to 1,000 tables. With "Mirror all data", the first 1,000 tables (sorted by schema then table name) are replicated; the rest are skipped.',
    topic: 'Mirroring',
  },
  {
    id: 'g-mr-4',
    domain: 'ingest',
    prompt:
      'A large mirrored Snowflake table keeps doing a full "reseed" every few minutes, spiking cost. The most likely cause is:',
    options: [
      'Too few rows',
      'Frequent DDL changes (e.g., a dbt job dropping/recreating the table) trigger reseeds',
      'The watermark is wrong',
      'V-Order is off',
    ],
    answer: 1,
    explanation:
      'DDL changes (ALTER/drop-recreate, often from tools like dbt), stopping/restarting mirroring, or long capacity pauses trigger a full reseed. Schedule schema changes in maintenance windows to avoid reseed loops.',
    topic: 'Mirroring',
  },
  {
    id: 'g-mr-5',
    domain: 'ingest',
    prompt: 'Which workspace role is required to ENABLE mirroring for a source database?',
    options: ['Viewer', 'Contributor', 'Admin or Member', 'Any user'],
    answer: 2,
    explanation:
      'Enabling mirroring requires the Admin or Member workspace role (Write/Reshare). Contributors and Viewers cannot enable it.',
    topic: 'Mirroring',
  },
  // --- Pipelines & batch transform ---
  {
    id: 'g-pl-1',
    domain: 'ingest',
    prompt: 'The fastest way to bulk-load Parquet files from OneLake into a WAREHOUSE table in T-SQL is:',
    options: ['Row-by-row INSERT loop', 'COPY INTO', 'A OneLake shortcut', 'Power Query'],
    answer: 1,
    explanation:
      'COPY INTO is the high-throughput bulk-load statement that reads Parquet/CSV directly into a warehouse table — far faster than row-by-row inserts.',
    topic: 'Loading a warehouse',
  },
  {
    id: 'g-pl-2',
    domain: 'ingest',
    prompt: 'In a pipeline, to guarantee a cleansing notebook runs only after Copy succeeds, you:',
    options: [
      'Put them in separate pipelines',
      'Connect Copy’s "On success" (green) output to the Notebook activity',
      'Schedule them a minute apart',
      'Use a Set variable',
    ],
    answer: 1,
    explanation:
      'Activity dependencies (On success/failure/completion) control order. Linking Copy’s green On-success arrow to the notebook ensures it runs only after a successful copy.',
    topic: 'Pipeline orchestration',
  },
  {
    id: 'g-pl-3',
    domain: 'ingest',
    prompt: 'A cross-warehouse (three-part name) query joining a warehouse table to a lakehouse table works because…',
    options: [
      'The data is copied at query time',
      'Both store Delta in the same OneLake and share the workspace',
      'The warehouse imports the lakehouse',
      'It uses a linked server',
    ],
    answer: 1,
    explanation:
      'All Fabric SQL stores keep data as Delta in OneLake, so a three-part-name query can span a warehouse and a lakehouse SQL endpoint in the same workspace with no data movement.',
    topic: 'Cross-database queries',
  },
  {
    id: 'g-tr-1',
    domain: 'ingest',
    prompt: 'To keep only the most recent record per CustomerID in PySpark, the idiomatic approach is:',
    options: [
      'df.distinct()',
      'row_number() over a window partitioned by CustomerID ordered by LastModified desc, keep rn = 1',
      'GROUP BY CustomerID',
      'na.drop()',
    ],
    answer: 1,
    explanation:
      'A window function (row_number partitioned by key, ordered by recency) with filter rn = 1 deterministically keeps the newest row per key. distinct() only drops fully identical rows.',
    topic: 'Deduplication',
  },
  {
    id: 'g-tr-2',
    domain: 'ingest',
    prompt: 'Denormalizing into a wide gold table is primarily done to…',
    options: [
      'Save storage',
      'Speed up reporting reads by avoiding joins at query time',
      'Enforce referential integrity',
      'Enable streaming',
    ],
    answer: 1,
    explanation:
      'Pre-joining related tables into one wide table removes expensive join work at query time, speeding up Power BI and ad-hoc reads — trading storage and some freshness for read speed.',
    topic: 'Denormalization',
  },
  {
    id: 'g-tr-3',
    domain: 'ingest',
    prompt: 'A team is SQL-comfortable and the data lives in a lakehouse. Best transform option?',
    options: [
      'Writable T-SQL in the lakehouse SQL endpoint',
      'Spark SQL in a notebook',
      'KQL in an Eventhouse',
      'Power BI DAX',
    ],
    answer: 1,
    explanation:
      'Lakehouse data is processed with Spark; Spark SQL lets a SQL-comfortable team transform Delta tables. The lakehouse SQL endpoint is read-only, so it cannot perform writes/transforms.',
    topic: 'Choosing a transform engine',
  },
  {
    id: 'g-tr-4',
    domain: 'ingest',
    prompt: 'Handling missing values, which is a valid, deliberate strategy?',
    options: [
      'Always drop every null row',
      'Drop, impute, or flag per the business rule for that column',
      'Convert nulls to random values',
      'Ignore nulls entirely',
    ],
    answer: 1,
    explanation:
      'There is no one-size-fits-all: drop rows missing a required key, impute categoricals (e.g., "Unknown"), or flag — chosen per business rule for each column.',
    topic: 'Handling missing data',
  },
  {
    id: 'g-tr-5',
    domain: 'ingest',
    prompt: 'Which engine is designed to transform data stored in an Eventhouse?',
    options: ['T-SQL', 'KQL', 'DAX', 'Power Query M'],
    answer: 1,
    explanation:
      'Eventhouse/KQL databases are queried and transformed with Kusto Query Language (KQL), including update policies and materialized views for in-place shaping.',
    topic: 'Choosing a transform engine',
  },
  // --- Streaming ---
  {
    id: 'g-st-1',
    domain: 'ingest',
    prompt:
      'A no-code way to ingest Azure Event Hubs events, apply a simple filter, and route to both a KQL DB and a lakehouse is:',
    options: ['A Spark notebook', 'An Eventstream', 'A Dataflow Gen2', 'COPY INTO'],
    answer: 1,
    explanation:
      'An Eventstream ingests streaming sources with no code, applies simple transforms (filter/aggregate), and fans out to multiple destinations such as an Eventhouse and a lakehouse.',
    topic: 'Eventstream',
  },
  {
    id: 'g-st-2',
    domain: 'ingest',
    prompt:
      'Your streaming transform must join events to lakehouse Delta tables and keep custom state. Which engine?',
    options: ['Eventstream operators', 'Spark Structured Streaming', 'A KQL update policy', 'Dataflow Gen2'],
    answer: 1,
    explanation:
      'Joins to lakehouse tables plus custom stateful logic exceed no-code Eventstream operators — Spark Structured Streaming (readStream/writeStream with checkpoints) is built for this.',
    topic: 'Choosing a streaming engine',
  },
  {
    id: 'g-st-3',
    domain: 'ingest',
    prompt: 'Which KQL construct produces fixed, non-overlapping 5-minute windows?',
    options: ['summarize … by bin(Timestamp, 5m)', 'A hopping window', 'A session window', 'order by Timestamp'],
    answer: 0,
    explanation:
      'bin(Timestamp, 5m) inside summarize buckets events into fixed 5-minute tumbling windows where each event belongs to exactly one window.',
    topic: 'Windowing functions',
  },
  {
    id: 'g-st-4',
    domain: 'ingest',
    prompt: 'A "10-minute average recalculated every minute" is which window type?',
    options: ['Tumbling', 'Hopping', 'Session', 'Snapshot'],
    answer: 1,
    explanation:
      'A fixed 10-minute window advancing every 1 minute overlaps — a hopping window. Tumbling windows never overlap; session windows are gap-based.',
    topic: 'Windowing functions',
  },
  {
    id: 'g-st-5',
    domain: 'ingest',
    prompt:
      'A KQL database references cold OneLake Delta via a shortcut, but queries are slow versus native tables. Without copying data, you enable:',
    options: [
      'V-Order',
      'Query acceleration for OneLake shortcuts',
      'A bigger capacity',
      'An update policy',
    ],
    answer: 1,
    explanation:
      'Query acceleration for OneLake shortcuts caches/indexes the shortcut data in the Eventhouse engine for near-native KQL performance without duplicating the data.',
    topic: 'Query acceleration for shortcuts',
  },
  {
    id: 'g-st-6',
    domain: 'ingest',
    prompt:
      'In Real-Time Intelligence, choose NATIVE KQL tables over OneLake shortcuts when…',
    options: [
      'The data already lives in OneLake and copying is undesirable',
      'The data is hot, high-query streaming data needing fastest ingestion and query',
      'You never query the data',
      'You only need batch access',
    ],
    answer: 1,
    explanation:
      'Native KQL tables give the fastest ingest/query for hot streaming data (the engine manages storage/indexing). Shortcuts avoid copying when data already resides in OneLake, optionally with query acceleration.',
    topic: 'Native tables vs shortcuts',
  },
  {
    id: 'g-st-7',
    domain: 'ingest',
    prompt: 'Which Eventstream feature reduces downstream cost the most when 98% of events are idle heartbeats?',
    options: [
      'Adding more destinations',
      'A Filter transformation that drops heartbeats before they land',
      'A bigger Eventhouse',
      'Turning off V-Order',
    ],
    answer: 1,
    explanation:
      'Filtering junk in-flight means it is never ingested, stored, indexed, or scanned downstream — savings compound through every stage. Adding destinations increases cost.',
    topic: 'Eventstream',
  },
  {
    id: 'g-st-8',
    domain: 'ingest',
    prompt: 'Group events into variable-length windows separated by gaps of inactivity (e.g., user sessions). This is a…',
    options: ['Tumbling window', 'Hopping window', 'Session window', 'Snapshot window'],
    answer: 2,
    explanation:
      'Session windows group bursts of activity separated by idle gaps, producing variable-length windows — ideal for user/robot sessions.',
    topic: 'Windowing functions',
  },
]
