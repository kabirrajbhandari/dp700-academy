import { useMemo, useState } from 'react'
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryCategory } from '../data/glossary'
import { CHEATSHEETS } from '../data/cheatsheets'

type Tab = 'glossary' | 'cheatsheets'

export function ReferenceView() {
  const [tab, setTab] = useState<Tab>('glossary')
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>📚 Reference</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Your one-stop lookup: search {GLOSSARY.length} terms or scan the exam cheat sheets.
      </p>
      <div className="row" style={{ marginBottom: 16 }}>
        <button className={tab === 'glossary' ? 'btn sm' : 'btn ghost sm'} onClick={() => setTab('glossary')}>
          🔤 Glossary
        </button>
        <button className={tab === 'cheatsheets' ? 'btn sm' : 'btn ghost sm'} onClick={() => setTab('cheatsheets')}>
          🗂️ Cheat sheets
        </button>
      </div>
      {tab === 'glossary' ? <Glossary /> : <CheatSheets />}
    </div>
  )
}

function Glossary() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<GlossaryCategory | 'all'>('all')

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return GLOSSARY.filter((t) => {
      if (cat !== 'all' && t.category !== cat) return false
      if (!needle) return true
      return (
        t.term.toLowerCase().includes(needle) ||
        t.short.toLowerCase().includes(needle) ||
        (t.exam ?? '').toLowerCase().includes(needle)
      )
    }).sort((a, b) => a.term.localeCompare(b.term))
  }, [q, cat])

  return (
    <div>
      <input
        className="ref-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${GLOSSARY.length} terms… (e.g. "shortcut", "SCD", "throttling")`}
        autoFocus
      />
      <div className="ref-chips">
        <button className={`ref-chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
        {GLOSSARY_CATEGORIES.map((c) => (
          <button key={c} className={`ref-chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="muted" style={{ fontSize: 12, margin: '4px 0 12px' }}>{results.length} term{results.length === 1 ? '' : 's'}</div>
      {results.length === 0 && <div className="card muted">No matches. Try another word.</div>}
      <div className="grid grid-2">
        {results.map((t) => (
          <div className="card" key={t.term} style={{ marginBottom: 0 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{t.term}</span>
              <span className="chip">{t.category}</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{t.short}</div>
            {t.exam && (
              <div className="ref-exam">🎯 {t.exam}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CheatSheets() {
  const [open, setOpen] = useState<string>(CHEATSHEETS[0].id)
  return (
    <div>
      <div className="ref-chips" style={{ marginBottom: 14 }}>
        {CHEATSHEETS.map((cs) => (
          <button key={cs.id} className={`ref-chip ${open === cs.id ? 'on' : ''}`} onClick={() => setOpen(cs.id)}>
            {cs.icon} {cs.title.split(' —')[0]}
          </button>
        ))}
      </div>
      {CHEATSHEETS.filter((cs) => cs.id === open).map((cs) => (
        <div key={cs.id}>
          <h3 className="block-heading" style={{ marginTop: 0 }}>{cs.icon} {cs.title}</h3>
          <p className="muted" style={{ fontSize: 13, marginTop: -4 }}>{cs.blurb}</p>
          {cs.blocks.map((b, i) =>
            b.kind === 'table' ? (
              <table className="tbl" key={i}>
                <thead><tr>{b.headers.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                <tbody>
                  {b.rows.map((r, ri) => (
                    <tr key={ri}>{r.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div key={i}>
                <div className="code-cap">{b.label}</div>
                <pre className="code"><code>{b.code}</code></pre>
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  )
}
