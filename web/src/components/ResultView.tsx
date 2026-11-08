import type { RunOutcome, StatementResult } from '../sql/types'
import { DataTable } from './DataTable'
import { highlightSql } from './highlight'

export type RunState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'done'; outcome: RunOutcome; at: number }
  | { status: 'failed'; message: string; at: number }

function firstLine(sql: string) {
  const line = sql
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('--'))
  return line ?? sql.trim()
}

function StatementBlock({ r, index, multi }: { r: StatementResult; index: number; multi: boolean }) {
  return (
    <section className="stmt">
      {multi && (
        <header className="stmt-head">
          <span className="stmt-index">{String(index + 1).padStart(2, '0')}</span>
          <code className="stmt-sql">{highlightSql(firstLine(r.sql))}</code>
        </header>
      )}
      {r.kind === 'rows' && (
        <>
          <DataTable columns={r.columns} rows={r.rows} />
          <p className="stmt-meta">
            {r.rows.length} แถว
            {r.truncated && ' · แสดงเฉพาะ 500 แถวแรก'}
          </p>
        </>
      )}
      {r.kind === 'changes' && (
        <p className="stmt-ok">
          <span className="dot" /> แก้ไขข้อมูล <strong>{r.changes}</strong> แถว
        </p>
      )}
      {r.kind === 'ok' && (
        <p className="stmt-ok">
          <span className="dot" /> ทำคำสั่งสำเร็จ
        </p>
      )}
    </section>
  )
}

export function ResultView({ state }: { state: RunState }) {
  if (state.status === 'idle') {
    return <div className="result-empty">กด RUN หรือ ⌘/Ctrl + Enter เพื่อรัน SQL</div>
  }
  if (state.status === 'running') {
    return (
      <div className="result-empty" role="status">
        <span className="spinner" /> กำลังรัน…
      </div>
    )
  }
  if (state.status === 'failed') {
    return (
      <div className="result-error" role="alert" key={state.at}>
        <strong>รันไม่สำเร็จ</strong>
        <p>{state.message}</p>
      </div>
    )
  }
  const { outcome } = state
  const multi = outcome.results.length + (outcome.ok ? 0 : 1) > 1
  return (
    <div className="results" key={state.at} aria-live="polite">
      {outcome.results.map((r, i) => (
        <StatementBlock key={i} r={r} index={i} multi={multi} />
      ))}
      {!outcome.ok && (
        <div className="result-error" role="alert">
          <strong>SQL Error</strong>
          <p>{outcome.error}</p>
        </div>
      )}
      {outcome.ok && outcome.results.length === 0 && <div className="result-empty">ไม่มีคำสั่งให้รัน</div>}
      <p className="run-meta">
        {outcome.results.length} คำสั่ง · {outcome.ms < 0.1 ? '< 0.1' : outcome.ms.toFixed(1)} ms · SQLite
        (WebAssembly)
      </p>
    </div>
  )
}
