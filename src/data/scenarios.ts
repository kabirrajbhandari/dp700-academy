/**
 * A single, coherent real-world case study — Fabrikam Outdoor Gear — threaded
 * through every lesson. Fabrikam is a mid-size outdoor-equipment retailer:
 * 90 stores, an e-commerce site, IoT-tagged warehouse inventory, and a small
 * data team migrating from a patchwork of SQL Server + SSIS + CSV exports
 * to Microsoft Fabric. Each entry answers: "why does THIS lesson matter to
 * a real team?" Keyed by lesson id.
 */
export const SCENARIOS: Record<string, string> = {
  // ---- Architecture ----
  'arch-what-is-fabric':
    'Fabrikam Outdoor Gear runs nightly SSIS jobs, a SQL Server warehouse, a separate Databricks cluster for data science, and Power BI on top — four tools, four security models, four copies of the sales data. Their CTO wants one platform and one bill. This lesson is the pitch meeting: what Fabric replaces and why "one copy in OneLake" ends their 3 a.m. sync failures.',
  'arch-onelake':
    'Fabrikam’s clickstream data already sits in ADLS Gen2 and their supplier feeds land in Amazon S3. Before Fabric, both were copied nightly into the warehouse. With OneLake shortcuts, the team reads both in place — the S3 copy job (and its $400/month egress surprise) is deleted. Sizing one F64 capacity for the whole analytics team replaces three separately-billed services.',
  'arch-choose-store':
    'Three Fabrikam teams claim they need "a database": data engineers transforming clickstream JSON (→ lakehouse), the finance team writing T-SQL stored procedures for month-end close (→ warehouse), and the ops team tracking live warehouse-robot telemetry (→ Eventhouse). This lesson is the whiteboard session where each lands on the right store instead of forcing everything into one.',

  // ---- Lakehouse ----
  'lh-create':
    'Day one of Fabrikam’s migration: the team creates sales_lh, drags in last month’s point-of-sale CSV exports, and clicks "Load to Tables". Within an hour, analysts are running T-SQL SELECTs over data that used to require a DBA ticket and a two-day wait.',
  'lh-notebook':
    'Fabrikam’s POS exports are messy: duplicate transaction rows from till reboots, whitespace in product names, prices as text. The nightly PySpark notebook in this lesson is exactly what their engineer writes in week one — read raw CSV, clean it, write products_silver — replacing a 400-step SSIS package with 15 lines of code.',
  'lh-medallion':
    'After three months, Fabrikam’s lakehouse is a junk drawer — nobody knows which "sales_final_v2_REAL" table to trust. Adopting medallion layers fixes it: bronze keeps untouched POS/e-commerce feeds for audit, silver holds cleaned conformed tables, and gold serves the CFO’s dashboards. Store-manager access is granted on gold only.',

  // ---- Ingest ----
  'ing-choose':
    'Fabrikam ingests from five sources: an Azure SQL order system (→ mirroring), supplier price lists a buyer maintains in Excel (→ Dataflow Gen2, she owns it herself), 2 TB of historical archives (→ pipeline Copy), clickstream already in ADLS (→ shortcut), and product-review JSON needing heavy parsing (→ notebook). One retailer, all five paths — this lesson is that mapping exercise.',
  'ing-pipeline':
    'Fabrikam’s "nightly load" is the pipeline built in this lesson: Copy pulls yesterday’s orders from the ERP at 02:00, and only on success does the cleansing notebook run — so a half-loaded ERP extract can never corrupt the silver tables the CFO reads at 08:00.',
  'ing-loading-patterns':
    'Fabrikam’s order table has 180 million rows; reloading it nightly took 4 hours and once blew through the capacity. Switching to a watermark-based incremental load (only yesterday’s ~40 k changed orders) cut the run to 6 minutes. The MERGE pattern here also absorbs the returns desk’s late corrections without double-counting revenue.',

  // ---- Transform ----
  'tr-engines':
    'Fabrikam’s team is mixed: two PySpark engineers, four SQL analysts, one ops person who lives in KQL. The store they chose per workload decides the language — this lesson stops the weekly "should this be a notebook or a stored proc?" debate with a simple rule: lakehouse→Spark, warehouse→T-SQL, Eventhouse→KQL.',
  'tr-common-ops':
    'Fabrikam’s Power BI report joining 5 tables took 40 seconds to render on Monday mornings. Pre-joining orders + customers + products into orders_wide_gold (the exact denormalize pattern here) dropped it to 2 seconds. The dedupe-latest window function also fixed the double-counted till-reboot transactions.',
  'tr-quality':
    'Black Friday at Fabrikam: a store’s network drops, and 3,000 sales sync two days late — some referencing a limited-edition jacket not yet in the product dimension. The inferred-member pattern in this lesson lets those facts load Friday night with an "Unknown product" placeholder, updated Monday when the product feed catches up. Revenue reports stay correct all weekend.',

  // ---- Warehouse ----
  'wh-create-load':
    'Fabrikam’s finance team gets sales_dw as their month-end home: COPY INTO bulk-loads the archived ledger Parquet in minutes, and a cross-warehouse query joins finance’s ledger to the lakehouse’s customer segments — no data copied, because both are Delta in OneLake.',
  'wh-star-schema':
    'Fabrikam’s analysts kept getting different revenue numbers because everyone joined raw tables differently. The star schema in this lesson — fact_sales with dim_date/dim_customer/dim_product — becomes the single agreed model. dim_customer is SCD Type 2, because when a customer moves from Seattle to Denver, last year’s sales must stay attributed to Seattle.',
  'wh-security':
    'Fabrikam’s 90 store managers all query the same fact_sales — RLS ensures the Portland manager sees only Portland rows. Payroll columns are DENY-ed to analysts (CLS), and customer emails are masked for the marketing interns. One table, four audiences, zero extra copies.',

  // ---- Real-Time Intelligence ----
  'rti-overview':
    'Fabrikam’s warehouse robots emit 50,000 telemetry events/minute, and dock managers currently learn about conveyor jams from a 20-minute-old email. The RTI stack in this lesson is their fix: Eventstream ingests, Eventhouse stores, a Real-Time Dashboard shows dock throughput live, and Activator pages the shift lead when a belt stalls.',
  'rti-eventstream':
    'This lesson’s build is Fabrikam’s actual wiring job: IoT Hub → Eventstream → filter out heartbeat pings (98% of volume) → route telemetry to the Eventhouse for live dashboards AND to the lakehouse for the maintenance team’s monthly wear-pattern analysis. One stream, two destinations.',
  'rti-kql':
    'Fabrikam’s ops lead asks: "orders picked per 5 minutes, per zone, updated every minute." That is a hopping window — and the KQL bin() pattern in this lesson is the exact query behind their big-screen dock dashboard. Session windows later revealed pickers idling 11 minutes between waves, worth two extra staff at peak.',

  // ---- Orchestration ----
  'or-choose':
    'Fabrikam’s nightly run grew organically into 14 scheduled items that sometimes ran out of order — the classic "dataflow finished after the report refreshed" bug. This lesson is their cleanup: one master pipeline orchestrates Copy → notebook → Dataflow → semantic-model refresh, in order, with one place to look when something fails.',
  'or-triggers':
    'Fabrikam’s supplier price files arrive "sometime between 01:00 and 05:00" — a fixed 03:00 schedule missed them twice a week. Switching to an event trigger (fire when the file lands) plus a metadata-driven ForEach loop that loads all 38 supplier tables from one control table cut their pipeline count from 14 to 3.',

  // ---- Manage ----
  'mg-workspace':
    'A Fabrikam intern once deleted a production dataflow — because everyone was Admin. This lesson is the RBAC reset: engineers become Contributors, the team lead a Member, store-ops Viewers, and only the platform owner keeps Admin. The Spark pool settings also get right-sized so ad-hoc notebooks stop starving the nightly load.',
  'mg-security':
    'Fabrikam’s auditor asks two questions: "who can see customer PII?" and "which report is the official revenue number?" Sensitivity labels + OneLake security answer the first; certifying the finance semantic model answers the second. The Purview audit log answers the follow-up: "prove who accessed it in March."',
  'mg-lifecycle':
    'A Fabrikam engineer edits the revenue notebook directly in production on a Friday; Monday’s numbers are wrong and nobody can see what changed. This lesson is the fix they adopt: Git integration for history and pull-request review, plus a Dev → Test → Prod deployment pipeline whose rules automatically swap the dev lakehouse connection for the prod one.',

  // ---- Monitor ----
  'mo-monitor':
    'Fabrikam’s CFO sees stale numbers at 08:00 and the team finds out from her. After this lesson they instead watch the Monitoring hub each morning, track CU burn in the Capacity Metrics app (spoiler: a runaway notebook was eating 40%), and let Activator post to the data team’s channel the moment the 02:00 pipeline fails.',
  'mo-errors':
    'One bad week at Fabrikam: the ERP password rotates and Copy fails (auth), a supplier renames a column and the Dataflow breaks (schema), and a notebook OOMs on Black Friday volume (skew). The triage table in this lesson is the playbook their on-call now follows — read the error where it surfaced, fix the root cause, re-run idempotently.',
  'mo-optimize':
    'Six months in, Fabrikam’s hourly micro-batches have left orders_silver with 40,000 tiny files and dashboards take 30 seconds. A scheduled weekly OPTIMIZE (plus VACUUM to reclaim 2 TB of old versions) brings reads back under 3 seconds — and broadcasting the 200-row store dimension fixes the one Spark join that kept spilling.',
}
