import type { Module } from '../types'

export const modLakehouse: Module = {
  id: 'lakehouse',
  title: 'Implement a Lakehouse',
  domain: 'ingest',
  difficulty: 'Core',
  icon: '🏠',
  blurb:
    'Build a lakehouse end-to-end: create it, land raw files, shape Delta tables with a notebook, and layer bronze → silver → gold.',
  lessons: [
    {
      id: 'lh-create',
      title: 'Create a lakehouse & land raw data (hands-on)',
      minutes: 18,
      summary:
        'Step-by-step: provision a lakehouse, understand the Tables vs. Files areas, and ingest your first dataset.',
      keyPoints: [
        'A lakehouse has two zones: Tables (managed Delta) and Files (any format).',
        'Load data with Get data, a pipeline, a Dataflow, a notebook, or by dragging files.',
        '"Load to Tables" converts a file into a managed Delta table you can query in SQL.',
      ],
      blocks: [
        {
          kind: 'text',
          body:
            'A **lakehouse** combines the flexibility of a data lake (any file, any size) with the structure of a warehouse (tables you can query with SQL). Under the hood, tables are Delta Lake, which brings ACID transactions to the lake. Let’s build one.',
        },
        {
          kind: 'steps',
          title: 'Provision a lakehouse',
          steps: [
            {
              title: 'Open a workspace',
              detail:
                'Sign in to the Fabric portal and open (or create) a workspace assigned to a Fabric or trial capacity. The workspace is where your item will live.',
              path: 'app.fabric.microsoft.com → Workspaces → + New workspace',
            },
            {
              title: 'Create the lakehouse',
              detail:
                'Choose New item, then Lakehouse. Give it a name (e.g. sales_lh). Fabric provisions the lakehouse plus two companions automatically: a SQL analytics endpoint and a default semantic model.',
              path: '+ New item → Lakehouse → name → Create',
            },
            {
              title: 'Meet the explorer',
              detail:
                'The Lakehouse explorer shows two nodes: Tables (managed Delta tables) and Files (raw file storage). This split is the core mental model of a lakehouse.',
            },
          ],
        },
        {
          kind: 'diagram',
          id: 'medallion',
          caption: 'Raw files land in Files (bronze); cleaned data becomes Delta Tables (silver → gold).',
        },
        {
          kind: 'steps',
          title: 'Ingest your first data',
          steps: [
            {
              title: 'Upload or Get data',
              detail:
                'Use Get data → Upload files to drop a CSV into the Files area, or use "New Dataflow Gen2" / "New data pipeline" for a repeatable load. For a quick start, upload a products.csv.',
              path: 'Lakehouse ribbon → Get data → Upload files',
            },
            {
              title: 'Load to a table',
              detail:
                'Right-click the uploaded CSV in Files and choose "Load to Tables → New table". Fabric infers the schema and writes a managed Delta table into the Tables area.',
              path: 'Files → right-click file → Load to Tables',
            },
            {
              title: 'Verify in SQL',
              detail:
                'Switch the top-right mode selector to "SQL analytics endpoint" and run SELECT TOP 100 * FROM products. The same physical Delta files are now queryable in T-SQL — no copy made.',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Managed vs. external tables',
          body:
            'When you "Load to Tables", the table is managed — Fabric owns the files under Tables/. If you instead create a shortcut or point a table at files in the Files area, it is external — you manage the underlying files. Deleting a managed table deletes its data; deleting an external/shortcut table does not.',
        },
      ],
    },
    {
      id: 'lh-notebook',
      title: 'Transform with a Spark notebook',
      minutes: 16,
      summary:
        'Use PySpark to read raw files, clean them, and write Delta tables — the bread-and-butter of Fabric data engineering.',
      keyPoints: [
        'Attach a notebook to a lakehouse to get the spark session + relative paths.',
        'spark.read → transform → df.write.format("delta").saveAsTable() is the core loop.',
        'Use saveAsTable for managed tables; use .save(path) for external Delta.',
      ],
      blocks: [
        {
          kind: 'text',
          body:
            'Notebooks give you the full power of Apache Spark (PySpark, Spark SQL, Scala, R) over your lakehouse data. When a notebook is attached to a lakehouse, that lakehouse becomes the default and you can use friendly relative paths.',
        },
        {
          kind: 'steps',
          title: 'Set up the notebook',
          steps: [
            {
              title: 'Create & attach',
              detail:
                'From the lakehouse, choose Open notebook → New notebook. The lakehouse appears in the left Explorer as the attached default source.',
              path: 'Lakehouse → Open notebook → New notebook',
            },
            {
              title: 'Read the raw file',
              detail:
                'Read the bronze CSV into a DataFrame, letting Spark infer the header and schema.',
            },
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Read raw → clean → write a silver Delta table',
          code: `# Read raw bronze file from the Files area
df = (spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv("Files/bronze/products.csv"))

# --- Clean (silver) ---
from pyspark.sql.functions import col, trim, to_date
silver = (df
    .dropDuplicates(["ProductID"])
    .withColumn("ProductName", trim(col("ProductName")))
    .withColumn("ListPrice", col("ListPrice").cast("double"))
    .na.drop(subset=["ProductID"]))

# Write a managed Delta table into the Tables area
silver.write.format("delta").mode("overwrite").saveAsTable("products_silver")`,
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Aggregate to a gold table for reporting',
          code: `from pyspark.sql.functions import sum as _sum, count

gold = (spark.table("products_silver")
    .groupBy("Category")
    .agg(_sum("ListPrice").alias("TotalListPrice"),
         count("*").alias("ProductCount")))

gold.write.format("delta").mode("overwrite").saveAsTable("sales_by_category_gold")`,
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Know the difference: saveAsTable("name") creates/overwrites a MANAGED table in Tables/. write.save("Files/path") writes external Delta files you must register yourself. mode("overwrite") replaces; mode("append") adds; for upserts use the Delta MERGE command (covered in Transform).',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'V-Order & OPTIMIZE',
          body:
            'Fabric writes Delta with V-Order optimization by default, which speeds up Power BI / SQL reads. Periodically run OPTIMIZE (bin-compaction) and VACUUM (remove old files, 7-day default retention) to keep tables fast — this is revisited in the Monitoring & Optimization module.',
        },
      ],
    },
    {
      id: 'lh-medallion',
      title: 'Design the medallion architecture',
      minutes: 12,
      summary:
        'Bronze → Silver → Gold: how to layer a lakehouse for quality, and when to make gold a warehouse.',
      keyPoints: [
        'Bronze = raw, unchanged (keep original format; use shortcuts if already in a lake).',
        'Silver = cleaned, deduped, conformed Delta tables.',
        'Gold = business-ready aggregates / star schema for reporting.',
        'Best practice: one lakehouse (often one workspace) per layer for governance.',
      ],
      blocks: [
        {
          kind: 'text',
          body:
            'The **medallion architecture** incrementally improves data quality across three layers. It is Microsoft’s recommended design pattern for a Fabric lakehouse, and the exam expects you to know what belongs in each layer.',
        },
        {
          kind: 'table',
          headers: ['Layer', 'Purpose', 'Typical operations', 'Format'],
          rows: [
            ['🥉 Bronze', 'Raw landing, source of truth', 'Ingest as-is, no changes; prefer shortcuts', 'Original / Parquet / Delta'],
            ['🥈 Silver', 'Cleaned & conformed', 'Dedupe, fix types, standardize, join sources', 'Delta tables'],
            ['🥇 Gold', 'Business-ready', 'Aggregate, build star schema, KPIs', 'Delta tables (or a Warehouse)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Two deployment patterns',
          body:
            'Pattern 1: all three layers are lakehouses; business users query gold via the SQL analytics endpoint. Pattern 2: bronze + silver are lakehouses, gold is a Warehouse; users query gold via the warehouse endpoint (full T-SQL, writable). Choose based on whether gold consumers need warehouse features.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Governance tip',
          body:
            'Microsoft recommends putting each layer in its own workspace for cleaner access control and lifecycle management. Group those workspaces under a business Domain to build toward a data-mesh.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-lh-1',
      prompt:
        'In a lakehouse, you run df.write.format("delta").saveAsTable("orders"). Where does the data physically go and what kind of table is it?',
      options: [
        'Into Files/ as an external table',
        'Into Tables/ as a managed Delta table',
        'Into the Warehouse as a T-SQL table',
        'Into a semantic model only',
      ],
      answer: 1,
      explanation:
        'saveAsTable writes a managed Delta table into the Tables area of the lakehouse. Fabric owns those files; dropping the table deletes the data.',
      topic: 'Managed vs external tables',
    },
    {
      id: 'q-lh-2',
      prompt: 'Which statement about the medallion architecture is correct?',
      options: [
        'Bronze holds business-ready aggregates',
        'Silver stores raw, unmodified source data',
        'Gold holds curated, business-ready data for reporting',
        'Each layer must be a Warehouse',
      ],
      answer: 2,
      explanation:
        'Bronze = raw/unchanged, Silver = cleaned & conformed, Gold = curated business-ready data. Gold can be a lakehouse or a warehouse depending on consumer needs.',
      topic: 'Medallion layers',
    },
    {
      id: 'q-lh-3',
      prompt:
        'Your bronze source data already lives in ADLS Gen2. Microsoft best practice for the bronze layer is to:',
      options: [
        'Copy it into the lakehouse Tables area',
        'Create a shortcut to it rather than copying',
        'Convert it to CSV first',
        'Load it into a Warehouse',
      ],
      answer: 1,
      explanation:
        'When source data is already in a supported lake (OneLake, ADLS Gen2, S3, GCS), best practice is to create a shortcut in bronze instead of copying, avoiding data duplication.',
      topic: 'Bronze layer & shortcuts',
    },
    {
      id: 'q-lh-4',
      prompt: 'What two companion items are created automatically when you provision a lakehouse?',
      options: [
        'A pipeline and a Dataflow',
        'A SQL analytics endpoint and a default semantic model',
        'An Eventstream and a KQL database',
        'A warehouse and a report',
      ],
      answer: 1,
      explanation:
        'Creating a lakehouse automatically provisions a read-only SQL analytics endpoint (for T-SQL queries) and a default semantic model (for Power BI).',
      topic: 'Lakehouse companions',
    },
  ],
}
