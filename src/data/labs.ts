/**
 * Guided end-to-end scenario labs. Each lab is Fabrikam Outdoor Gear's real
 * project, broken into gated steps: read the instruction, do it in your own
 * Fabric trial tenant, then pass the checkpoint to unlock the next step.
 */
export interface LabCheckpoint {
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export interface LabStep {
  title: string
  instruction: string
  path?: string // portal breadcrumb
  code?: { lang: string; code: string }
  checkpoint?: LabCheckpoint
}

export interface Lab {
  id: string
  icon: string
  title: string
  minutes: number
  scenario: string
  outcome: string
  steps: LabStep[]
}

export const LABS: Lab[] = [
  {
    id: 'lab-foundation',
    icon: '🧱',
    title: 'Lab 1 · Build Fabrikam’s lakehouse foundation',
    minutes: 45,
    scenario:
      'Fabrikam has signed off on Fabric. Your job this sprint: stand up the analytics workspace, land the first POS data, and shape it through bronze → silver → gold so the CFO sees a trustworthy sales table by Friday.',
    outcome: 'A working medallion lakehouse with cleaned Delta tables queryable from T-SQL.',
    steps: [
      {
        title: 'Create the workspace',
        instruction:
          'Sign in to the Fabric portal (a free trial capacity works). Create a workspace named fabrikam-analytics-dev and confirm it is assigned to a Fabric or Trial capacity — check License info in workspace settings. Everything in this lab lives here.',
        path: 'app.fabric.microsoft.com → Workspaces → + New workspace',
        checkpoint: {
          prompt: 'What gives the new workspace its compute?',
          options: [
            'The workspace license is per-user only',
            'The capacity (F-SKU or trial) it is assigned to',
            'The lakehouse inside it',
            'OneLake storage tier',
          ],
          answer: 1,
          explanation:
            'A workspace draws all compute from the single capacity it is assigned to. No capacity, no Spark/warehouse/eventhouse workloads.',
        },
      },
      {
        title: 'Provision the lakehouse',
        instruction:
          'Create a Lakehouse named sales_lh. Note the two companion items Fabric provisions automatically — you will use the SQL analytics endpoint at the end of this lab. Explore the Tables vs Files split in the Lakehouse explorer.',
        path: '+ New item → Lakehouse → sales_lh',
        checkpoint: {
          prompt: 'Which two items appeared alongside your new lakehouse?',
          options: [
            'A pipeline and a report',
            'A SQL analytics endpoint and a default semantic model',
            'An Eventstream and a KQL database',
            'A warehouse and a dataflow',
          ],
          answer: 1,
          explanation:
            'Every lakehouse automatically gets a read-only SQL analytics endpoint (T-SQL over its Delta tables) and a default semantic model (for Power BI).',
        },
      },
      {
        title: 'Land bronze data',
        instruction:
          'Create a Files subfolder bronze/pos. Download any sample sales CSV (or export one from Excel: OrderID, OrderDate, StoreID, ProductID, Quantity, UnitPrice — a few duplicate OrderIDs and a blank row make the next step realistic). Upload it with Get data → Upload files. Bronze rule: land it exactly as it arrived — no edits.',
        path: 'sales_lh → Files → New subfolder → Get data → Upload files',
        checkpoint: {
          prompt: 'Why do we not fix the duplicates before uploading to bronze?',
          options: [
            'Duplicates are fine in gold',
            'Bronze preserves raw data unchanged as the auditable source of truth; cleaning happens in silver',
            'Fabric rejects modified files',
            'CSV cannot be edited',
          ],
          answer: 1,
          explanation:
            'The bronze layer stores data exactly as received so you can always re-derive downstream layers and audit what the source actually sent. Cleansing belongs to silver.',
        },
      },
      {
        title: 'Clean to silver with a notebook',
        instruction:
          'Open a new notebook attached to sales_lh and build the silver table: read the bronze CSV, drop rows missing OrderID, deduplicate on OrderID keeping the latest, cast types, and save as a managed Delta table.',
        path: 'sales_lh → Open notebook → New notebook',
        code: {
          lang: 'python',
          code: `df = (spark.read.option("header","true").option("inferSchema","true")
        .csv("Files/bronze/pos/*.csv"))

from pyspark.sql.window import Window
from pyspark.sql.functions import col, row_number

w = Window.partitionBy("OrderID").orderBy(col("OrderDate").desc())
silver = (df.na.drop(subset=["OrderID"])
            .withColumn("rn", row_number().over(w))
            .filter(col("rn") == 1).drop("rn")
            .withColumn("UnitPrice", col("UnitPrice").cast("double")))

silver.write.format("delta").mode("overwrite").saveAsTable("sales_silver")`,
        },
        checkpoint: {
          prompt: 'saveAsTable("sales_silver") put the data where?',
          options: [
            'In Files/ as CSV',
            'In the Tables area as a managed Delta table',
            'In the warehouse',
            'In the semantic model',
          ],
          answer: 1,
          explanation:
            'saveAsTable creates a managed Delta table under the lakehouse Tables area — Fabric owns the files, and the table is instantly visible to the SQL analytics endpoint.',
        },
      },
      {
        title: 'Aggregate to gold',
        instruction:
          'In the same notebook, build the CFO’s table: revenue per store per day, saved as sales_by_store_gold. This is the only table business users should touch.',
        code: {
          lang: 'python',
          code: `from pyspark.sql.functions import sum as _sum, countDistinct, expr

gold = (spark.table("sales_silver")
    .withColumn("Revenue", expr("Quantity * UnitPrice"))
    .groupBy("StoreID", "OrderDate")
    .agg(_sum("Revenue").alias("Revenue"),
         countDistinct("OrderID").alias("Orders")))

gold.write.format("delta").mode("overwrite").saveAsTable("sales_by_store_gold")`,
        },
      },
      {
        title: 'Verify from T-SQL',
        instruction:
          'Switch the lakehouse to SQL analytics endpoint mode (top-right selector) and run: SELECT TOP 10 * FROM sales_by_store_gold ORDER BY Revenue DESC. Confirm the CFO’s numbers are there — same physical Delta files, zero copies. Lab complete!',
        path: 'sales_lh → mode selector → SQL analytics endpoint',
        checkpoint: {
          prompt: 'An analyst now tries INSERT INTO sales_by_store_gold via this endpoint. What happens?',
          options: [
            'It succeeds',
            'It fails — the SQL analytics endpoint is read-only; writes need Spark or a Warehouse',
            'It creates a new lakehouse',
            'It converts the table to CSV',
          ],
          answer: 1,
          explanation:
            'The lakehouse SQL analytics endpoint supports SELECT (plus views/TVFs) but no DML. Writable T-SQL requires a Warehouse; lakehouse writes happen through Spark.',
        },
      },
    ],
  },
  {
    id: 'lab-nightly',
    icon: '🌙',
    title: 'Lab 2 · Fabrikam’s nightly incremental load',
    minutes: 50,
    scenario:
      'The full reload of 180M order rows takes 4 hours and once throttled the whole capacity. Tonight you replace it: a watermark-driven incremental pipeline that pulls only changed rows, merges them idempotently, and alerts the team if anything fails.',
    outcome: 'A scheduled, metadata-driven pipeline with watermark incremental loads and MERGE upserts.',
    steps: [
      {
        title: 'Create the control table',
        instruction:
          'In sales_lh (or a warehouse), create a control table holding one row per source table with its last high-watermark. The pipeline reads it before each run and advances it after.',
        code: {
          lang: 'sql',
          code: `CREATE TABLE etl_control (
  SourceTable   VARCHAR(100),
  WatermarkCol  VARCHAR(100),
  LastWatermark DATETIME2
);
INSERT INTO etl_control VALUES ('orders', 'LastModified', '1900-01-01');`,
        },
        checkpoint: {
          prompt: 'What makes a column a valid watermark?',
          options: [
            'It is a GUID',
            'It reliably increases as rows are inserted/changed (e.g. LastModified or an ever-growing ID)',
            'It contains the store name',
            'It is nullable',
          ],
          answer: 1,
          explanation:
            'A watermark must move monotonically forward so "rows > last watermark" captures exactly the new/changed rows. Timestamps maintained by the source or identity keys qualify.',
        },
      },
      {
        title: 'Build the incremental pipeline',
        instruction:
          'Create pipeline pl_nightly_orders: a Lookup activity reads etl_control, then a Copy activity uses a dynamic source query with the watermark, landing rows into a staging table.',
        path: '+ New item → Data pipeline → pl_nightly_orders',
        code: {
          lang: 'text',
          code: `Source query (dynamic content):
SELECT * FROM orders
WHERE LastModified > '@{activity('LookupWatermark').output.firstRow.LastWatermark}'`,
        },
        checkpoint: {
          prompt: 'Why Lookup → Copy instead of hard-coding the date in the Copy source?',
          options: [
            'Hard-coding is faster',
            'The watermark changes every run; Lookup + dynamic content makes the pipeline self-maintaining',
            'Copy cannot use SQL queries',
            'Lookup is required by licensing',
          ],
          answer: 1,
          explanation:
            'Reading the watermark from the control table at run time means the same pipeline works every night without edits — the essence of a metadata-driven design.',
        },
      },
      {
        title: 'MERGE the staged rows',
        instruction:
          'Add a Notebook activity (linked On success from Copy) that merges staging into the silver orders table — idempotent, so a re-run or late-arriving duplicate can never double-count.',
        code: {
          lang: 'python',
          code: `from delta.tables import DeltaTable

tgt = DeltaTable.forName(spark, "orders_silver")
src = spark.table("orders_staging")

(tgt.alias("t")
   .merge(src.alias("s"), "t.OrderID = s.OrderID")
   .whenMatchedUpdateAll(condition="s.LastModified > t.LastModified")
   .whenNotMatchedInsertAll()
   .execute())`,
        },
        checkpoint: {
          prompt: 'The pipeline reruns after a partial failure and processes the same staged rows again. What does the MERGE do?',
          options: [
            'Inserts duplicates',
            'Updates/skips matched rows and inserts only genuinely new ones — no duplicates (idempotent)',
            'Truncates the target',
            'Fails with a key violation',
          ],
          answer: 1,
          explanation:
            'MERGE keyed on OrderID makes reprocessing safe: matched rows update (only if newer), unmatched insert. Re-runs converge to the same correct state.',
        },
      },
      {
        title: 'Advance the watermark',
        instruction:
          'Add a final activity (script/stored proc/notebook) that updates etl_control with MAX(LastModified) from the rows just processed — only after the MERGE succeeds. Order matters: advancing before a successful merge can silently skip rows forever.',
        checkpoint: {
          prompt: 'Why advance the watermark only after a successful MERGE?',
          options: [
            'To make the pipeline slower',
            'If it advanced first and the MERGE failed, the next run would skip those rows permanently',
            'The watermark cannot be updated twice',
            'Because Lookup locks the table',
          ],
          answer: 1,
          explanation:
            'Advance-on-success guarantees at-least-once processing; combined with the idempotent MERGE you get exactly-once results. Advancing early risks silent data loss.',
        },
      },
      {
        title: 'Scale out with ForEach',
        instruction:
          'Fabrikam has 38 source tables. Convert the pipeline: Lookup now returns all control rows; wrap the Copy+Merge in a ForEach over them, passing table/column names as parameters. One pipeline, 38 tables.',
        checkpoint: {
          prompt: 'This design pattern is called…',
          options: ['Star schema', 'Metadata-driven (control-table) orchestration', 'Medallion', 'Mirroring'],
          answer: 1,
          explanation:
            'Driving a generic pipeline from a control table via Lookup + ForEach + parameters is the metadata-driven pattern — the standard answer for "load many tables without many pipelines".',
        },
      },
      {
        title: 'Schedule and alert',
        instruction:
          'Schedule the pipeline for 02:00 daily. Add an On-failure path (e.g. Teams/Outlook activity or an Activator alert) so the team hears about failures before the CFO does. Run it once manually and check the run in the Monitoring hub. Lab complete!',
        path: 'Pipeline → Schedule · Monitoring hub',
      },
    ],
  },
  {
    id: 'lab-realtime',
    icon: '📡',
    title: 'Lab 3 · Live dock monitoring with Real-Time Intelligence',
    minutes: 40,
    scenario:
      'Warehouse robots emit 50k events/minute and dock managers still learn about conveyor jams by email. You will wire the live pipeline: Eventstream in, Eventhouse for queries, a live dashboard, and an Activator alert when a belt stalls.',
    outcome: 'A streaming path from source → Eventstream → Eventhouse → KQL dashboard → alert.',
    steps: [
      {
        title: 'Create the Eventhouse',
        instruction:
          'Create an Eventhouse named ops_eh — this provisions a KQL database of the same name. This is the reservoir your live queries will hit.',
        path: '+ New item → Eventhouse → ops_eh',
      },
      {
        title: 'Build the Eventstream',
        instruction:
          'Create an Eventstream es_dock. Add a source — use the built-in Sample data (e.g. bicycle/taxi events stand in for robot telemetry). Watch events flow in the live preview.',
        path: '+ New item → Eventstream → Add source → Sample data',
        checkpoint: {
          prompt: 'For production, robot telemetry from Azure Event Hubs would connect how?',
          options: [
            'Via a Dataflow Gen2',
            'As an Eventstream source connector (Event Hubs / IoT Hub / Kafka)',
            'Via COPY INTO',
            'Only through a notebook',
          ],
          answer: 1,
          explanation:
            'Eventstream natively connects streaming sources — Azure Event Hubs, IoT Hub, Kafka, CDC feeds — with no code. Batch tools like COPY INTO or Dataflows are the wrong shape for continuous streams.',
        },
      },
      {
        title: 'Filter the noise',
        instruction:
          'Add a Filter transformation between source and destination that drops heartbeat/idle events (≈98% of volume at Fabrikam). Less junk stored = faster queries and lower capacity burn.',
        checkpoint: {
          prompt: 'Filtering in the stream (vs after landing) primarily saves…',
          options: [
            'Nothing — same cost',
            'Ingestion, storage, and query cost downstream — junk never lands',
            'Only screen space',
            'It improves source battery life',
          ],
          answer: 1,
          explanation:
            'Dropping unneeded events in-flight means the Eventhouse never ingests, stores, indexes, or scans them — savings compound through every downstream stage.',
        },
      },
      {
        title: 'Route to the Eventhouse',
        instruction:
          'Add a destination: your ops_eh KQL database, new table dock_events. Use direct ingestion mode. Confirm rows arrive by opening the KQL database and running dock_events | take 10.',
        path: 'Eventstream → Add destination → Eventhouse',
      },
      {
        title: 'Query with windows',
        instruction:
          'In a KQL queryset, build the dock manager’s number: events per zone per 1-minute tumbling window. This query becomes a dashboard tile next.',
        code: {
          lang: 'kql',
          code: `dock_events
| summarize Events = count(), AvgSpeed = avg(speed)
        by bin(ingestion_time(), 1m), zone
| order by ingestion_time() desc`,
        },
        checkpoint: {
          prompt: 'The manager wants a 10-minute average refreshed every minute instead. That window is…',
          options: ['Tumbling', 'Hopping', 'Session', 'Static'],
          answer: 1,
          explanation:
            'Fixed 10-minute windows advancing every 1 minute overlap — a hopping window. bin() alone gives tumbling; hopping needs the overlapping pattern.',
        },
      },
      {
        title: 'Dashboard + Activator alert',
        instruction:
          'Pin the query to a Real-Time Dashboard with 30s auto-refresh. Then add an Activator rule (from the Eventstream or dashboard): when Events for any zone drops to 0 for 5 minutes — a stalled belt — alert the shift-lead channel in Teams. Lab complete!',
        path: 'Queryset → Pin to dashboard · + New item → Activator',
        checkpoint: {
          prompt: 'Which component fires the Teams alert when the stall condition is met?',
          options: ['The Eventhouse', 'Activator', 'The semantic model', 'OneLake'],
          answer: 1,
          explanation:
            'Activator (Data Activator) watches streams/queries for conditions and triggers actions — email, Teams, Power Automate, pipelines. Dashboards visualize; Activator acts.',
        },
      },
    ],
  },
  {
    id: 'lab-ship',
    icon: '🚢',
    title: 'Lab 4 · Secure it and ship it',
    minutes: 45,
    scenario:
      'The solution works — now make it production-grade. Lock down access so 90 store managers see only their own rows, put everything under source control, and promote Dev → Test → Prod without hand-edits.',
    outcome: 'Least-privilege security, Git-backed workspaces, and a working deployment pipeline.',
    steps: [
      {
        title: 'Right-size workspace roles',
        instruction:
          'Audit workspace access: engineers → Contributor, team lead → Member, store-ops & CFO → Viewer, platform owner only → Admin. Remove any leftover Admin grants (remember the intern incident).',
        path: 'Workspace → Manage access',
        checkpoint: {
          prompt: 'A developer must build and run pipelines but never manage sharing. Which role?',
          options: ['Viewer', 'Contributor', 'Member', 'Admin'],
          answer: 1,
          explanation:
            'Contributor creates/edits/runs items but cannot manage workspace access — the least-privilege fit for a developer.',
        },
      },
      {
        title: 'Row-level security for store managers',
        instruction:
          'In the gold warehouse, create the RLS predicate + policy so each manager sees only their store’s rows. Test with EXECUTE AS USER.',
        code: {
          lang: 'sql',
          code: `CREATE FUNCTION dbo.fn_storeFilter(@StoreManager AS sysname)
RETURNS TABLE WITH SCHEMABINDING AS
RETURN SELECT 1 AS ok
       WHERE @StoreManager = USER_NAME()
          OR IS_ROLEMEMBER('HQAnalysts') = 1;

CREATE SECURITY POLICY dbo.StorePolicy
  ADD FILTER PREDICATE dbo.fn_storeFilter(ManagerUPN) ON dbo.sales_by_store_gold
  WITH (STATE = ON);`,
        },
        checkpoint: {
          prompt: 'RLS enforcement happens…',
          options: [
            'In the Power BI visual only',
            'At the database engine level — every query path is filtered',
            'Only for Viewers',
            'Only in scheduled refreshes',
          ],
          answer: 1,
          explanation:
            'The security policy binds the predicate at the engine level, so any T-SQL access path (reports, ad-hoc queries, exports) gets filtered rows. UI-level filters can be bypassed; RLS cannot.',
        },
      },
      {
        title: 'Connect Git',
        instruction:
          'In workspace settings, connect fabrikam-analytics-dev to an Azure DevOps or GitHub repo, main branch, and commit all items. Make a trivial notebook edit, commit it, and view the diff in the repo — this is your change history from now on.',
        path: 'Workspace settings → Git integration → Connect',
        checkpoint: {
          prompt: 'Git integration gives you what deployment pipelines do not?',
          options: [
            'Dev/Test/Prod promotion',
            'Version history, branching, and pull-request review of item definitions',
            'Faster Spark jobs',
            'Row-level security',
          ],
          answer: 1,
          explanation:
            'Git = source control (history, branches, PRs). Deployment pipelines = stage promotion. They complement each other; neither replaces the other.',
        },
      },
      {
        title: 'Create the deployment pipeline',
        instruction:
          'Create deployment pipeline fabrikam-release with Dev, Test, Prod stages. Assign your dev workspace to Dev, and create (or assign) fabrikam-analytics-test and -prod workspaces to the other stages. Deploy Dev → Test.',
        path: '+ New → Deployment pipeline → assign workspaces → Deploy',
      },
      {
        title: 'Add deployment rules',
        instruction:
          'On the Test and Prod stages, add deployment rules so items point at the right stage’s lakehouse/warehouse (not the dev ones). Deploy again and verify Test items read Test data. No more post-deploy hand-edits.',
        checkpoint: {
          prompt: 'After promoting to Prod, the pipeline still reads the DEV lakehouse. The fix is…',
          options: [
            'Edit the Prod item manually after every deploy',
            'A deployment rule on the Prod stage that swaps the data source',
            'Delete Prod and rebuild',
            'Give Prod users access to Dev',
          ],
          answer: 1,
          explanation:
            'Deployment rules apply stage-specific values (connections, parameters) automatically at deploy time — the supported way to vary config per environment.',
        },
      },
      {
        title: 'Prove the ops story',
        instruction:
          'Final check: open the Monitoring hub and confirm last night’s runs are green; open the Capacity Metrics app and note CU utilization; confirm the failure alert from Lab 2 works by temporarily breaking a connection (then fixing it). You now run a governed, observable, promotable analytics platform. Series complete! 🎉',
        path: 'Monitoring hub · Capacity Metrics app',
      },
    ],
  },
  {
    id: 'lab-warehouse',
    icon: '🏢',
    title: 'Lab 5 · Fabrikam’s finance data warehouse',
    minutes: 50,
    scenario:
      'Finance wants a governed T-SQL warehouse for month-end: a clean star schema, stored procedures for the close, and cross-querying to the lakehouse — without copying data.',
    outcome: 'A warehouse with a star schema, COPY INTO loads, SCD Type 2 dimension, and serving views/procs.',
    steps: [
      {
        title: 'Create the warehouse',
        instruction:
          'Create a Warehouse named finance_dw. Unlike the lakehouse SQL endpoint, this one is fully writable T-SQL (INSERT/UPDATE/DELETE, procedures, transactions).',
        path: '+ New item → Warehouse → finance_dw',
        checkpoint: {
          prompt: 'What can finance_dw do that the lakehouse SQL analytics endpoint cannot?',
          options: [
            'Store Delta in OneLake',
            'Run INSERT/UPDATE/DELETE and multi-table transactions in T-SQL',
            'Be queried with SELECT',
            'Have a semantic model',
          ],
          answer: 1,
          explanation:
            'The Warehouse is fully transactional T-SQL (DML, procs, transactions). The lakehouse SQL endpoint is read-only (SELECT/views/TVFs).',
        },
      },
      {
        title: 'Bulk-load with COPY INTO',
        instruction:
          'Create a staging table and bulk-load the archived ledger Parquet from OneLake using COPY INTO — the fastest native T-SQL load path.',
        code: {
          lang: 'sql',
          code: `CREATE TABLE dbo.ledger_stage (LedgerID BIGINT, AccountID INT, Amount DECIMAL(18,2), PostedDate DATE);

COPY INTO dbo.ledger_stage
FROM 'https://onelake.dfs.fabric.microsoft.com/<ws>/sales_lh.Lakehouse/Files/ledger/*.parquet'
WITH (FILE_TYPE = 'PARQUET', CREDENTIAL = (IDENTITY = 'Managed Identity'));`,
        },
        checkpoint: {
          prompt: 'Why COPY INTO instead of a row-by-row INSERT loop?',
          options: [
            'It enforces RLS',
            'It is the high-throughput bulk-load path for Parquet/CSV into a warehouse table',
            'It creates shortcuts',
            'It is required for transactions',
          ],
          answer: 1,
          explanation:
            'COPY INTO reads Parquet/CSV files directly into a warehouse table at high throughput — far faster than looping inserts.',
        },
      },
      {
        title: 'Model the star schema',
        instruction:
          'Create dim_date, dim_account (with surrogate keys), and fact_ledger with FKs. Dimensions hold descriptive attributes; the fact holds measures + keys.',
        code: {
          lang: 'sql',
          code: `CREATE TABLE dbo.dim_account (
  AccountKey INT NOT NULL,        -- surrogate key
  AccountID  INT NOT NULL,        -- business key
  AccountName VARCHAR(100), Category VARCHAR(50),
  ValidFrom DATE, ValidTo DATE, IsCurrent BIT);   -- SCD Type 2 columns

CREATE TABLE dbo.fact_ledger (
  LedgerKey BIGINT, DateKey INT, AccountKey INT, Amount DECIMAL(18,2));`,
        },
        checkpoint: {
          prompt: 'Why give dim_account an integer AccountKey separate from AccountID?',
          options: [
            'Business keys cannot be indexed',
            'Surrogate keys insulate the model from source-key changes and enable SCD Type 2 versioning',
            'Delta requires it',
            'It saves nothing',
          ],
          answer: 1,
          explanation:
            'Surrogate keys decouple the warehouse from source systems and let multiple versions of an account coexist for history (SCD Type 2).',
        },
      },
      {
        title: 'Load the SCD Type 2 dimension',
        instruction:
          'Write a stored procedure that MERGEs staged accounts into dim_account: when an attribute changes, close the current row (set ValidTo/IsCurrent=0) and insert a new current version.',
        checkpoint: {
          prompt: 'An account’s Category changes. Under SCD Type 2, what happens to history?',
          options: [
            'The old value is overwritten',
            'A new row is added with new validity dates; the old row is retained with IsCurrent=0',
            'The row is deleted',
            'Nothing changes',
          ],
          answer: 1,
          explanation:
            'SCD Type 2 preserves history: the prior version is closed (ValidTo set, IsCurrent=0) and a new current row is inserted, so past facts still map to the value that was valid then.',
        },
      },
      {
        title: 'Create serving views & procedures',
        instruction:
          'Create a view v_monthly_close aggregating fact_ledger by month/account, and a stored procedure sp_run_close(@Period) that finance runs each month. These are the reusable serving objects.',
        code: {
          lang: 'sql',
          code: `CREATE VIEW dbo.v_monthly_close AS
SELECT d.[Year], d.MonthName, a.Category, SUM(f.Amount) AS Total
FROM dbo.fact_ledger f
JOIN dbo.dim_date d ON f.DateKey = d.DateKey
JOIN dbo.dim_account a ON f.AccountKey = a.AccountKey AND a.IsCurrent = 1
GROUP BY d.[Year], d.MonthName, a.Category;`,
        },
      },
      {
        title: 'Cross-query the lakehouse',
        instruction:
          'Run a three-part-name query joining finance_dw.dbo.fact_ledger to sales_lh’s customer segment table — no copy, because both are Delta in OneLake in the same workspace. Lab complete!',
        code: {
          lang: 'sql',
          code: `SELECT a.Category, SUM(f.Amount) AS Total, c.Segment
FROM finance_dw.dbo.fact_ledger f
JOIN finance_dw.dbo.dim_account a ON f.AccountKey = a.AccountKey
JOIN sales_lh.dbo.customers c ON a.AccountID = c.CustomerID
GROUP BY a.Category, c.Segment;`,
        },
        checkpoint: {
          prompt: 'How can one query join a warehouse table to a lakehouse table with no data movement?',
          options: [
            'It secretly copies data',
            'Both store Delta in the same OneLake and share the workspace, so three-part names span them',
            'It uses a linked server',
            'It exports to CSV first',
          ],
          answer: 1,
          explanation:
            'All Fabric SQL stores keep data as Delta in OneLake; a three-part-name query spans a warehouse and a lakehouse SQL endpoint in the same workspace with no copy.',
        },
      },
    ],
  },
  {
    id: 'lab-lowcode',
    icon: '🧩',
    title: 'Lab 6 · Low-code ingestion: mirroring + Dataflow Gen2',
    minutes: 40,
    scenario:
      'Not every source needs Spark. Fabrikam’s order system is an Azure SQL DB (mirror it), and a buyer maintains supplier prices in Excel (let her own a Dataflow Gen2). No pipelines to babysit.',
    outcome: 'A mirrored operational database plus a citizen-built low-code transform landing to the lakehouse.',
    steps: [
      {
        title: 'Mirror the operational database',
        instruction:
          'Create a Mirrored Azure SQL Database in the workspace, connect to the source, and select the orders tables. Fabric continuously replicates them into OneLake as Delta — near-real-time, no ETL.',
        path: '+ New item → Mirrored Azure SQL Database',
        checkpoint: {
          prompt: 'A mirrored database in Fabric is…',
          options: [
            'Writable from Fabric',
            'Read-only — a continuously replicated Delta copy of the source',
            'A one-time CSV export',
            'Only refreshed nightly',
          ],
          answer: 1,
          explanation:
            'Mirroring gives a read-only, continuously updated Delta replica in OneLake. To add computed columns, shortcut it into a lakehouse and transform there.',
        },
      },
      {
        title: 'Shortcut the mirror into the lakehouse',
        instruction:
          'In sales_lh, create an internal OneLake shortcut to the mirrored orders table so Spark and SQL can use it alongside your other data — no copy.',
        path: 'sales_lh → New shortcut → OneLake',
        checkpoint: {
          prompt: 'Why shortcut the mirror instead of copying it into the lakehouse?',
          options: [
            'Copying is faster',
            'A shortcut references the single Delta copy in place — zero duplication, always current',
            'Shortcuts encrypt data',
            'Mirrors cannot be queried otherwise',
          ],
          answer: 1,
          explanation:
            'A shortcut virtualizes the mirrored Delta data in place, so there’s one copy that stays current — no duplication or extra sync.',
        },
      },
      {
        title: 'Build a Dataflow Gen2 (citizen developer)',
        instruction:
          'Create a Dataflow Gen2. Connect to the supplier price Excel/CSV, use the Power Query editor to trim columns, fix data types, and filter test rows — all no-code. The buyer can own and refresh this herself.',
        path: '+ New item → Dataflow Gen2 → Get data',
        checkpoint: {
          prompt: 'Why a Dataflow Gen2 rather than a Spark notebook here?',
          options: [
            'It scales to petabytes better',
            'Low-code Power Query suits a citizen developer doing simple transforms with least effort',
            'Notebooks cannot read Excel',
            'It is the only option',
          ],
          answer: 1,
          explanation:
            'Dataflow Gen2 gives a low-code Power Query experience ideal for a non-coder doing simple cleanup — the least-effort transform tool.',
        },
      },
      {
        title: 'Set the data destination',
        instruction:
          'Configure the Dataflow’s data destination to a table in sales_lh (e.g. supplier_prices). Publish and refresh. Confirm the table appears in the lakehouse.',
        path: 'Dataflow Gen2 → Data destination → Lakehouse',
        checkpoint: {
          prompt: 'A Dataflow Gen2 can land its output to which of these?',
          options: [
            'Only a CSV download',
            'A lakehouse, warehouse, KQL database, or Azure SQL (configurable data destination)',
            'Only its internal staging',
            'A Power BI report only',
          ],
          answer: 1,
          explanation:
            'Configurable data destinations (lakehouse, warehouse, KQL DB, Azure SQL) are a defining Gen2 capability, letting the cleaned output land where you need it.',
        },
      },
      {
        title: 'Right-size the refresh',
        instruction:
          'Schedule the Dataflow to refresh after the supplier file typically arrives, or trigger it from the master pipeline. Keep the buyer as owner so she maintains her own source. Lab complete!',
        path: 'Dataflow Gen2 → Schedule / pipeline Dataflow activity',
      },
    ],
  },
  {
    id: 'lab-optimize',
    icon: '⚙️',
    title: 'Lab 7 · Monitoring, triage & optimization',
    minutes: 45,
    scenario:
      'Six months in, dashboards are slow, storage is ballooning, and jobs occasionally fail. Turn Fabrikam into a well-run shop: watch the right dashboards, fix errors at the root, and tune the tables.',
    outcome: 'A monitored, optimized platform: compacted tables, tuned Spark, and alerting on failures.',
    steps: [
      {
        title: 'Establish monitoring',
        instruction:
          'Open the Monitoring hub and review last night’s runs (status, duration). Then open the Fabric Capacity Metrics app and note CU utilization and any throttling. These are your morning dashboards.',
        path: 'Monitoring hub · Capacity Metrics app',
        checkpoint: {
          prompt: 'Jobs are queuing workspace-wide. Which tool confirms a capacity/throttling issue?',
          options: [
            'The Spark UI',
            'The Fabric Capacity Metrics app',
            'The lakehouse explorer',
            'A deployment pipeline',
          ],
          answer: 1,
          explanation:
            'The Capacity Metrics app shows CU utilization, throttling, and overload events — the place to confirm capacity pressure.',
        },
      },
      {
        title: 'Compact the small-file problem',
        instruction:
          'Hourly micro-batches left orders_silver with tens of thousands of tiny files, slowing reads. Run OPTIMIZE to bin-compact them (with V-Order), then schedule it weekly.',
        code: { lang: 'sql', code: `OPTIMIZE orders_silver;` },
        checkpoint: {
          prompt: 'Thousands of tiny files are slowing Power BI reads. The fix is…',
          options: ['VACUUM', 'OPTIMIZE (bin-compaction)', 'Delete and reload', 'Disable V-Order'],
          answer: 1,
          explanation:
            'OPTIMIZE compacts many small files into fewer larger ones (with V-Order), directly fixing the small-file read slowdown. VACUUM removes old files but does not compact.',
        },
      },
      {
        title: 'Reclaim storage with VACUUM',
        instruction:
          'Storage grew from months of Delta versions. Run VACUUM to remove files no longer referenced (default 7-day retention protects time-travel). Schedule it alongside OPTIMIZE.',
        code: { lang: 'sql', code: `VACUUM orders_silver RETAIN 168 HOURS;` },
        checkpoint: {
          prompt: 'Why won’t VACUUM delete very recent files by default?',
          options: [
            'A bug',
            'The 7-day default retention protects time-travel and in-flight readers',
            'It only deletes gold tables',
            'It never deletes anything',
          ],
          answer: 1,
          explanation:
            'By default VACUUM won’t remove files newer than 7 days, preserving time-travel and consistency for readers/queries in flight.',
        },
      },
      {
        title: 'Fix a skewed Spark join',
        instruction:
          'A nightly notebook joins a huge fact DataFrame to a 200-row store dimension and spills/shuffles for minutes. Broadcast the small dimension to eliminate the shuffle.',
        code: {
          lang: 'python',
          code: `from pyspark.sql.functions import broadcast
result = fact.join(broadcast(store_dim), "StoreID", "left")`,
        },
        checkpoint: {
          prompt: 'The big-table/small-table join is slow due to shuffling. Best fix?',
          options: [
            'Add more small files',
            'Broadcast the small dimension so it’s sent to every executor (no shuffle)',
            'Disable V-Order',
            'Increase VACUUM retention',
          ],
          answer: 1,
          explanation:
            'Broadcasting the small table avoids shuffling the large fact table across the cluster — the standard remedy for a big/small join.',
        },
      },
      {
        title: 'Triage a real failure',
        instruction:
          'The ERP password rotated overnight and Copy failed with an auth error. Practice the playbook: open the failed activity in the Monitoring hub, read the error, fix the connection credential, add a retry policy, and re-run.',
        path: 'Monitoring hub → failed run → error detail',
        checkpoint: {
          prompt: 'A Copy activity fails intermittently with transient timeouts. Beyond fixing root causes, what makes it self-heal?',
          options: [
            'Scheduling it twice',
            'An activity retry count + interval',
            'A bigger capacity',
            'Turning off logging',
          ],
          answer: 1,
          explanation:
            'A retry policy (count + interval) lets transient failures self-heal without manual re-runs. Combine with an idempotent MERGE so re-runs never double-load.',
        },
      },
      {
        title: 'Alert so you hear it first',
        instruction:
          'Create an Activator rule (or refresh/failure notification) that posts to the data team’s Teams channel when the nightly pipeline fails or the semantic model refresh fails. You now hear about problems before the CFO does. Series complete! 🎉',
        path: '+ New item → Activator',
        checkpoint: {
          prompt: 'Which capability turns a failure condition into a Teams alert automatically?',
          options: ['OPTIMIZE', 'Activator (Data Activator)', 'A shortcut', 'A deployment rule'],
          answer: 1,
          explanation:
            'Activator monitors conditions/metrics and triggers actions (email, Teams, pipelines). The Monitoring hub shows status, but Activator raises the alert.',
        },
      },
    ],
  },
]

export const TOTAL_LAB_STEPS = LABS.reduce((s, l) => s + l.steps.length, 0)
