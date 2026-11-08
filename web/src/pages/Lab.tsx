import { useCallback, useEffect, useState } from 'react'
import { ResultView } from '../components/ResultView'
import { SqlEditor } from '../components/SqlEditor'
import { readStorage, useRunner, writeStorage } from '../hooks'
import { labClient } from '../sql/client'
import type { TableInfo } from '../sql/types'

const SQL_KEY = 'sqldim.lab.sql'
const HISTORY_KEY = 'sqldim.lab.history'

const STARTER = `-- SQL Lab: ลองแก้ แล้วกด RUN
-- เลือกข้อความบางส่วนแล้วกด ⌘/Ctrl + Enter เพื่อรันเฉพาะส่วนที่เลือก
SELECT FIRST_NAME, AGE, INCOME
FROM EMPLOYEE
WHERE INCOME > 7000
ORDER BY INCOME DESC;`

const SNIPPETS: { label: string; sql: string }[] = [
  { label: 'ทุกแถว', sql: 'SELECT * FROM EMPLOYEE;' },
  { label: 'JOIN', sql: 'SELECT e.FIRST_NAME, c.EMAIL, c.CITY\nFROM EMP e\nLEFT JOIN CONTACT c ON e.CONTACT = c.ID;' },
  { label: 'GROUP BY', sql: 'SELECT SEX, COUNT(*) AS TOTAL, AVG(INCOME) AS AVG_INCOME\nFROM EMPLOYEE\nGROUP BY SEX;' },
  {
    label: 'สร้างตาราง',
    sql: "CREATE TABLE TODO(\n  ID INTEGER PRIMARY KEY,\n  TASK TEXT NOT NULL,\n  DONE INT DEFAULT 0\n);\nINSERT INTO TODO(TASK) VALUES ('เรียน SQL'), ('ลอง JOIN');\nSELECT * FROM TODO;",
  },
  { label: 'UPDATE', sql: "UPDATE EMPLOYEE SET INCOME = INCOME + 500 WHERE SEX = 'F';\nSELECT FIRST_NAME, INCOME FROM EMPLOYEE;" },
  {
    label: 'Subquery',
    sql: 'SELECT FIRST_NAME, INCOME\nFROM EMPLOYEE\nWHERE INCOME > (SELECT AVG(INCOME) FROM EMPLOYEE);',
  },
]

function loadHistory(): string[] {
  try {
    const parsed = JSON.parse(readStorage(HISTORY_KEY, '[]'))
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

export function Lab() {
  const [sql, setSqlState] = useState(() => readStorage(SQL_KEY, STARTER))
  const [schema, setSchema] = useState<TableInfo[]>([])
  const [history, setHistory] = useState<string[]>(loadHistory)
  const [notice, setNotice] = useState<string | null>(null)
  const { state, run } = useRunner(labClient)

  const setSql = (v: string) => {
    setSqlState(v)
    writeStorage(SQL_KEY, v)
  }

  useEffect(() => {
    labClient.schema().then(setSchema).catch(() => setSchema([]))
  }, [])

  const execute = useCallback(
    async (text: string) => {
      if (!text.trim()) return
      setNotice(null)
      const nextHistory = [text.trim(), ...history.filter((h) => h !== text.trim())].slice(0, 12)
      setHistory(nextHistory)
      writeStorage(HISTORY_KEY, JSON.stringify(nextHistory))
      const s = await run(text, false)
      // ถ้า worker ถูกรีสตาร์ตเพราะหมดเวลา ให้โหลดโครงสร้างใหม่
      setSchema(s ?? (await labClient.schema().catch(() => [])))
    },
    [history, run],
  )

  const reset = async () => {
    setSchema(await labClient.reset())
    setNotice('รีเซ็ตฐานข้อมูลแล้ว ข้อมูลกลับเป็นชุดตั้งต้นจาก main.py')
  }

  return (
    <div className="lab">
      <header className="lab-head">
        <div>
          <p className="eyebrow">
            <span className="cat-code">LAB</span> ห้องทดลอง
          </p>
          <h1>SQL Lab</h1>
        </div>
        <p className="lab-note">
          ฐานข้อมูล SQLite ในเบราว์เซอร์ของคุณ การเปลี่ยนแปลงอยู่จนกว่าจะกดรีเซ็ตหรือรีเฟรชหน้า
          ไม่มีข้อมูลส่งออกไปที่ไหน
        </p>
      </header>

      <div className="lab-grid">
        <aside className="schema" aria-label="โครงสร้างฐานข้อมูล">
          <div className="schema-head">
            <h2>Tables</h2>
            <button className="btn btn-ghost btn-sm" onClick={reset}>
              ↺ รีเซ็ต DB
            </button>
          </div>
          {schema.length === 0 && <p className="muted">ไม่มีตาราง</p>}
          {schema.map((t) => (
            <details key={t.name} className="schema-table" open>
              <summary>
                <span>{t.name}</span>
                <span className="muted">{t.rowCount} แถว</span>
              </summary>
              <ul>
                {t.columns.map((c) => (
                  <li key={c.name}>
                    <code>{c.name}</code>
                    <span className="col-type">
                      {c.type || 'ANY'}
                      {c.pk && ' · PK'}
                      {c.notNull && ' · NOT NULL'}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className="btn btn-ghost btn-sm schema-peek"
                onClick={() => {
                  const q = `SELECT * FROM ${t.name} LIMIT 50;`
                  setSql(q)
                  execute(q)
                }}
              >
                ดูข้อมูล
              </button>
            </details>
          ))}
        </aside>

        <section className="lab-main">
          <div className="snippets" aria-label="ตัวอย่างคำสั่ง">
            {SNIPPETS.map((s) => (
              <button key={s.label} className="chip" onClick={() => setSql(s.sql)}>
                {s.label}
              </button>
            ))}
          </div>
          <SqlEditor value={sql} onChange={setSql} onRun={execute} label="เขียน SQL" minRows={8} />
          <div className="console-bar">
            <button className="btn btn-run" onClick={() => execute(sql)} disabled={state.status === 'running'}>
              <span aria-hidden="true">▶</span> RUN
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSql('')}>
              ล้าง
            </button>
            <span className="hint">⌘/Ctrl + Enter · Tab เว้นวรรค 2 ช่อง</span>
          </div>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          <div className="console-out">
            <ResultView state={state} />
          </div>
          {history.length > 0 && (
            <details className="history">
              <summary>ประวัติคำสั่ง ({history.length})</summary>
              <ul>
                {history.map((h, i) => (
                  <li key={i}>
                    <button onClick={() => setSql(h)} title="นำกลับมาแก้ไข">
                      <code>{h}</code>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>
    </div>
  )
}
