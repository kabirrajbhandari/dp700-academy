import type { Block } from '../types'
import { Diagram } from './Diagrams'

const CALLOUT_META: Record<string, { icon: string }> = {
  tip: { icon: '💡' },
  warn: { icon: '⚠️' },
  exam: { icon: '🎯' },
  info: { icon: 'ℹ️' },
}

/** Renders one instructional block. Kept dumb & presentational. */
export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'heading':
      return <h3 className="block-heading">{block.text}</h3>

    case 'text':
      return <p className="block-text" dangerouslySetInnerHTML={{ __html: mdInline(block.body) }} />

    case 'callout': {
      const meta = CALLOUT_META[block.tone]
      return (
        <div className={`callout ${block.tone}`}>
          <div className="c-title">
            <span>{meta.icon}</span>
            {block.title}
          </div>
          <div dangerouslySetInnerHTML={{ __html: mdInline(block.body) }} />
        </div>
      )
    }

    case 'steps':
      return (
        <div>
          {block.title && <h3 className="block-heading">{block.title}</h3>}
          <div className="steps">
            {block.steps.map((s, i) => (
              <div className="step" key={i}>
                <div className="num" />
                <div>
                  <div className="s-title">{s.title}</div>
                  <div className="s-detail">{s.detail}</div>
                  {s.path && <div className="s-path">{s.path}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'code':
      return (
        <div>
          {block.caption && <div className="code-cap">{block.caption}</div>}
          <pre className="code">
            <code>{block.code}</code>
          </pre>
        </div>
      )

    case 'table':
      return (
        <table className="tbl">
          <thead>
            <tr>{block.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j} dangerouslySetInnerHTML={{ __html: mdInline(c) }} />)}</tr>
            ))}
          </tbody>
        </table>
      )

    case 'diagram':
      return (
        <div>
          <Diagram id={block.id} />
          {block.caption && <div className="fig-cap">{block.caption}</div>}
        </div>
      )

    case 'compare':
      return (
        <div>
          <h3 className="block-heading">{block.title}</h3>
          <div className="compare">
            {block.items.map((it, i) => (
              <div className="c-item" key={i}>
                <div className="c-name">{it.name}</div>
                <div className="c-use"><b>Use when:</b> {it.use}</div>
                <div className="c-avoid"><b>Avoid when:</b> {it.avoid}</div>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}

/** Tiny inline markdown: **bold** and `code`. Safe subset, no user input. */
function mdInline(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--panel-2);padding:1px 5px;border-radius:5px;font-size:0.9em">$1</code>')
}
