import type { Module } from '../types'

export const modTransform: Module = {
  id: 'transform',
  title: 'Transforming & Processing Data',
  domain: 'ingest',
  difficulty: 'Core',
  icon: '🔧',
  blurb:
    'Reshape data with PySpark, Spark SQL, T-SQL, and KQL: denormalize, aggregate, dedupe, and handle missing & late data.',
  lessons: [
    {
      id: 'tr-engines',
      title: 'Choosing a transformation engine',
      minutes: 12,
      summary:
        'PySpark vs. Spark SQL vs. T-SQL vs. KQL — same data in OneLake, different tools for different jobs.',
      keyPoints: [
        'PySpark/Spark SQL: large-scale, code-first transforms in a lakehouse.',
        'T-SQL: set-based transforms in a warehouse (stored procs, views).',
        'KQL: fast transforms/aggregations over streaming & time-series in an Eventhouse.',
        'All engines read the same OneLake Delta — choose by skillset & workload.',
      ],
      blocks: [
        {
          kind: 'table',
          headers: ['Engine', 'Runs in', 'Best for', 'Language'],
          rows: [
            ['PySpark', 'Notebook / Spark job', 'Big data, custom logic, ML prep', 'Python'],
            ['Spark SQL', 'Notebook', 'Set-based transforms on Delta, familiar SQL', 'SQL'],
            ['T-SQL', 'Warehouse', 'Dimensional modeling, stored procedures', 'SQL'],
            ['KQL', 'Eventhouse / KQL DB', 'Streaming, logs, time-series aggregation', 'KQL'],
          ],
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'The store you chose usually dictates the engine: lakehouse → Spark; warehouse → T-SQL; Eventhouse → KQL. Questions often frame it as "the team knows SQL but the data is in a lakehouse" → use Spark SQL or the SQL analytics endpoint (read-only).',
        },
      ],
    },
    {
      id: 'tr-common-ops',
      title: 'Core transformations: denormalize, aggregate, dedupe',
      minutes: 16,
      summary:
        'The operations the exam actually names — with runnable PySpark and SQL snippets.',
      keyPoints: [
        'Denormalize = join related tables into one wide table for reporting speed.',
        'Group & aggregate to build gold summary tables.',
        'Deduplicate on the natural key, keeping the latest record.',
        'Window functions rank/number rows within partitions.',
      ],
      blocks: [
        { kind: 'heading', text: 'Denormalize (join to a wide table)' },
        {
          kind: 'code',
          lang: 'python',
          code: `wide = (orders
    .join(customers, "CustomerID", "left")
    .join(products,  "ProductID",  "left")
    .select("OrderID","OrderDate","CustomerName","City",
            "ProductName","Category","Quantity","LineTotal"))
wide.write.format("delta").mode("overwrite").saveAsTable("orders_wide_gold")`,
        },
        { kind: 'heading', text: 'Group & aggregate' },
        {
          kind: 'code',
          lang: 'python',
          code: `from pyspark.sql.functions import sum as _sum, avg, countDistinct
summary = (wide.groupBy("Category","City")
    .agg(_sum("LineTotal").alias("Revenue"),
         avg("LineTotal").alias("AvgLine"),
         countDistinct("CustomerName").alias("Customers")))`,
        },
        { kind: 'heading', text: 'Deduplicate keeping latest' },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Window function pattern — keep the newest row per key',
          code: `from pyspark.sql.window import Window
from pyspark.sql.functions import row_number, col

w = Window.partitionBy("CustomerID").orderBy(col("LastModified").desc())
latest = (df.withColumn("rn", row_number().over(w))
            .filter(col("rn") == 1)
            .drop("rn"))`,
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Why denormalize?',
          body:
            'Star-schema fact/dimension joins are great for storage and integrity, but pre-joining into a wide gold table can dramatically speed up Power BI reports and ad-hoc queries. Trade storage & freshness for read speed.',
        },
      ],
    },
    {
      id: 'tr-quality',
      title: 'Handle missing, duplicate & late-arriving data',
      minutes: 13,
      summary:
        'Data-quality patterns the exam explicitly lists — nulls, duplicates, and out-of-order arrivals.',
      keyPoints: [
        'Missing: drop, impute, or flag — choose per business rule.',
        'Duplicate: dedupe on natural key with a deterministic tiebreaker.',
        'Late-arriving facts: use MERGE keyed on business key (idempotent).',
        'Late-arriving dimensions: insert an "inferred member" placeholder, update later.',
      ],
      blocks: [
        {
          kind: 'code',
          lang: 'python',
          caption: 'Handling missing values',
          code: `from pyspark.sql.functions import when, col, lit
clean = (df
    .na.drop(subset=["OrderID"])                 # drop rows missing a required key
    .na.fill({"Region": "Unknown"})              # impute categorical
    .withColumn("Discount",
        when(col("Discount").isNull(), lit(0.0)).otherwise(col("Discount"))))`,
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Late-arriving dimension (inferred member)',
          body:
            'If a fact arrives referencing a dimension member you have not loaded yet, insert a placeholder dimension row (an "inferred member") with the business key and Unknown attributes, link the fact to it, and update the attributes when the real dimension data arrives. This keeps facts loadable without breaking referential integrity.',
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Expect a scenario: "rows sometimes arrive twice / out of order — how do you make loads safe?" The answer is almost always an idempotent MERGE on the business key plus a deterministic dedupe (row_number over an ordering column).',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-tr-1',
      prompt:
        'Your team must transform data stored in a lakehouse and everyone is comfortable with SQL syntax. Which is the most fitting option?',
      options: ['T-SQL in a Warehouse', 'Spark SQL in a notebook', 'KQL in an Eventhouse', 'Power Query in a Dataflow'],
      answer: 1,
      explanation:
        'Data in a lakehouse is processed with Spark. Spark SQL lets a SQL-comfortable team transform Delta tables without leaving the lakehouse. The warehouse T-SQL engine operates on warehouse tables, not lakehouse-managed Spark tables (writable).',
      topic: 'Choosing a transform engine',
    },
    {
      id: 'q-tr-2',
      prompt: 'To keep only the most recent record per CustomerID, the idiomatic PySpark approach is:',
      options: [
        'dropDuplicates() with no arguments',
        'row_number() over a window partitioned by CustomerID ordered by LastModified desc, keep rn = 1',
        'A GROUP BY CustomerID',
        'na.drop()',
      ],
      answer: 1,
      explanation:
        'A window function (row_number partitioned by the key, ordered by the recency column) with a filter rn = 1 deterministically keeps the newest row per key — the standard dedupe-latest pattern.',
      topic: 'Deduplication',
    },
    {
      id: 'q-tr-3',
      prompt:
        'A fact row arrives referencing a product that has not been loaded into the product dimension yet. The best practice is to:',
      options: [
        'Reject the fact row',
        'Insert an inferred-member placeholder dimension row and link the fact, updating attributes later',
        'Duplicate the fact into every product',
        'Convert the fact to a dimension',
      ],
      answer: 1,
      explanation:
        'The late-arriving dimension pattern inserts an inferred member (placeholder with the business key and Unknown attributes) so the fact can load and maintain referential integrity; the real attributes are updated when they arrive.',
      topic: 'Late-arriving data',
    },
    {
      id: 'q-tr-4',
      prompt: 'Denormalizing data into a wide gold table is primarily done to:',
      options: [
        'Save storage space',
        'Enforce referential integrity',
        'Speed up reporting/query reads by avoiding joins',
        'Enable streaming ingestion',
      ],
      answer: 2,
      explanation:
        'Pre-joining related tables into one wide table removes expensive join work at query time, speeding up Power BI and ad-hoc reads — at the cost of extra storage and some freshness.',
      topic: 'Denormalization',
    },
  ],
}
