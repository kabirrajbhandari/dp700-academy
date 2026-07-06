import type { Module } from '../types'

export const modManage: Module = {
  id: 'manage',
  title: 'Manage a Microsoft Fabric Environment',
  domain: 'implement',
  difficulty: 'Core',
  icon: '🛡️',
  blurb:
    'Workspace settings, security & governance, and lifecycle management with Git + deployment pipelines.',
  lessons: [
    {
      id: 'mg-workspace',
      title: 'Workspace settings & access roles',
      minutes: 13,
      summary:
        'Roles (Admin/Member/Contributor/Viewer), plus Spark, domain, and OneLake workspace settings.',
      keyPoints: [
        'Four workspace roles: Admin, Member, Contributor, Viewer — least privilege.',
        'Admin/Member can share & manage; Contributor edits; Viewer reads.',
        'Configure Spark pools/environments, domains, and OneLake settings at workspace scope.',
      ],
      blocks: [
        {
          kind: 'table',
          headers: ['Role', 'Can do', 'Typical user'],
          rows: [
            ['Admin', 'Everything incl. manage access, delete workspace, update settings', 'Workspace owner'],
            ['Member', 'Add others (up to Member), share items, publish', 'Team lead'],
            ['Contributor', 'Create/edit/run items; cannot manage access', 'Developer'],
            ['Viewer', 'View & read data only', 'Business consumer'],
          ],
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Workspace-scoped settings you must know',
          body:
            'Spark settings (pool size, runtime version, autoscale, environments) tune compute. Domain settings group the workspace into a business domain for governance/data-mesh. OneLake settings control whether items are available via OneLake and enable OneLake security. Apache Airflow settings enable Airflow-based orchestration jobs.',
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Grant the minimum role that lets a person do their job: a developer who builds pipelines but must not manage sharing = Contributor. Someone who only reads reports = Viewer. Adding new teammates and sharing = Member/Admin.',
        },
      ],
    },
    {
      id: 'mg-security',
      title: 'Security & governance',
      minutes: 15,
      summary:
        'Layered access (workspace → item → data), sensitivity labels, endorsement, OneLake security, and audit logs.',
      keyPoints: [
        'Access is layered: workspace roles → item permissions → data (RLS/CLS/OLS/file).',
        'Sensitivity labels (from Microsoft Purview) classify & protect items end-to-end.',
        'Endorsement: Promote or Certify trustworthy items.',
        'Audit logs (Purview) record who did what; OneLake security controls data-level access.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'security-layers',
          caption: 'Defense in depth: coarse workspace roles down to fine-grained row/column/file security.',
        },
        {
          kind: 'text',
          body:
            'Governance in Fabric is layered. **Workspace roles** set coarse access. **Item permissions** share a single item (e.g. a report) without granting the whole workspace. **Data-level controls** — RLS, CLS, object-level security, and OneLake folder/file security — restrict the actual rows, columns, and files a user sees.',
        },
        {
          kind: 'table',
          headers: ['Governance feature', 'What it does'],
          rows: [
            ['Sensitivity labels', 'Classify items (Confidential, etc.) with Purview; labels & protection flow downstream'],
            ['Endorsement', 'Promote or Certify items so users know what is trustworthy'],
            ['OneLake security', 'Define security roles restricting access to specific folders/tables in OneLake'],
            ['Audit logs', 'Purview audit records every action (who accessed/changed what) for compliance'],
            ['Domains', 'Group workspaces by business area; delegate governance'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Item permissions vs. workspace roles',
          body:
            'To share just one report or lakehouse with someone outside the team, use item-level sharing instead of adding them to the workspace. This keeps least-privilege intact.',
        },
      ],
    },
    {
      id: 'mg-lifecycle',
      title: 'Lifecycle management: Git & deployment pipelines',
      minutes: 16,
      summary:
        'Version control with Git integration, database projects, and promoting Dev → Test → Prod with deployment pipelines.',
      keyPoints: [
        'Git integration connects a workspace to Azure DevOps/GitHub for version control.',
        'Deployment pipelines promote content across Dev → Test → Prod stages.',
        'Deployment rules parameterize per-stage values (e.g. connection strings).',
        'Database projects (SQL projects) version warehouse schema as code.',
      ],
      blocks: [
        {
          kind: 'diagram',
          id: 'cicd',
          caption: 'Git-backed workspace → deployment pipeline promotes items through Dev, Test, Prod.',
        },
        {
          kind: 'steps',
          title: 'Set up version control + release flow',
          steps: [
            {
              title: 'Connect Git',
              detail:
                'In workspace settings, connect to an Azure DevOps or GitHub repo and branch. Committing syncs item definitions (as source files) to Git; you can branch, review, and revert.',
              path: 'Workspace → Settings → Git integration',
            },
            {
              title: 'Create a deployment pipeline',
              detail:
                'Create a deployment pipeline with Dev, Test, and Prod stages and assign a workspace to each stage.',
              path: '+ New → Deployment pipeline',
            },
            {
              title: 'Add deployment rules',
              detail:
                'Configure deployment rules and parameters so stage-specific settings (data source, connection) are swapped automatically on promotion.',
            },
            {
              title: 'Promote',
              detail:
                'Compare stages, then Deploy to push validated changes from Dev → Test → Prod. Only changed items move.',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'exam',
          title: 'Exam angle',
          body:
            'Git integration = source control / branching / history for a single workspace. Deployment pipelines = promoting content between environments (Dev/Test/Prod). They complement each other: version with Git, release with deployment pipelines. Deployment rules handle per-environment differences.',
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Database projects',
          body:
            'For warehouses, SQL database projects let you define the schema as code (SQL files), version it in Git, and deploy schema changes repeatably — the exam lists "implement database projects" under lifecycle management.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'q-mg-1',
      prompt:
        'A developer must create and run pipelines and notebooks in a workspace but must NOT be able to add or remove other users. Which role fits best?',
      options: ['Viewer', 'Contributor', 'Member', 'Admin'],
      answer: 1,
      explanation:
        'Contributor can create, edit, and run items but cannot manage workspace access. Member and Admin can manage access/sharing; Viewer is read-only.',
      topic: 'Workspace roles',
    },
    {
      id: 'q-mg-2',
      prompt: 'What is the purpose of a Fabric deployment pipeline?',
      options: [
        'Provide Git version control for a workspace',
        'Promote content across Dev → Test → Prod stages',
        'Ingest streaming data',
        'Apply row-level security',
      ],
      answer: 1,
      explanation:
        'Deployment pipelines promote content between environment stages (Dev/Test/Prod) with comparison and deployment rules. Version control/branching is provided separately by Git integration.',
      topic: 'Deployment pipelines',
    },
    {
      id: 'q-mg-3',
      prompt:
        'You need to connect a workspace to source control so you can branch, review changes, and roll back item definitions. What do you configure?',
      options: ['A deployment pipeline', 'Git integration in workspace settings', 'A sensitivity label', 'OneLake security'],
      answer: 1,
      explanation:
        'Git integration connects the workspace to Azure DevOps or GitHub, syncing item definitions as source files so you get branching, review, and history. Deployment pipelines handle promotion, not version control.',
      topic: 'Git integration',
    },
    {
      id: 'q-mg-4',
      prompt:
        'You want to mark a semantic model as officially trustworthy so consumers know it is the approved source. Which governance feature do you use?',
      options: ['Sensitivity label', 'Endorsement (Promote/Certify)', 'Dynamic data masking', 'A Viewer role'],
      answer: 1,
      explanation:
        'Endorsement lets you Promote or Certify items so users can identify trusted, approved content. Sensitivity labels classify/protect data but do not signal trust/quality.',
      topic: 'Endorsement & governance',
    },
  ],
}
