import type { DiagramId } from '../types'

/**
 * Hand-built instructional SVG diagrams. These replace copyrighted portal
 * screenshots with clean, labeled schematics that render crisply and adapt
 * to light/dark themes via CSS variables.
 */

const C = {
  box: 'var(--diag-box)',
  boxAlt: 'var(--diag-box-alt)',
  line: 'var(--diag-line)',
  text: 'var(--diag-text)',
  accent: 'var(--accent)',
  bronze: '#b8763e',
  silver: '#8a94a6',
  gold: '#d4a017',
}

function Box({
  x, y, w, h, label, sub, fill = C.box, rx = 10,
}: { x: number; y: number; w: number; h: number; label: string; sub?: string; fill?: string; rx?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={C.line} strokeWidth={1.5} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 4 : y + h / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.text}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.7}>
          {sub}
        </text>
      )}
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, dashed }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={C.line} strokeWidth={1.8}
      markerEnd="url(#arr)" strokeDasharray={dashed ? '5 4' : undefined}
    />
  )
}

function Frame({ children, vb = '0 0 640 320' }: { children: React.ReactNode; vb?: string }) {
  return (
    <svg viewBox={vb} width="100%" role="img" style={{ maxHeight: 340 }}>
      <defs>
        <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,3 L0,6 Z" fill={C.line} />
        </marker>
      </defs>
      {children}
    </svg>
  )
}

function FabricArch() {
  return (
    <Frame vb="0 0 640 320">
      <Box x={40} y={20} w={560} h={44} label="Microsoft Fabric — one SaaS platform, one capacity (F-SKU)" fill={C.boxAlt} />
      {[
        ['Data\nEngineering', 60], ['Data\nFactory', 175], ['Data\nWarehouse', 290],
        ['Real-Time\nIntelligence', 405], ['Data\nScience / BI', 520],
      ].map(([l, x], i) => (
        <g key={i}>
          <rect x={x as number} y={95} width={95} height={54} rx={9} fill={C.box} stroke={C.line} strokeWidth={1.5} />
          {(l as string).split('\n').map((line, j) => (
            <text key={j} x={(x as number) + 47} y={116 + j * 15} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={C.text}>{line}</text>
          ))}
          <Arrow x1={(x as number) + 47} y1={149} x2={(x as number) + 47} y2={200} />
        </g>
      ))}
      <Box x={40} y={200} w={560} h={54} label="OneLake — one logical data lake (open Delta-Parquet)" sub="every engine reads & writes the same single copy of data" fill={C.boxAlt} />
      <text x={320} y={290} textAnchor="middle" fontSize={11} fill={C.text} opacity={0.65}>
        No copies between engines · SaaS · unified security &amp; governance
      </text>
    </Frame>
  )
}

function OneLake() {
  return (
    <Frame vb="0 0 640 320">
      <Box x={20} y={20} w={600} h={34} label="Tenant" fill={C.boxAlt} />
      <Box x={40} y={70} w={175} h={150} label="" fill="transparent" />
      <text x={127} y={92} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.text}>Workspace A</text>
      <Box x={55} y={104} w={145} h={40} label="Lakehouse" fill={C.box} />
      <Box x={55} y={152} w={145} h={40} label="Notebook" fill={C.box} />
      <Box x={235} y={70} w={175} h={150} label="" fill="transparent" />
      <text x={322} y={92} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.text}>Workspace B</text>
      <Box x={250} y={104} w={145} h={40} label="Warehouse" fill={C.box} />
      <Box x={250} y={152} w={145} h={40} label="Pipeline" fill={C.box} />
      <Box x={430} y={70} w={185} h={150} label="" fill="transparent" />
      <text x={522} y={92} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.text}>External sources</text>
      <Box x={445} y={104} w={155} h={40} label="ADLS · S3 · GCS" fill={C.boxAlt} />
      <Box x={445} y={152} w={155} h={40} label="Dataverse" fill={C.boxAlt} />
      <Box x={20} y={250} w={600} h={48} label="OneLake  (one lake for the whole tenant)" sub="shortcuts virtualize external data in place — no copy" fill={C.boxAlt} />
      <Arrow x1={127} y1={220} x2={200} y2={250} />
      <Arrow x1={322} y1={220} x2={330} y2={250} />
      <Arrow x1={522} y1={220} x2={460} y2={250} dashed />
      <text x={585} y={244} textAnchor="middle" fontSize={9.5} fill={C.text} opacity={0.7}>shortcut</text>
    </Frame>
  )
}

function Medallion() {
  return (
    <Frame vb="0 0 640 240">
      <Box x={30} y={70} w={150} h={90} label="🥉 Bronze" sub="raw, unchanged" fill="rgba(184,118,62,0.18)" />
      <Box x={245} y={70} w={150} h={90} label="🥈 Silver" sub="cleaned & conformed" fill="rgba(138,148,166,0.20)" />
      <Box x={460} y={70} w={150} h={90} label="🥇 Gold" sub="business-ready" fill="rgba(212,160,23,0.18)" />
      <Arrow x1={180} y1={115} x2={245} y2={115} />
      <Arrow x1={395} y1={115} x2={460} y2={115} />
      <text x={212} y={105} textAnchor="middle" fontSize={10} fill={C.text} opacity={0.7}>clean</text>
      <text x={427} y={105} textAnchor="middle" fontSize={10} fill={C.text} opacity={0.7}>aggregate</text>
      <text x={105} y={185} textAnchor="middle" fontSize={10} fill={C.text} opacity={0.7}>ingest / shortcut</text>
      <text x={535} y={185} textAnchor="middle" fontSize={10} fill={C.text} opacity={0.7}>Power BI / SQL</text>
      <text x={320} y={30} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.text}>Quality increases left → right</text>
    </Frame>
  )
}

function LakehouseVsWarehouse() {
  return (
    <Frame vb="0 0 640 300">
      <Box x={30} y={30} w={580} h={36} label="Decision: developer profile + read/write needs" fill={C.boxAlt} />
      <Box x={40} y={95} w={175} h={150} label="Lakehouse" sub="Spark · files + Delta" fill={C.box} />
      <Box x={232} y={95} w={175} h={150} label="Warehouse" sub="Full T-SQL · writable" fill={C.box} />
      <Box x={424} y={95} w={185} h={150} label="Eventhouse / KQL" sub="Streaming · time-series" fill={C.box} />
      <text x={127} y={160} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.75}>data engineers</text>
      <text x={127} y={178} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.75}>PySpark</text>
      <text x={127} y={210} textAnchor="middle" fontSize={10} fill={C.text} opacity={0.6}>read-only SQL endpoint</text>
      <text x={319} y={160} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.75}>SQL developers</text>
      <text x={319} y={178} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.75}>INSERT/UPDATE/DELETE</text>
      <text x={319} y={210} textAnchor="middle" fontSize={10} fill={C.text} opacity={0.6}>transactions, procs</text>
      <text x={516} y={160} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.75}>logs · IoT · events</text>
      <text x={516} y={178} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.75}>KQL, sub-second</text>
      <text x={516} y={210} textAnchor="middle" fontSize={10} fill={C.text} opacity={0.6}>high-volume streaming</text>
      <text x={320} y={280} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.65}>All three store Delta in OneLake — pick by workload, not just data size</text>
    </Frame>
  )
}

function IngestOptions() {
  const rows: [string, string][] = [
    ['Pipeline (Copy)', 'high-volume move + orchestrate'],
    ['Dataflow Gen2', 'low-code Power Query transform'],
    ['Notebook (Spark)', 'code-first complex transforms'],
    ['Shortcut', 'reference lake data — no copy'],
    ['Mirroring', 'replicate an operational DB'],
  ]
  return (
    <Frame vb="0 0 640 320">
      <Box x={40} y={20} w={200} h={40} label="Sources" sub="DB · files · API · stream" fill={C.boxAlt} />
      {rows.map(([l, s], i) => (
        <g key={i}>
          <Box x={300} y={20 + i * 56} w={300} h={44} label={l} sub={s} fill={C.box} />
          <Arrow x1={240} y1={40 + (i === 0 ? 0 : 0)} x2={300} y2={42 + i * 56} />
        </g>
      ))}
      <Arrow x1={140} y1={60} x2={140} y2={150} />
      <Box x={40} y={150} w={200} h={44} label="OneLake" sub="lakehouse / warehouse" fill={C.boxAlt} />
    </Frame>
  )
}

function RtiFlow() {
  return (
    <Frame vb="0 0 640 200">
      <Box x={20} y={70} w={120} h={60} label="Sources" sub="Event Hubs · IoT" fill={C.boxAlt} />
      <Box x={170} y={70} w={120} h={60} label="Eventstream" sub="ingest + route" fill={C.box} />
      <Box x={320} y={70} w={130} h={60} label="Eventhouse" sub="KQL database" fill={C.box} />
      <Box x={480} y={20} w={140} h={54} label="Real-Time" sub="Dashboard" fill={C.box} />
      <Box x={480} y={112} w={140} h={54} label="Activator" sub="alerts / actions" fill={C.box} />
      <Arrow x1={140} y1={100} x2={170} y2={100} />
      <Arrow x1={290} y1={100} x2={320} y2={100} />
      <Arrow x1={450} y1={90} x2={480} y2={55} />
      <Arrow x1={450} y1={110} x2={480} y2={135} />
    </Frame>
  )
}

function Orchestration() {
  return (
    <Frame vb="0 0 640 200">
      <Box x={20} y={75} w={110} h={50} label="Trigger" sub="schedule / event" fill={C.boxAlt} />
      <Box x={165} y={75} w={110} h={50} label="Copy" sub="ingest raw" fill={C.box} />
      <Box x={310} y={75} w={110} h={50} label="Notebook" sub="transform" fill={C.box} />
      <Box x={455} y={75} w={140} h={50} label="Stored proc" sub="load model" fill={C.box} />
      <Arrow x1={130} y1={100} x2={165} y2={100} />
      <Arrow x1={275} y1={100} x2={310} y2={100} />
      <Arrow x1={420} y1={100} x2={455} y2={100} />
      <text x={292} y={70} textAnchor="middle" fontSize={9.5} fill="#22a06b">on success</text>
      <text x={437} y={70} textAnchor="middle" fontSize={9.5} fill="#22a06b">on success</text>
      <text x={320} y={165} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.65}>Pipeline orchestrates; ForEach + Lookup drive metadata-based loops</text>
    </Frame>
  )
}

function CICD() {
  return (
    <Frame vb="0 0 640 220">
      <Box x={30} y={30} w={580} h={34} label="Git integration (Azure DevOps / GitHub) — version control & branching" fill={C.boxAlt} />
      <Box x={60} y={100} w={140} h={64} label="Dev" sub="workspace" fill={C.box} />
      <Box x={250} y={100} w={140} h={64} label="Test" sub="workspace" fill={C.box} />
      <Box x={440} y={100} w={140} h={64} label="Prod" sub="workspace" fill={C.box} />
      <Arrow x1={200} y1={132} x2={250} y2={132} />
      <Arrow x1={390} y1={132} x2={440} y2={132} />
      <text x={225} y={122} textAnchor="middle" fontSize={9.5} fill={C.text} opacity={0.7}>deploy</text>
      <text x={415} y={122} textAnchor="middle" fontSize={9.5} fill={C.text} opacity={0.7}>deploy</text>
      <text x={320} y={200} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.65}>Deployment pipeline promotes items · deployment rules swap per-stage settings</text>
    </Frame>
  )
}

function Monitoring() {
  const items: [string, string][] = [
    ['Monitoring hub', 'runs: status · duration · errors'],
    ['Capacity Metrics', 'CU % · throttling · overload'],
    ['Refresh history', 'semantic model refresh'],
    ['Activator', 'alerts → email / Teams'],
  ]
  return (
    <Frame vb="0 0 640 240">
      <Box x={220} y={20} w={200} h={40} label="Fabric workloads" fill={C.boxAlt} />
      {items.map(([l, s], i) => (
        <g key={i}>
          <Box x={30 + i * 150} y={120} w={135} h={64} label={l} sub={s} fill={C.box} />
          <Arrow x1={320} y1={60} x2={97 + i * 150} y2={120} />
        </g>
      ))}
    </Frame>
  )
}

function SecurityLayers() {
  const rows = [
    ['1 · Workspace roles', 'Admin / Member / Contributor / Viewer'],
    ['2 · Item permissions', 'share a single item'],
    ['3 · Object security', 'GRANT / DENY on tables & procs'],
    ['4 · Row / Column security', 'RLS predicate · CLS DENY'],
    ['5 · Dynamic data masking', 'obscure values in results'],
  ]
  return (
    <Frame vb="0 0 640 300">
      {rows.map(([l, s], i) => (
        <Box key={i} x={60 + i * 22} y={20 + i * 52} w={520 - i * 44} h={44} label={l as string} sub={s as string} fill={i % 2 ? C.box : C.boxAlt} />
      ))}
    </Frame>
  )
}

function StarSchema() {
  const dims: [string, number, number][] = [
    ['dim_date', 260, 20], ['dim_customer', 40, 120], ['dim_product', 480, 120], ['dim_store', 260, 220],
  ]
  return (
    <Frame vb="0 0 640 300">
      <Box x={260} y={120} w={120} h={64} label="fact_sales" sub="measures + FKs" fill={C.accent} rx={10} />
      {dims.map(([l, x, y], i) => (
        <g key={i}>
          <Box x={x} y={y} w={120} h={50} label={l} fill={C.box} />
          <Arrow x1={x + 60} y1={y + (y < 120 ? 50 : 0)} x2={320} y2={y < 120 ? 120 : 184} />
        </g>
      ))}
      <text x={320} y={288} textAnchor="middle" fontSize={10.5} fill={C.text} opacity={0.65}>Dimensions join to the fact on surrogate keys</text>
    </Frame>
  )
}

function IncrementalLoad() {
  return (
    <Frame vb="0 0 640 220">
      <Box x={30} y={80} w={130} h={56} label="Source" sub="modified rows" fill={C.boxAlt} />
      <Box x={200} y={20} w={150} h={50} label="Control table" sub="high-watermark" fill={C.box} />
      <Box x={200} y={95} w={150} h={56} label="Read rows >" sub="last watermark" fill={C.box} />
      <Box x={400} y={95} w={130} h={56} label="MERGE" sub="upsert (idempotent)" fill={C.box} />
      <Box x={560} y={95} w={60} h={56} label="Target" fill={C.boxAlt} />
      <Arrow x1={160} y1={110} x2={200} y2={120} />
      <Arrow x1={350} y1={120} x2={400} y2={120} />
      <Arrow x1={530} y1={120} x2={560} y2={120} />
      <Arrow x1={430} y1={95} x2={300} y2={70} dashed />
      <text x={365} y={60} textAnchor="middle" fontSize={9.5} fill={C.text} opacity={0.7}>advance watermark</text>
    </Frame>
  )
}

const MAP: Record<DiagramId, () => React.JSX.Element> = {
  'fabric-arch': FabricArch,
  onelake: OneLake,
  medallion: Medallion,
  'lakehouse-vs-warehouse': LakehouseVsWarehouse,
  'ingest-options': IngestOptions,
  'rti-flow': RtiFlow,
  orchestration: Orchestration,
  cicd: CICD,
  monitoring: Monitoring,
  'security-layers': SecurityLayers,
  'star-schema': StarSchema,
  'incremental-load': IncrementalLoad,
}

export function Diagram({ id }: { id: DiagramId }) {
  const D = MAP[id]
  return (
    <div className="diagram">
      <D />
    </div>
  )
}
