import type { ExamQuestion } from './exam-bank'

/**
 * Domain 1 — Implement & manage an analytics solution (30–35%).
 * Comprehensive coverage of every sub-skill: workspace settings (Spark, domain,
 * OneLake, Airflow), lifecycle management (Git, deployment pipelines, database
 * projects, variable libraries), security & governance (workspace/item/data
 * access, RLS/CLS/OLS, DDM, sensitivity labels, endorsement, OneLake security,
 * audit logs), and orchestration. Grounded in Microsoft Learn.
 */
export const BANK_IMPLEMENT: ExamQuestion[] = [
  // --- Workspace settings: Spark ---
  {
    id: 'i-spark-1',
    domain: 'implement',
    prompt:
      'Users report that the FIRST Spark session in a workspace takes ~3 minutes to start after you switched the default pool from the Starter pool to a custom pool. Why?',
    options: [
      'Custom pools are throttled',
      'Starter pools are pre-warmed (5–10s start); custom pools must provision nodes (~3 min)',
      'The capacity is too small',
      'Custom pools disable Spark',
    ],
    answer: 1,
    explanation:
      'Starter pools are always-on, pre-warmed clusters giving 5–10 second session starts. A custom pool must spin up nodes on first use, so expect ~3 minutes for the first session.',
    topic: 'Spark workspace settings',
  },
  {
    id: 'i-spark-2',
    domain: 'implement',
    prompt:
      'You want each notebook and Spark job definition to be able to use a different runtime version and custom libraries without changing workspace defaults. What do you configure?',
    options: ['A bigger capacity', 'A Fabric Environment item', 'A deployment pipeline', 'A domain'],
    answer: 1,
    explanation:
      'Environments let you tailor Spark runtime version, pool selection, and library dependencies per workload, attached to individual notebooks/SJDs — without altering the workspace-wide default.',
    topic: 'Spark environments',
  },
  {
    id: 'i-spark-3',
    domain: 'implement',
    prompt:
      'Interactive notebook sessions are holding compute long after users walk away. Which Spark workspace setting addresses this?',
    options: [
      'Reserve maximum cores',
      'Spark session timeout (default 20 minutes)',
      'V-Order',
      'Optimistic Job Admission',
    ],
    answer: 1,
    explanation:
      'The Spark session timeout (default 20 minutes) expires idle interactive sessions, freeing compute. It is configurable in the workspace Jobs settings.',
    topic: 'Spark workspace settings',
  },
  {
    id: 'i-spark-4',
    domain: 'implement',
    prompt:
      'A workspace admin wants members to be able to tune driver/executor cores and memory per item. Which toggle must be ON?',
    options: [
      '"Customize compute configurations for items"',
      '"Reserve maximum cores for active Spark jobs"',
      '"High concurrency mode"',
      '"Set default environment"',
    ],
    answer: 0,
    explanation:
      'The "Customize compute configurations for items" toggle in Spark pool settings lets members/contributors adjust session-level compute (driver/executor cores & memory) per notebook or SJD. When off, everything uses the default pool config.',
    topic: 'Spark workspace settings',
  },
  // --- Workspace settings: Airflow ---
  {
    id: 'i-air-1',
    domain: 'implement',
    prompt:
      'For a PRODUCTION Apache Airflow job that must always be available to honor its DAG schedules, which pool type should you configure?',
    options: [
      'Starter pool (auto-deprovisions when idle)',
      'Custom pool (always-on until manually paused)',
      'A Spark starter pool',
      'The default warehouse pool',
    ],
    answer: 1,
    explanation:
      'Airflow Starter pools shut down after ~20 minutes of inactivity (great for dev). Production scheduling needs a Custom pool, which stays always-on until manually paused so scheduled DAGs fire reliably.',
    topic: 'Apache Airflow settings',
  },
  {
    id: 'i-air-2',
    domain: 'implement',
    prompt:
      'In a Fabric Apache Airflow custom pool, what does adding an "extra node" give you?',
    options: [
      'Faster startup only',
      'Capacity to run three more workers (more concurrent DAGs)',
      'A second capacity',
      'Automatic V-Order',
    ],
    answer: 1,
    explanation:
      'Each extra node in an Airflow pool provides capacity for three additional workers, increasing how many DAGs can run concurrently. Autoscale adds them only when needed.',
    topic: 'Apache Airflow settings',
  },
  // --- Workspace settings: domain / OneLake ---
  {
    id: 'i-dom-1',
    domain: 'implement',
    prompt:
      'Your org wants Sales, Finance, and HR each to own and govern their own group of workspaces as data products, with a domain admin per area. What do you configure?',
    options: ['Deployment pipelines', 'Domains (and subdomains)', 'Sensitivity labels', 'Custom Spark pools'],
    answer: 1,
    explanation:
      'Domains group workspaces by business area and support delegated (federated) governance with domain admins — the building block of a data-mesh in Fabric.',
    topic: 'Domain settings',
  },
  {
    id: 'i-ol-1',
    domain: 'implement',
    prompt:
      'A tenant admin wants to restrict which users can create OneLake shortcuts to external sources across the tenant. Where is this governed?',
    options: [
      'Per notebook',
      'Tenant/OneLake settings in the admin portal',
      'In each lakehouse’s SQL endpoint',
      'In a deployment rule',
    ],
    answer: 1,
    explanation:
      'OneLake-related tenant settings (including external data sharing and shortcut behaviors) are governed centrally in the admin portal’s tenant/OneLake settings, not per item.',
    topic: 'OneLake workspace settings',
  },
  // --- Lifecycle: Git ---
  {
    id: 'i-git-1',
    domain: 'implement',
    prompt:
      'When you commit a lakehouse to Git, which is TRACKED?',
    options: [
      'The Delta table data',
      'Lakehouse metadata and shortcut definitions (not table data)',
      'The Files folder contents',
      'Spark view data',
    ],
    answer: 1,
    explanation:
      'Git tracks only metadata (display name, GUID, shortcut definitions, OneLake security role metadata). Table data, Files contents, and Spark views are never tracked or overwritten — data is always preserved.',
    topic: 'Git integration',
  },
  {
    id: 'i-git-2',
    domain: 'implement',
    prompt:
      'Two developers must build in the same workspace without overwriting each other, with review before code reaches main. Best practice?',
    options: [
      'Both edit the shared workspace directly',
      'Each connects an isolated workspace to their own feature branch, merging via pull request',
      'Email .pbip files',
      'Take turns by time of day',
    ],
    answer: 1,
    explanation:
      'The Fabric branching workflow: each developer works in an isolated workspace bound to a feature branch, then merges to main via pull request — parallel work plus review.',
    topic: 'Git integration',
  },
  {
    id: 'i-git-3',
    domain: 'implement',
    prompt:
      'There is no "revert to previous commit" button in the Fabric UI. How do you roll a workspace back to an older commit?',
    options: [
      'Delete and recreate the workspace',
      'Use git revert/reset to make the older commit HEAD, then update the workspace from source control',
      'Restore from a deployment pipeline',
      'Re-import a .pbix',
    ],
    answer: 1,
    explanation:
      'Promote the older commit to HEAD using git revert or git reset in the repo; the workspace then shows an available update in the source-control pane to pull. (Beware: data items may break if their schema changed.)',
    topic: 'Git integration',
  },
  // --- Lifecycle: deployment pipelines & variable libraries ---
  {
    id: 'i-dp-1',
    domain: 'implement',
    prompt:
      'During a deployment from Dev to Test, how much data is copied to the Test lakehouse?',
    options: [
      'All table data',
      'Only metadata — data is not copied',
      'Data and data sources',
      'Only the Files folder',
    ],
    answer: 1,
    explanation:
      'Deployment pipelines copy only item metadata between stages; data is never copied. Each stage’s workspace keeps its own data.',
    topic: 'Deployment pipelines',
  },
  {
    id: 'i-dp-2',
    domain: 'implement',
    prompt:
      'You need items to point at environment-specific data sources per stage. Microsoft now recommends which mechanism as the FIRST choice for parameterization?',
    options: [
      'Deployment rules',
      'Variable libraries',
      'Editing each item after deploy',
      'Separate pipelines per stage',
    ],
    answer: 1,
    explanation:
      'Both work, but Variable Libraries are now the strategic, recommended capability for environment-specific configuration in Fabric. Deployment rules remain supported (legacy from Power BI).',
    topic: 'Deployment pipelines',
  },
  {
    id: 'i-dp-3',
    domain: 'implement',
    prompt:
      'When you deploy a solution containing a lakehouse, a notebook, and a pipeline that reference each other, deployment pipelines…',
    options: [
      'Break the references — you must relink manually',
      'Automatically rebind the item relationships in the target stage',
      'Duplicate the data',
      'Require a Git commit first',
    ],
    answer: 1,
    explanation:
      'Deployment pipelines (like Git sync) automatically rebind item dependencies (lakehouse↔notebook↔pipeline) in the target workspace, so cross-item references keep working after promotion.',
    topic: 'Deployment pipelines',
  },
  {
    id: 'i-dp-4',
    domain: 'implement',
    prompt: 'A production hotfix is needed. What is the correct deployment-pipeline practice?',
    options: [
      'Edit the Prod item directly',
      'Fix in Dev, then deploy Dev → Test → Prod',
      'Fix in Test only',
      'Disable the pipeline and patch manually',
    ],
    answer: 1,
    explanation:
      'Never edit production directly. Implement the fix in Dev, validate through Test, and deploy across the pipeline (a few minutes) so the fix is tested before it hits Prod.',
    topic: 'Deployment pipelines',
  },
  {
    id: 'i-db-1',
    domain: 'implement',
    prompt:
      'You want to define and version a warehouse’s schema (tables, views, procedures) as code and deploy it repeatably. Which capability fits?',
    options: [
      'A Dataflow Gen2',
      'A SQL database project',
      'A OneLake shortcut',
      'A semantic model',
    ],
    answer: 1,
    explanation:
      'SQL database projects let you define warehouse schema as source files, version them in Git, and deploy schema changes repeatably — the "implement database projects" lifecycle skill.',
    topic: 'Database projects',
  },
  // --- Security & governance ---
  {
    id: 'i-sec-1',
    domain: 'implement',
    prompt:
      'A user is not part of any OneLake security data-access role for a lakehouse that has such roles defined. What do they see?',
    options: [
      'All data',
      'No data in that item',
      'Only masked data',
      'Only the schema',
    ],
    answer: 1,
    explanation:
      'With OneLake security roles defined, users must be added to a data-access role to see anything. Users in no role see no data in that item.',
    topic: 'OneLake security',
  },
  {
    id: 'i-sec-2',
    domain: 'implement',
    prompt:
      'You need BOTH row-level and column-level restrictions on the same lakehouse table via OneLake security. How must they be applied?',
    options: [
      'One role for RLS and a separate role for CLS',
      'Both RLS and CLS rules within a SINGLE OneLake security role',
      'Only RLS is supported',
      'They cannot be combined',
    ],
    answer: 1,
    explanation:
      'OneLake security requires RLS and CLS to live in one role. Combining a role that has RLS with another that has CLS is unsupported and causes query errors.',
    topic: 'OneLake security',
  },
  {
    id: 'i-sec-3',
    domain: 'implement',
    prompt:
      'In the lakehouse SQL analytics endpoint using USER identity mode, how is table access controlled?',
    options: [
      'SQL GRANT/REVOKE on tables',
      'OneLake security roles (SQL GRANT/REVOKE on tables is not allowed)',
      'Dynamic data masking only',
      'Workspace roles only',
    ],
    answer: 1,
    explanation:
      'In user identity mode, table access is governed by OneLake security roles; SQL GRANT/REVOKE on tables is not allowed. (Delegated identity mode uses SQL GRANT/REVOKE instead.)',
    topic: 'OneLake security',
  },
  {
    id: 'i-sec-4',
    domain: 'implement',
    prompt: 'Which security feature is NOT supported through OneLake security roles (only via the warehouse/delegated SQL model)?',
    options: [
      'Row-level security',
      'Column-level security',
      'Dynamic data masking',
      'Folder access',
    ],
    answer: 2,
    explanation:
      'Dynamic data masking is not supported in OneLake security; it is defined with SQL ALTER TABLE … MASKED in the warehouse (delegated identity) model. RLS/CLS/folder access are supported in OneLake security.',
    topic: 'OneLake security',
  },
  {
    id: 'i-sec-5',
    domain: 'implement',
    prompt:
      'Which workspace roles can create OneLake security data-access roles (need Write and Reshare)?',
    options: [
      'Viewer and Contributor',
      'Admin and Member',
      'Contributor only',
      'Any authenticated user',
    ],
    answer: 1,
    explanation:
      'Creating OneLake data-access roles requires Write and Reshare permissions — generally the Admin and Member workspace roles.',
    topic: 'Security roles',
  },
  {
    id: 'i-sec-6',
    domain: 'implement',
    prompt:
      'You must share a single report with a partner without giving them access to the rest of the workspace. What do you use?',
    options: [
      'Add them as a workspace Member',
      'Item-level sharing/permissions on the report',
      'A new capacity',
      'A sensitivity label',
    ],
    answer: 1,
    explanation:
      'Item permissions let you share one item (report, lakehouse, etc.) without granting workspace-wide access — the least-privilege choice.',
    topic: 'Item-level access',
  },
  {
    id: 'i-sec-7',
    domain: 'implement',
    prompt:
      'A limitation of dynamic data masking that you must design around is:',
    options: [
      'It encrypts data at rest',
      'A user querying directly can still infer values via exhaustive queries unless combined with CLS/RLS',
      'It blocks all SELECTs',
      'It requires a separate capacity',
    ],
    answer: 1,
    explanation:
      'DDM only obfuscates values in result sets; users with direct query access can infer data through exhaustive queries. Combine DDM with column-/row-level security for real protection.',
    topic: 'Dynamic data masking',
  },
  {
    id: 'i-sec-8',
    domain: 'implement',
    prompt:
      'You want consumers to instantly recognize the ONE approved, quality-checked semantic model. Which feature signals this?',
    options: [
      'Sensitivity label',
      'Endorsement — Certify (or Promote)',
      'Dynamic data masking',
      'A domain',
    ],
    answer: 1,
    explanation:
      'Endorsement (Promote or Certify) marks trusted, approved content. Certification is the highest trust signal, typically restricted to authorized reviewers. Labels classify sensitivity, not quality.',
    topic: 'Endorsement',
  },
  {
    id: 'i-sec-9',
    domain: 'implement',
    prompt:
      'Compliance needs a record of who accessed and modified Fabric items last quarter. Where do you get it?',
    options: [
      'The Monitoring hub',
      'Microsoft Purview audit logs',
      'The Capacity Metrics app',
      'The lakehouse SQL endpoint',
    ],
    answer: 1,
    explanation:
      'Fabric user activities are captured in the Microsoft Purview audit log (and via PowerShell), the compliance source for who-did-what. The Monitoring hub shows job runs, not user audit trails.',
    topic: 'Audit logs',
  },
  {
    id: 'i-sec-10',
    domain: 'implement',
    prompt:
      'Sensitivity labels applied to a Fabric semantic model primarily provide:',
    options: [
      'Faster refresh',
      'Classification and protection that flows downstream (e.g., to exports)',
      'Row-level filtering',
      'Compute isolation',
    ],
    answer: 1,
    explanation:
      'Sensitivity labels (Microsoft Purview) classify items and carry protection downstream, including to supported exports — a governance/classification control, not performance or row filtering.',
    topic: 'Sensitivity labels',
  },
  // --- Orchestration ---
  {
    id: 'i-orch-1',
    domain: 'implement',
    prompt:
      'A citizen developer must combine and lightly transform several sources with the least code. A pipeline should orchestrate the overall run. Which combo is right?',
    options: [
      'Notebook does everything',
      'Pipeline orchestrates; a Dataflow Gen2 activity does the low-code transform',
      'Dataflow orchestrates the pipeline',
      'KQL queryset',
    ],
    answer: 1,
    explanation:
      'Pipelines orchestrate and move data and can invoke a Dataflow Gen2 (low-code Power Query) as an activity for the transform — matching "least code" for the transform and orchestration for the run.',
    topic: 'Choosing orchestration tools',
  },
  {
    id: 'i-orch-2',
    domain: 'implement',
    prompt:
      'Supplier files arrive at unpredictable times. You want the pipeline to run the moment a file lands in storage. What do you configure?',
    options: [
      'A 15-minute schedule',
      'An event-based (storage event) trigger',
      'A manual trigger',
      'A tumbling window',
    ],
    answer: 1,
    explanation:
      'Event-based triggers fire on storage/OneLake events (like a file arrival), so ingestion starts immediately rather than waiting for a fixed schedule.',
    topic: 'Triggers',
  },
  {
    id: 'i-orch-3',
    domain: 'implement',
    prompt:
      'You must load 40 tables with one reusable pipeline driven by a control table. Which activities are central?',
    options: [
      'A single Copy activity',
      'Lookup (read control table) + ForEach (iterate) with parameterized activities',
      'Only Set variable',
      'A Dataflow Gen2',
    ],
    answer: 1,
    explanation:
      'The metadata-driven pattern uses Lookup to read the control table and ForEach to iterate, passing table names as parameters to Copy/transform activities — one pipeline, many tables.',
    topic: 'Orchestration patterns',
  },
  {
    id: 'i-orch-4',
    domain: 'implement',
    prompt:
      'In a pipeline, you must capture the error message of a failed Copy activity and log it. How do you reference it?',
    options: [
      "@pipeline().parameters.error",
      "@activity('CopyData').error.message on an activity linked from the failure path",
      'Variables cannot hold errors',
      'Only in the Monitoring hub',
    ],
    answer: 1,
    explanation:
      "Link a logging activity from the Copy activity’s failure output and reference @activity('CopyData').error.message via dynamic content to capture and store the failure detail.",
    topic: 'Orchestration patterns',
  },
  {
    id: 'i-orch-5',
    domain: 'implement',
    prompt:
      'What is the key difference between a pipeline parameter and a pipeline variable?',
    options: [
      'They are identical',
      'Parameters are set at run start and read-only during the run; variables can be changed mid-run with Set variable',
      'Variables are set at run start; parameters change mid-run',
      'Only variables support dynamic content',
    ],
    answer: 1,
    explanation:
      'Parameters are passed at invocation and are read-only during execution; variables are mutable during the run via the Set variable activity.',
    topic: 'Parameters & dynamic expressions',
  },
  {
    id: 'i-orch-6',
    domain: 'implement',
    prompt:
      'When should you choose a notebook over a Dataflow Gen2 for a transformation step?',
    options: [
      'When the users are non-technical',
      'When logic is complex/large-scale and benefits from code (PySpark), custom logic, or MERGE upserts',
      'When you want the least code',
      'Never — dataflows are always better',
    ],
    answer: 1,
    explanation:
      'Notebooks (Spark) suit complex, large-scale, or highly custom transforms and code-based patterns like MERGE. Dataflow Gen2 suits low-code/citizen-developer transforms.',
    topic: 'Choosing orchestration tools',
  },
  {
    id: 'i-air-3',
    domain: 'implement',
    prompt:
      'A team wants to orchestrate Fabric notebooks and pipelines using Python DAGs they already maintain, rather than the visual pipeline canvas. Which item, and what capacity requirement?',
    options: [
      'Data pipeline; works on any workspace',
      'Apache Airflow job; requires a workspace on a paid capacity (not Free/PPU)',
      'Dataflow Gen2; requires Premium',
      'Notebook; requires a trial only',
    ],
    answer: 1,
    explanation:
      'Apache Airflow jobs provide code-first (Python DAG) orchestration and require a workspace assigned to a paid Fabric capacity — Free and PPU workspaces are not supported.',
    topic: 'Apache Airflow settings',
  },
  {
    id: 'i-sec-11',
    domain: 'implement',
    prompt:
      'You add an analyst to a restrictive OneLake data-access role, but they can still see all rows. What did you most likely forget?',
    options: [
      'To grant them Admin',
      'To remove them from the DefaultReader role (which grants ReadAll)',
      'To enable DirectQuery',
      'To create a shortcut',
    ],
    answer: 1,
    explanation:
      'Every lakehouse has a DefaultReader role granting ReadAll. A user left in DefaultReader keeps full access regardless of other roles — remove them from it when applying a restrictive role.',
    topic: 'OneLake security',
  },
  {
    id: 'i-sec-12',
    domain: 'implement',
    prompt:
      'Which users are NOT filtered by OneLake security RLS/CLS on a lakehouse table?',
    options: [
      'Everyone is filtered equally',
      'Workspace Admin, Member, and Contributor (they bypass it); only Viewer/Read users are filtered',
      'Only external users',
      'Only the item owner',
    ],
    answer: 1,
    explanation:
      'Workspace Admin, Member, and Contributor roles bypass OneLake security and can read all data. RLS/CLS filtering applies to Viewer users and those granted via OneLake Read roles.',
    topic: 'OneLake security',
  },
  {
    id: 'i-orch-7',
    domain: 'implement',
    prompt:
      'You must load 38 source tables with one maintainable pipeline driven by a table listing sources, targets, and watermarks. Which construct iterates the rows?',
    options: [
      'A single Copy activity',
      'Lookup (read control table) feeding a ForEach that runs parameterized activities per @item()',
      'A Dataflow Gen2',
      'Nested If Conditions',
    ],
    answer: 1,
    explanation:
      'The metadata-driven pattern: Lookup reads the control table, ForEach iterates its rows, and inner activities reference @item().SourceTable etc. — one pipeline serves all 38 tables.',
    topic: 'Metadata-driven orchestration',
  },
]
