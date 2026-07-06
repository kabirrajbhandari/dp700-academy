import type { Domain } from '../types'

/**
 * The three official DP-700 skill areas (each ~30–35% of the exam),
 * per the Microsoft "Skills measured" study guide.
 */
export const DOMAINS: Domain[] = [
  {
    id: 'implement',
    title: 'Implement & manage an analytics solution',
    weight: '30–35%',
    color: '#7a95b8',
    description:
      'Configure workspace settings, lifecycle management (Git + deployment pipelines), security & governance, and orchestrate processes across Fabric items.',
  },
  {
    id: 'ingest',
    title: 'Ingest & transform data',
    weight: '30–35%',
    color: '#4f9a8e',
    description:
      'Design loading patterns (full/incremental, dimensional, streaming) and ingest & transform both batch and streaming data with pipelines, Dataflows Gen2, notebooks, T-SQL, and KQL.',
  },
  {
    id: 'monitor',
    title: 'Monitor & optimize an analytics solution',
    weight: '30–35%',
    color: '#8a9d6e',
    description:
      'Monitor Fabric items, configure alerts, identify & resolve errors across every workload, and optimize lakehouses, warehouses, pipelines, Spark, and queries.',
  },
]
