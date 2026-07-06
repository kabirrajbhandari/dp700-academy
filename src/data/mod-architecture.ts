import type { Module } from '../types'

export const modArchitecture: Module = {
  id: 'architecture',
  title: 'Fabric Architecture & Analytics Solutions',
  domain: 'implement',
  difficulty: 'Foundation',
  icon: '🏛️',
  blurb:
    'The mental model everything else hangs on: OneLake, workspaces, capacities, and the seven workloads. Start here.',
  lessons: [
    {
      id: 'arch-what-is-fabric',
      title: 'What is Microsoft Fabric?',
      minutes: 12,
      summary:
        'Fabric is a single SaaS analytics platform that unifies data engineering, warehousing, real-time, data science, and BI on one storage layer — OneLake.',
      keyPoints: [
        'Fabric is SaaS: no infrastructure to manage — you buy capacity, not VMs.',
        'OneLake is the single, tenant-wide data lake — "OneDrive for data".',
        'All engines read/write open Delta-Parquet, so there is one physical copy of data.',
        'Everything lives in a workspace, and a workspace is backed by a capacity (F-SKU).',
      ],
      blocks: [
        {
          kind: 'text',
          body:
            'Microsoft Fabric is an end-to-end, **software-as-a-service (SaaS)** analytics platform. Instead of stitching together Azure Data Factory, Synapse, Databricks, Event Hubs, and Power BI yourself, Fabric bundles every analytics capability into one product with one bill, one security model, and — crucially — one copy of your data.',
        },
        { kind: 'heading', text: 'The seven workloads' },
        {
          kind: 'text',
          body:
            'Fabric exposes its capabilities as **workloads** (also called experiences). You switch between them, but they all operate on the same OneLake storage. For DP-700 you care most about Data Engineering, Data Factory, Real-Time Intelligence, and Data Warehouse.',
        },
        {
          kind: 'table',
          headers: ['Workload', 'What it gives you', 'Primary DP-700 items'],
          rows: [
            ['Data Engineering', 'Spark notebooks + lakehouses', 'Lakehouse, Notebook, Spark Job Definition, Environment'],
            ['Data Factory', 'Low-code ingestion & orchestration', 'Data pipeline, Dataflow Gen2'],
            ['Data Warehouse', 'Full T-SQL warehouse', 'Warehouse, SQL analytics endpoint'],
            ['Real-Time Intelligence', 'Streaming + KQL analytics', 'Eventstream, Eventhouse/KQL DB, Activator'],
            ['Data Science', 'ML models & experiments', 'Model, Experiment, Notebook'],
            ['Power BI', 'Semantic models & reports', 'Semantic model, Report, Dashboard'],
            ['Databases', 'Operational SQL database', 'SQL database (mirrored to OneLake)'],
          ],
        },
        {
          kind: 'diagram',
          id: 'fabric-arch',
          caption: 'One capacity powers many workspaces; every workload writes to the same OneLake.',
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'When a question asks you to "choose the right item" for a task, map the verb: ingest low-code → pipeline/Dataflow; transform at scale with code → notebook (Spark); serve T-SQL with writes → Warehouse; read-only T-SQL over a lakehouse → SQL analytics endpoint; sub-second streaming analytics → Eventhouse/KQL.',
        },
      ],
    },
    {
      id: 'arch-onelake',
      title: 'OneLake, capacities & workspaces',
      minutes: 14,
      summary:
        'How the physical (OneLake + capacity) and logical (tenant → workspace → item) layers fit together, and why "one copy of data" changes everything.',
      keyPoints: [
        'One OneLake per tenant, automatically provisioned — you cannot have two.',
        'Data is organized as workspaces (containers) holding items (lakehouses, warehouses…).',
        'Shortcuts let you reference data in ADLS Gen2, S3, GCS, or another workspace without copying.',
        'Capacity (F2…F2048) is the compute you pay for; it is pooled and burstable via smoothing.',
      ],
      blocks: [
        { kind: 'heading', text: 'OneLake: one lake for the whole tenant' },
        {
          kind: 'text',
          body:
            'OneLake is a single, unified, logical data lake automatically provisioned with every Fabric tenant — think **"OneDrive for data"**. It is built on Azure Data Lake Storage Gen2, and every item you create (lakehouse, warehouse, KQL database) physically stores its data in OneLake in open **Delta-Parquet** format. Because there is only one copy, Spark, T-SQL, KQL, and Power BI can all read the same tables without ETL between engines.',
        },
        {
          kind: 'diagram',
          id: 'onelake',
          caption: 'Tenant → workspaces → items, all backed by one OneLake. Shortcuts virtualize external data in place.',
        },
        { kind: 'heading', text: 'Shortcuts — reference, don’t copy' },
        {
          kind: 'text',
          body:
            'A **shortcut** is a pointer to data that lives elsewhere — another OneLake location, ADLS Gen2, Amazon S3, Google Cloud Storage, or Dataverse. The data stays where it is; Fabric reads it as if it were local. This is the #1 way to avoid duplicating data and a heavily tested concept.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Shortcut vs. Mirroring vs. Copy',
          body:
            'Shortcut = virtualize existing files/tables in place (no data movement). Mirroring = continuous, near-real-time replication of an operational database (Azure SQL, Cosmos DB, Snowflake) into OneLake as Delta. Copy activity = a one-time or scheduled physical move. Pick shortcut when the source is already in a lake and you just want to read it.',
        },
        { kind: 'heading', text: 'Capacity: the compute you buy' },
        {
          kind: 'text',
          body:
            'Compute is sold as a **capacity**, sized in Capacity Units (CUs) via F-SKUs (F2, F4, … F2048). A capacity is a shared pool of compute that all workspaces assigned to it draw from. Fabric uses **smoothing** and **bursting** so a short, heavy job can borrow future capacity rather than failing — but sustained overuse triggers **throttling**. A Fabric trial gives you a 60-day F-SKU-equivalent to practice on.',
        },
        {
          kind: 'table',
          headers: ['Concept', 'Layer', 'One-liner'],
          rows: [
            ['OneLake', 'Physical storage', 'The single Delta-Parquet lake for the tenant'],
            ['Capacity (F-SKU)', 'Physical compute', 'CUs that power all workloads; pay-as-you-go or reserved'],
            ['Workspace', 'Logical container', 'Where items live; the unit of access control & Git'],
            ['Item', 'Logical object', 'Lakehouse, Warehouse, Notebook, Pipeline, etc.'],
            ['Domain', 'Governance grouping', 'Groups workspaces by business area (data mesh)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Common trap',
          body:
            'A workspace is assigned to exactly ONE capacity at a time. Moving a workspace to a bigger capacity is how you give its workloads more compute — you do not resize individual items.',
        },
      ],
    },
    {
      id: 'arch-choose-store',
      title: 'Choosing the right data store & engine',
      minutes: 13,
      summary:
        'Lakehouse vs. Warehouse vs. Eventhouse vs. KQL — the decision guide the exam loves to test.',
      keyPoints: [
        'Lakehouse: Spark + files + Delta tables; read-only T-SQL via SQL analytics endpoint.',
        'Warehouse: full T-SQL with INSERT/UPDATE/DELETE and multi-table transactions.',
        'Eventhouse/KQL DB: high-volume, time-series & streaming, queried with KQL.',
        'Match the developer skillset and the workload, not just the data size.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'lakehouse-vs-warehouse',
          caption: 'The decision guide: developer profile and read/write needs drive the choice.',
        },
        {
          kind: 'compare',
          title: 'Which store when?',
          items: [
            {
              name: 'Lakehouse',
              use: 'Data engineers who work in Spark/PySpark; mixed structured + unstructured files; medallion bronze/silver; ML feature prep.',
              avoid: 'You need multi-table ACID writes in pure T-SQL, or citizen SQL developers who never touch Spark.',
            },
            {
              name: 'Warehouse',
              use: 'SQL developers; star schemas; stored procedures; workloads needing INSERT/UPDATE/DELETE and transactions in T-SQL.',
              avoid: 'Unstructured data, or when the team lives in Spark notebooks and Delta files.',
            },
            {
              name: 'Eventhouse / KQL DB',
              use: 'High-throughput streaming, logs, IoT, time-series; sub-second queries over billions of rows with KQL.',
              avoid: 'Slow-changing dimensional models better served by a warehouse.',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'SQL analytics endpoint',
          body:
            'Every lakehouse automatically gets a read-only SQL analytics endpoint. It exposes the lakehouse Delta tables to T-SQL SELECTs (and views/TVFs) — great for BI and ad-hoc querying — but it cannot INSERT/UPDATE/DELETE. For writable T-SQL you need a Warehouse.',
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Watch for keywords: "T-SQL stored procedures & updates" → Warehouse. "PySpark transformation of files" → Lakehouse. "millions of events per second, sub-second latency" → Eventhouse/KQL. "read the lakehouse tables from Power BI with SQL" → SQL analytics endpoint.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-arch-1',
      prompt:
        'A data engineering team writes all transformations in PySpark and works with a mix of JSON files and Delta tables. Which Fabric item should they build on?',
      options: ['Warehouse', 'Lakehouse', 'KQL Database', 'Semantic model'],
      answer: 1,
      explanation:
        'A Lakehouse is the Spark-first store that handles both files (JSON) and Delta tables, and is the natural home for PySpark transformations. A Warehouse is T-SQL only and cannot store arbitrary files.',
      topic: 'Choosing a data store',
    },
    {
      id: 'q-arch-2',
      prompt: 'How many OneLake instances exist per Microsoft Fabric tenant?',
      options: ['One per workspace', 'One per capacity', 'Exactly one per tenant', 'One per domain'],
      answer: 2,
      explanation:
        'OneLake is a single, tenant-wide logical data lake, automatically provisioned. You cannot create additional OneLakes — you organize data inside it with workspaces and items.',
      topic: 'OneLake fundamentals',
    },
    {
      id: 'q-arch-3',
      prompt:
        'You want business analysts to query a lakehouse\'s Delta tables with T-SQL SELECT statements, but they must not be able to modify the data. What do you point them to?',
      options: [
        'The Warehouse editor',
        'The lakehouse SQL analytics endpoint',
        'A Dataflow Gen2',
        'The KQL queryset',
      ],
      answer: 1,
      explanation:
        'Each lakehouse exposes a read-only SQL analytics endpoint that supports T-SQL SELECT, views, and table-valued functions but not DML. That matches "query with T-SQL, no modifications".',
      topic: 'SQL analytics endpoint',
    },
    {
      id: 'q-arch-4',
      prompt:
        'Your source data already sits in an Amazon S3 bucket and you want to analyze it in a lakehouse without copying or duplicating it. What do you create?',
      options: ['A Copy activity', 'A OneLake shortcut', 'A mirrored database', 'A Dataflow Gen2'],
      answer: 1,
      explanation:
        'A OneLake shortcut virtualizes external data (ADLS Gen2, S3, GCS, Dataverse, or other OneLake locations) in place — no data movement. A Copy activity would physically duplicate the data.',
      topic: 'Shortcuts',
    },
    {
      id: 'q-arch-5',
      prompt: 'In Fabric, what does a workspace get its compute from?',
      options: [
        'Each item is sized individually',
        'A capacity (F-SKU) the workspace is assigned to',
        'The OneLake storage tier',
        'A per-user license only',
      ],
      answer: 1,
      explanation:
        'A workspace is assigned to exactly one capacity (an F-SKU measured in Capacity Units). All workloads in that workspace draw compute from the pooled capacity, with smoothing and bursting.',
      topic: 'Capacities',
    },
  ],
}
