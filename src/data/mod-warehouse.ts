import type { Module } from '../types'

export const modWarehouse: Module = {
  id: 'warehouse',
  title: 'Implement a Data Warehouse',
  domain: 'ingest',
  difficulty: 'Core',
  icon: '🏢',
  blurb:
    'Build a T-SQL warehouse: load data, model a star schema, write procs & views, and secure with RLS/CLS and dynamic data masking.',
  lessons: [
    {
      id: 'wh-create-load',
      title: 'Create & load a warehouse (hands-on)',
      minutes: 16,
      summary:
        'Provision a Warehouse and load it four ways: pipeline, Dataflow Gen2, cross-warehouse query, and COPY INTO.',
      keyPoints: [
        'A Warehouse is full T-SQL: DDL, DML, transactions — unlike the read-only lakehouse endpoint.',
        'Load with pipelines, Dataflows, cross-database queries, or COPY INTO.',
        'Cross-warehouse/lakehouse queries work because all data is Delta in OneLake.',
      ],
      blocks: [
        {
          kind: 'text',
          body:
            'A Fabric **Warehouse** is a fully transactional, T-SQL data warehouse. Unlike the lakehouse SQL analytics endpoint (read-only), a warehouse supports INSERT/UPDATE/DELETE, stored procedures, and multi-table transactions — while still storing everything as Delta in OneLake.',
        },
        {
          kind: 'steps',
          title: 'Create and load',
          steps: [
            {
              title: 'Create the warehouse',
              detail: 'New item → Warehouse → name it (e.g. sales_dw). It comes with a SQL endpoint and a default semantic model.',
              path: '+ New item → Warehouse',
            },
            {
              title: 'Load with COPY INTO',
              detail:
                'For high-throughput bulk loads from files in OneLake/ADLS, COPY INTO is the fastest T-SQL path. It reads Parquet/CSV directly into a table.',
            },
            {
              title: 'Or use a pipeline / Dataflow',
              detail:
                'Point a pipeline Copy activity or a Dataflow Gen2 destination at the warehouse for orchestrated or low-code loads.',
            },
          ],
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Bulk load with COPY INTO',
          code: `COPY INTO dbo.sales_stage
FROM 'https://onelake.dfs.fabric.microsoft.com/<ws>/<lh>.Lakehouse/Files/sales/*.parquet'
WITH (FILE_TYPE = 'PARQUET', CREDENTIAL = (IDENTITY = 'Managed Identity'));`,
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Cross-warehouse query — join a warehouse table to a lakehouse table',
          code: `-- Three-part naming lets one query span items in the same workspace
SELECT s.OrderID, s.Amount, c.Segment
FROM   sales_dw.dbo.orders          AS s
JOIN   sales_lh.dbo.customers       AS c   -- lakehouse SQL endpoint
       ON s.CustomerID = c.CustomerID;`,
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'COPY INTO = fastest bulk T-SQL load. Cross-database (three-part name) queries work across warehouses and lakehouse SQL endpoints in the same workspace because they share OneLake. You cannot write to a lakehouse table through its SQL endpoint — it is read-only.',
        },
      ],
    },
    {
      id: 'wh-star-schema',
      title: 'Model a star schema',
      minutes: 14,
      summary:
        'Fact & dimension tables, surrogate keys, relationships, and slowly changing dimensions.',
      keyPoints: [
        'Fact tables hold measures + foreign keys to dimensions; dimensions hold descriptive attributes.',
        'Use surrogate keys (integers) as primary keys of dimensions.',
        'SCD Type 1 overwrites; Type 2 keeps history with validity dates & a current flag.',
        'Build views and stored procedures to serve and refresh the model.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'star-schema',
          caption: 'A central fact table surrounded by dimension tables joined on surrogate keys.',
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Dimension and fact DDL',
          code: `CREATE TABLE dbo.dim_date (
  DateKey       INT         NOT NULL,   -- surrogate (yyyymmdd)
  [Date]        DATE        NOT NULL,
  MonthName     VARCHAR(20),
  Quarter       TINYINT,
  [Year]        SMALLINT
);

CREATE TABLE dbo.fact_sales (
  SalesKey    BIGINT      NOT NULL,
  DateKey     INT         NOT NULL,     -- FK -> dim_date
  CustomerKey INT         NOT NULL,     -- FK -> dim_customer
  ProductKey  INT         NOT NULL,     -- FK -> dim_product
  Quantity    INT,
  LineTotal   DECIMAL(18,2)
);`,
        },
        {
          kind: 'compare',
          title: 'Slowly Changing Dimensions',
          items: [
            {
              name: 'SCD Type 1',
              use: 'Correcting errors; history not needed. Overwrite the attribute in place.',
              avoid: 'You must report on the value as it was at the time of the fact.',
            },
            {
              name: 'SCD Type 2',
              use: 'Preserve history — add a new row with StartDate/EndDate and IsCurrent flag; facts point to the version valid at their time.',
              avoid: 'History genuinely does not matter (Type 2 adds rows and complexity).',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Serving objects',
          body:
            'Wrap logic in views (for reusable SELECTs), stored procedures (for parameterized loads/transforms), and functions (for computed values). These are the object types the exam explicitly lists under "query and modify data".',
        },
      ],
    },
    {
      id: 'wh-security',
      title: 'Secure the warehouse: RLS, CLS & masking',
      minutes: 13,
      summary:
        'Row-level, column-level, object-level security, and dynamic data masking — with T-SQL you can write from memory.',
      keyPoints: [
        'RLS filters rows per user via a security predicate function + policy.',
        'CLS grants/denies specific columns via GRANT/DENY.',
        'Dynamic data masking obscures values in results without changing stored data.',
        'Object-level security = GRANT/DENY on tables, views, procedures.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'security-layers',
          caption: 'Layered controls: workspace roles → item permissions → object/row/column security → masking.',
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Row-Level Security (RLS)',
          code: `CREATE FUNCTION dbo.fn_salesRegion(@Region AS sysname)
RETURNS TABLE WITH SCHEMABINDING AS
RETURN SELECT 1 AS ok
       WHERE @Region = USER_NAME() OR IS_ROLEMEMBER('SalesAdmin') = 1;

CREATE SECURITY POLICY dbo.SalesFilter
  ADD FILTER PREDICATE dbo.fn_salesRegion(Region) ON dbo.fact_sales
  WITH (STATE = ON);`,
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Column-Level Security & Dynamic Data Masking',
          code: `-- CLS: deny a column to a role
DENY SELECT ON dbo.dim_customer(SSN) TO Analysts;

-- DDM: mask email; users without UNMASK see the masked form
ALTER TABLE dbo.dim_customer
  ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Masking ≠ security',
          body:
            'Dynamic data masking only obfuscates values in query results; it does not encrypt or restrict access to the underlying data. A user with the UNMASK permission (or who can run their own aggregations) may infer values. Combine DDM with CLS/RLS for real protection.',
        },
      ],
    },
    {
      id: 'wh-directlake',
      title: 'Serve data with Direct Lake semantic models',
      minutes: 15,
      summary:
        'How Power BI reads OneLake Delta at import speed without importing — framing, DirectQuery fallback, and the settings the exam tests.',
      keyPoints: [
        'Direct Lake loads Delta straight into memory (VertiPaq) — import-like speed, no data copy.',
        'A Direct Lake "refresh" = framing: a fast, metadata-only update to the latest Delta files.',
        'Direct Lake on SQL can fall back to DirectQuery (slower); Direct Lake on OneLake cannot.',
        'RLS/DDM/OLS at the SQL endpoint, SQL views, or exceeding guardrails cause fallback.',
        'DirectLakeBehavior: Automatic (prod), DirectLakeOnly (dev), DirectQueryOnly (measure).',
      ],
      blocks: [
        {
          kind: 'text',
          body:
            '**Direct Lake** is a Power BI semantic-model storage mode that loads Delta tables from OneLake directly into memory and queries them with the VertiPaq engine — giving **Import-mode speed without an Import-mode refresh**. There is no cached copy: a "refresh" only updates metadata. It is the recommended serving mode over large lakehouses and warehouses.',
        },
        {
          kind: 'table',
          headers: ['Mode', 'How data is served', 'Refresh'],
          rows: [
            ['Import', 'Full cached copy in VertiPaq', 'Copies all data (slow, resource-heavy)'],
            ['DirectQuery', 'Federated queries to the source', 'No copy, but slower queries'],
            ['Direct Lake', 'Delta loaded into VertiPaq on demand', 'Framing — metadata-only, seconds'],
          ],
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Framing',
          body:
            'Framing is the Direct Lake operation a refresh triggers: the model analyzes the latest Delta log and points at the newest Parquet files — usually a few seconds. Until you frame after modifying the Delta tables, queries return data as of the last framing point, not the latest state. Schedule/refresh to frame.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'DirectQuery fallback (Direct Lake on SQL)',
          body:
            'Direct Lake on the SQL analytics endpoint silently falls back to (slower) DirectQuery when a referenced table has SQL-endpoint RLS, DDM, or OLS; is based on an unmaterialized SQL view; hasn’t been framed; or exceeds capacity guardrails (too many Parquet files/row groups/rows). Fixes: move security to the model, materialize views, OPTIMIZE/VACUUM the Delta table, or scale the SKU. Direct Lake on OneLake runs DirectLakeOnly and never falls back — it’s the recommended option for new models.',
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Know: framing = metadata-only refresh; fallback causes (RLS/DDM/OLS at SQL endpoint, SQL views, unframed, guardrails). DirectLakeBehavior — Automatic (prod, silent fallback), DirectLakeOnly (dev, errors instead of fallback so you catch issues), DirectQueryOnly (measure fallback cost). "Refresh failed until Delta optimized" points at guardrails → OPTIMIZE/VACUUM.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-wh-1',
      prompt: 'Which is the fastest, native T-SQL way to bulk-load Parquet files from OneLake into a warehouse table?',
      options: ['A row-by-row INSERT loop', 'COPY INTO', 'A OneLake shortcut', 'Power Query'],
      answer: 1,
      explanation:
        'COPY INTO is the high-throughput bulk-load statement that reads Parquet/CSV files directly into a warehouse table — far faster than row-by-row inserts.',
      topic: 'Loading a warehouse',
    },
    {
      id: 'q-wh-2',
      prompt:
        'You must preserve the historical value of a customer’s city as it was when each sale occurred. Which dimension design do you use?',
      options: ['SCD Type 1 (overwrite)', 'SCD Type 2 (new row + validity dates)', 'Drop the dimension', 'A masked column'],
      answer: 1,
      explanation:
        'SCD Type 2 adds a new dimension row with StartDate/EndDate and a current flag whenever an attribute changes, so each fact links to the version valid at its time — preserving history.',
      topic: 'Slowly changing dimensions',
    },
    {
      id: 'q-wh-3',
      prompt:
        'Sales reps should only see rows for their own region when querying fact_sales. Which feature enforces this at the row level?',
      options: [
        'Dynamic data masking',
        'Column-level security (DENY)',
        'Row-level security via a security predicate + policy',
        'A workspace Viewer role',
      ],
      answer: 2,
      explanation:
        'Row-level security uses an inline table-valued predicate function bound to the table through a SECURITY POLICY to filter rows per user. Masking and CLS operate on columns, not row filtering.',
      topic: 'Row-level security',
    },
    {
      id: 'q-wh-4',
      prompt: 'What is a true limitation of dynamic data masking?',
      options: [
        'It encrypts data at rest',
        'It prevents all users from ever seeing real values',
        'It only obscures values in results and can be bypassed/inferred without UNMASK controls',
        'It requires a separate warehouse',
      ],
      answer: 2,
      explanation:
        'DDM only masks values in query output; it does not encrypt or restrict the underlying data, and privileged users (or clever aggregations) can reveal values. Pair it with CLS/RLS for genuine protection.',
      topic: 'Dynamic data masking',
    },
  ],
}
