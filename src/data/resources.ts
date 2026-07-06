/**
 * Curated "go deeper" references per module. Rules:
 *  - Docs/Learn links are official Microsoft Learn URLs (verified against the
 *    DP-700 study guide and Fabric documentation).
 *  - Video links point at the official Microsoft Fabric YouTube channel or a
 *    YouTube search (search URLs cannot dead-link as videos come and go).
 */
export interface Resource {
  kind: 'Docs' | 'Learn' | 'Video'
  title: string
  url: string
}

export const EXAM_LINKS: Resource[] = [
  {
    kind: 'Learn',
    title: 'Official DP-700 study guide (skills measured)',
    url: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-700',
  },
  {
    kind: 'Learn',
    title: 'Certification page + free practice assessment',
    url: 'https://learn.microsoft.com/credentials/certifications/fabric-data-engineer-associate/',
  },
  {
    kind: 'Learn',
    title: 'Course DP-700T00: Microsoft Fabric Data Engineer',
    url: 'https://learn.microsoft.com/training/courses/dp-700t00',
  },
  {
    kind: 'Video',
    title: 'Exam Readiness Zone (official prep videos)',
    url: 'https://learn.microsoft.com/shows/exam-readiness-zone/',
  },
  {
    kind: 'Video',
    title: 'Microsoft Fabric — official YouTube channel',
    url: 'https://www.youtube.com/@MicrosoftFabric',
  },
]

export const RESOURCES: Record<string, Resource[]> = {
  architecture: [
    { kind: 'Docs', title: 'Microsoft Fabric documentation home', url: 'https://learn.microsoft.com/fabric/' },
    { kind: 'Docs', title: 'What is Data engineering in Fabric?', url: 'https://learn.microsoft.com/fabric/data-engineering/data-engineering-overview' },
    { kind: 'Docs', title: 'Decision guide: Warehouse vs Lakehouse', url: 'https://learn.microsoft.com/fabric/fundamentals/decision-guide-lakehouse-warehouse' },
    { kind: 'Video', title: 'YouTube: Microsoft Fabric OneLake explained', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+onelake+explained' },
  ],
  lakehouse: [
    { kind: 'Docs', title: 'Lakehouse end-to-end tutorial', url: 'https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction' },
    { kind: 'Docs', title: 'Medallion architecture in OneLake', url: 'https://learn.microsoft.com/fabric/onelake/onelake-medallion-lakehouse-architecture' },
    { kind: 'Docs', title: 'OneLake shortcuts', url: 'https://learn.microsoft.com/fabric/onelake/onelake-shortcuts' },
    { kind: 'Video', title: 'YouTube: Fabric lakehouse tutorial', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+lakehouse+tutorial' },
  ],
  ingest: [
    { kind: 'Docs', title: 'What is Data Factory in Fabric?', url: 'https://learn.microsoft.com/fabric/data-factory/data-factory-overview' },
    { kind: 'Docs', title: 'OneLake shortcuts (reference, don’t copy)', url: 'https://learn.microsoft.com/fabric/onelake/onelake-shortcuts' },
    { kind: 'Video', title: 'YouTube: Fabric data pipeline copy activity', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+data+pipeline+copy+activity' },
    { kind: 'Video', title: 'YouTube: Fabric mirroring explained', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+mirroring' },
  ],
  transform: [
    { kind: 'Docs', title: 'What is a lakehouse? (Spark transforms)', url: 'https://learn.microsoft.com/fabric/data-engineering/lakehouse-overview' },
    { kind: 'Video', title: 'YouTube: PySpark in Microsoft Fabric notebooks', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+notebook+pyspark+tutorial' },
    { kind: 'Video', title: 'YouTube: slowly changing dimensions explained', url: 'https://www.youtube.com/results?search_query=slowly+changing+dimensions+type+2+explained' },
  ],
  warehouse: [
    { kind: 'Learn', title: 'Get started with data warehouses in Fabric', url: 'https://learn.microsoft.com/training/modules/get-started-data-warehouse/' },
    { kind: 'Learn', title: 'Load data into a Fabric data warehouse', url: 'https://learn.microsoft.com/training/modules/load-data-into-microsoft-fabric-data-warehouse/' },
    { kind: 'Learn', title: 'Query a data warehouse in Fabric', url: 'https://learn.microsoft.com/training/modules/query-data-warehouse-microsoft-fabric/' },
    { kind: 'Video', title: 'YouTube: Fabric warehouse tutorial', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+data+warehouse+tutorial' },
  ],
  rti: [
    { kind: 'Docs', title: 'Real-Time Intelligence overview', url: 'https://learn.microsoft.com/fabric/real-time-intelligence/overview' },
    { kind: 'Video', title: 'YouTube: Fabric Eventstream tutorial', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+eventstream+tutorial' },
    { kind: 'Video', title: 'YouTube: KQL for beginners', url: 'https://www.youtube.com/results?search_query=kusto+query+language+kql+beginners' },
  ],
  orchestration: [
    { kind: 'Docs', title: 'What is Data Factory in Fabric?', url: 'https://learn.microsoft.com/fabric/data-factory/data-factory-overview' },
    { kind: 'Video', title: 'YouTube: metadata-driven pipelines in Fabric', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+metadata+driven+pipeline+foreach' },
  ],
  manage: [
    { kind: 'Docs', title: 'Domains (data mesh) in Fabric', url: 'https://learn.microsoft.com/fabric/governance/domains' },
    { kind: 'Docs', title: 'Fabric workspaces', url: 'https://learn.microsoft.com/fabric/fundamentals/workspaces' },
    { kind: 'Video', title: 'YouTube: Fabric Git integration & deployment pipelines', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+git+integration+deployment+pipelines' },
  ],
  monitor: [
    { kind: 'Docs', title: 'Table maintenance & optimization (OPTIMIZE, V-Order)', url: 'https://learn.microsoft.com/fabric/fundamentals/table-maintenance-optimization' },
    { kind: 'Docs', title: 'Delta optimization and V-Order', url: 'https://learn.microsoft.com/fabric/data-engineering/delta-optimization-and-v-order' },
    { kind: 'Video', title: 'YouTube: Fabric Capacity Metrics app', url: 'https://www.youtube.com/results?search_query=microsoft+fabric+capacity+metrics+app' },
  ],
}
