import type { Module } from '../types'

export const modIngest: Module = {
  id: 'ingest',
  title: 'Ingesting Data into Fabric',
  domain: 'ingest',
  difficulty: 'Core',
  icon: '📥',
  blurb:
    'Pipelines, Dataflows Gen2, notebooks, shortcuts, and mirroring — pick the right ingestion tool and design full vs. incremental loads.',
  lessons: [
    {
      id: 'ing-choose',
      title: 'Choose the right ingestion tool',
      minutes: 14,
      summary:
        'Pipeline vs. Dataflow Gen2 vs. Notebook vs. Shortcut vs. Mirroring — the decision that opens most Domain-2 questions.',
      keyPoints: [
        'Pipeline = orchestration + Copy activity for high-volume movement.',
        'Dataflow Gen2 = low-code Power Query transform-on-ingest for citizen developers.',
        'Notebook = code-first, complex/large-scale transforms in Spark.',
        'Shortcut = reference existing lake data; Mirroring = replicate an operational DB.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'ingest-options',
          caption: 'Match the tool to skillset, transform complexity, and whether you need orchestration.',
        },
        {
          kind: 'compare',
          title: 'The five ingestion paths',
          items: [
            {
              name: 'Data pipeline',
              use: 'Move large volumes with the Copy activity; orchestrate multi-step ETL; parameterize and schedule; call other activities (notebook, dataflow, stored proc).',
              avoid: 'You need heavy row-level transformation logic (add a notebook/dataflow inside the pipeline instead).',
            },
            {
              name: 'Dataflow Gen2',
              use: 'Low-code/no-code Power Query M transforms during ingest; citizen developers; 150+ connectors; land results to a lakehouse/warehouse.',
              avoid: 'Very large-scale or highly custom transforms — Spark notebooks scale better and cost less at volume.',
            },
            {
              name: 'Notebook (Spark)',
              use: 'Code-first complex transforms, big data, ML feature engineering, custom logic, MERGE/upserts.',
              avoid: 'A team of pure SQL/low-code users with simple needs.',
            },
            {
              name: 'Shortcut',
              use: 'Data already in OneLake/ADLS/S3/GCS/Dataverse — reference it in place, zero copy.',
              avoid: 'You need a physical, transformed copy or the source is a transactional DB (use mirroring).',
            },
            {
              name: 'Mirroring',
              use: 'Continuously replicate an operational database (Azure SQL DB, Cosmos DB, Snowflake, Fabric SQL DB) into OneLake as Delta, near-real-time, no ETL.',
              avoid: 'One-off file loads or sources that are not supported mirror databases.',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            '"Least development effort / low-code / citizen developer" → Dataflow Gen2. "Large volume, just move it, then orchestrate" → pipeline with Copy activity. "Complex custom logic at scale" → notebook. "Already in a lake, don’t copy" → shortcut. "Keep an operational DB in sync automatically" → mirroring.',
        },
      ],
    },
    {
      id: 'ing-pipeline',
      title: 'Build a data pipeline (hands-on)',
      minutes: 16,
      summary:
        'Create a pipeline with a Copy activity, parameterize the source, and orchestrate a notebook after the load.',
      keyPoints: [
        'The Copy activity is the workhorse for high-volume source→sink movement.',
        'Use the Copy assistant to pick source, destination, and mapping.',
        'Chain activities with On success / On failure dependencies to orchestrate.',
        'Parameters + dynamic content make pipelines reusable across tables/dates.',
      ],
      blocks: [
        {
          kind: 'steps',
          title: 'Create and run a Copy pipeline',
          steps: [
            {
              title: 'New data pipeline',
              detail:
                'In your workspace, create a new Data pipeline and give it a name (e.g. pl_ingest_sales).',
              path: '+ New item → Data pipeline',
            },
            {
              title: 'Add a Copy activity',
              detail:
                'Use the Copy data assistant. Choose a source connector (e.g. Azure SQL, HTTP, ADLS Gen2), authenticate, and select the tables/files.',
              path: 'Copy data assistant → choose source',
            },
            {
              title: 'Set the destination',
              detail:
                'Point the sink at your lakehouse Tables (or Files) or a warehouse. Map columns and choose table action (append/overwrite).',
              path: 'Assistant → Destination → Lakehouse',
            },
            {
              title: 'Orchestrate a transform',
              detail:
                'Add a Notebook activity after Copy and connect the green "On success" arrow so cleansing runs only after ingestion succeeds.',
              path: 'Activities → Notebook → link On success',
            },
            {
              title: 'Schedule / run',
              detail:
                'Run once to validate, then set a Schedule (or an event trigger) for recurring loads. Monitor status in the run history.',
              path: 'Home → Schedule',
            },
          ],
        },
        {
          kind: 'diagram',
          id: 'orchestration',
          caption: 'Copy → (on success) Notebook → (on success) Stored proc, all scheduled by the pipeline.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Parameters vs. variables',
          body:
            'Pipeline parameters are set at run time (e.g. a load date) and are read-only during the run. Variables can be set/changed mid-run with the Set variable activity. Use dynamic content @pipeline().parameters.x or @variables(\'y\') to make one pipeline serve many tables.',
        },
      ],
    },
    {
      id: 'ing-loading-patterns',
      title: 'Full vs. incremental loading patterns',
      minutes: 14,
      summary:
        'Design idempotent full loads and watermark-based incremental loads, and prepare data for a dimensional model.',
      keyPoints: [
        'Full load: truncate + reload; simple, but expensive at scale.',
        'Incremental load: only new/changed rows since the last watermark.',
        'Use a MERGE (upsert) to apply changes idempotently.',
        'Handle late-arriving data and slowly changing dimensions deliberately.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'incremental-load',
          caption: 'Store a high-watermark; each run pulls rows greater than it, then advances the watermark.',
        },
        {
          kind: 'text',
          body:
            'A **full load** replaces the entire target every run — easy and reliable but costly on big tables. An **incremental load** pulls only rows that changed since the last successful run, tracked by a **watermark** (a max modified date or an ever-increasing key) stored in a control table.',
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Idempotent upsert with MERGE (warehouse or Spark SQL on Delta)',
          code: `MERGE INTO dim_customer AS tgt
USING staging_customer AS src
  ON tgt.CustomerKey = src.CustomerKey
WHEN MATCHED AND src.LastModified > tgt.LastModified THEN
  UPDATE SET tgt.Name = src.Name, tgt.City = src.City, tgt.LastModified = src.LastModified
WHEN NOT MATCHED THEN
  INSERT (CustomerKey, Name, City, LastModified)
  VALUES (src.CustomerKey, src.Name, src.City, src.LastModified);`,
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Preparing for a dimensional model',
          body:
            'Before loading facts and dimensions: assign surrogate keys, conform dimension attributes, deduplicate, and decide SCD handling. Type 1 overwrites the old value; Type 2 adds a new row with validity dates to preserve history. The exam tests when to use each.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Late & duplicate data',
          body:
            'Late-arriving data can land after its window closed — use MERGE keyed on business keys so re-processing is safe (idempotent). Deduplicate on the natural key keeping the latest by timestamp. Never assume order of arrival for streaming or batch.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-ing-1',
      prompt:
        'A business analyst with no coding skills must combine three CSVs and apply simple column transforms during ingest, with the least development effort. Which tool?',
      options: ['Spark notebook', 'Dataflow Gen2', 'Copy activity only', 'KQL queryset'],
      answer: 1,
      explanation:
        'Dataflow Gen2 provides a low-code Power Query experience ideal for citizen developers doing simple transforms with minimal effort. Notebooks require code; a bare Copy activity does not transform.',
      topic: 'Choosing an ingestion tool',
    },
    {
      id: 'q-ing-2',
      prompt:
        'You must continuously replicate an Azure SQL Database into OneLake as Delta tables with near-real-time freshness and no ETL pipeline. What do you use?',
      options: ['A OneLake shortcut', 'Mirroring', 'A scheduled full Copy', 'A Dataflow Gen2'],
      answer: 1,
      explanation:
        'Mirroring continuously replicates a supported operational database (Azure SQL DB, Cosmos DB, Snowflake, Fabric SQL DB) into OneLake as Delta in near-real-time with no ETL. A shortcut references files, not a live transactional DB.',
      topic: 'Mirroring',
    },
    {
      id: 'q-ing-3',
      prompt:
        'To apply new and changed rows to a dimension table idempotently so re-runs do not create duplicates, you should use:',
      options: ['INSERT only', 'A MERGE (upsert) on the business key', 'TRUNCATE then INSERT every run', 'A shortcut'],
      answer: 1,
      explanation:
        'A MERGE matched on the business/surrogate key updates existing rows and inserts new ones, making the load idempotent and safe for late-arriving data and re-runs.',
      topic: 'Incremental loads & MERGE',
    },
    {
      id: 'q-ing-4',
      prompt:
        'In a pipeline, you want a cleansing notebook to run only if the Copy activity succeeds. How do you wire it?',
      options: [
        'Put both in separate pipelines',
        'Connect the Copy activity’s "On success" (green) output to the Notebook activity',
        'Use a Set variable activity',
        'Schedule them one minute apart',
      ],
      answer: 1,
      explanation:
        'Activity dependencies (On success / On failure / On completion) control orchestration order. Linking Copy’s green On-success arrow to the Notebook guarantees it runs only after a successful copy.',
      topic: 'Pipeline orchestration',
    },
  ],
}
