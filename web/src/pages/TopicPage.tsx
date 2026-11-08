import { useEffect, useState } from 'react'
import { DataTable } from '../components/DataTable'
import { ResultView } from '../components/ResultView'
import { SqlEditor } from '../components/SqlEditor'
import { highlightSql } from '../components/highlight'
import { ALL_TOPICS, type TopicWithCategory } from '../content/topics'
import { useRunner } from '../hooks'
import { topicClient } from '../sql/client'
import type { StatementResult } from '../sql/types'

export function TopicPage({ topic }: { topic: TopicWithCategory }) {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [sql, setSql] = useState(topic.examples[0].sql)
  const { state, run } = useRunner(topicClient)

  // เปลี่ยนหัวข้อ: กลับไปตัวอย่างแรกและรันให้เห็นผลทันที
  useEffect(() => {
    setExampleIndex(0)
    setSql(topic.examples[0].sql)
    run(topic.examples[0].sql, true)
  }, [topic, run])

  const pickExample = (i: number) => {
    setExampleIndex(i)
    setSql(topic.examples[i].sql)
    run(topic.examples[i].sql, true)
  }

  const original = topic.examples[exampleIndex].sql
  const index = ALL_TOPICS.findIndex((t) => t.id === topic.id)
  const prev = ALL_TOPICS[index - 1]
  const next = ALL_TOPICS[index + 1]

  return (
    <article className={`topic accent-${topic.category.accent}`}>
      <header className="topic-head">
        <p className="eyebrow">
          <span className="cat-code">{topic.category.code}</span> {topic.category.name}
        </p>
        <h1 className="topic-keyword">{topic.keyword}</h1>
        <p className="topic-title">{topic.title}</p>
        <p className="topic-summary">{topic.summary}</p>
      </header>

      <div className="topic-grid">
        <div className="topic-explain">
          {topic.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="syntax">
            <span className="label">รูปแบบคำสั่ง</span>
            <pre>{highlightSql(topic.syntax)}</pre>
          </div>
          {topic.tips.length > 0 && (
            <ul className="tips">
              {topic.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
          {topic.tables.length > 0 && <SourceTables tables={topic.tables} />}
        </div>

        <div className="console">
          <div className="console-tabs" role="tablist" aria-label="ตัวอย่าง">
            {topic.examples.map((ex, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === exampleIndex}
                className={i === exampleIndex ? 'active' : undefined}
                onClick={() => pickExample(i)}
              >
                {ex.label}
              </button>
            ))}
          </div>
          <SqlEditor value={sql} onChange={setSql} onRun={(s) => run(s, true)} label="แก้ไข SQL ตัวอย่าง" />
          <div className="console-bar">
            <button
              className="btn btn-run"
              onClick={() => run(sql, true)}
              disabled={state.status === 'running'}
            >
              <span aria-hidden="true">▶</span> RUN
            </button>
            {sql !== original && (
              <button className="btn btn-ghost btn-sm" onClick={() => pickExample(exampleIndex)}>
                คืนค่าตัวอย่าง
              </button>
            )}
            <span className="hint">ฐานข้อมูลรีเซ็ตทุกครั้งที่รัน · ⌘/Ctrl + Enter</span>
          </div>
          <div className="console-out">
            <ResultView state={state} />
          </div>
        </div>
      </div>

      <nav className="pager" aria-label="หัวข้อก่อนหน้าและถัดไป">
        {prev ? (
          <a href={`#/topic/${prev.id}`} className="pager-prev">
            <span>← ก่อนหน้า</span>
            <strong>{prev.keyword}</strong>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={`#/topic/${next.id}`} className="pager-next">
            <span>ถัดไป →</span>
            <strong>{next.keyword}</strong>
          </a>
        ) : (
          <a href="#/lab" className="pager-next">
            <span>ถัดไป →</span>
            <strong>SQL Lab</strong>
          </a>
        )}
      </nav>
    </article>
  )
}

/** ข้อมูลในตารางก่อนรันคำสั่ง อ่านจากฐานข้อมูลตั้งต้นจริง */
function SourceTables({ tables }: { tables: string[] }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<StatementResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setData(null)
    setError(null)
  }, [tables])

  useEffect(() => {
    if (!open || data) return
    let alive = true
    topicClient
      .run(tables.map((t) => `SELECT * FROM ${t};`).join('\n'), true)
      .then(({ outcome }) => {
        if (!alive) return
        if (outcome.ok) setData(outcome.results)
        else setError(outcome.error)
      })
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [open, data, tables])

  return (
    <details className="source" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>ดูข้อมูลตั้งต้นในตาราง {tables.join(', ')}</summary>
      {error && <p className="result-error">{error}</p>}
      {open && !data && !error && <p className="muted">กำลังโหลด…</p>}
      {data?.map((r, i) =>
        r.kind === 'rows' ? <DataTable key={i} columns={r.columns} rows={r.rows} compact caption={tables[i]} /> : null,
      )}
    </details>
  )
}
