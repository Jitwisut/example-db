import { useWorld } from './store'

/** แผงผลลัพธ์จริงของ JOIN (ตามที่ SQLite คืนมา) แสดงเป็น overlay บนจอ ไม่ลอยในฉาก จึงไม่หลุดขอบจอ */
export function JoinResultPanel() {
  const result = useWorld(s => s.result), category = useWorld(s => s.category)
  if (category !== 'join' || result.visualization.mode !== 'join') return null
  const rows = [...result.results].reverse().find(r => r.kind === 'rows')
  if (!rows || rows.kind !== 'rows') return null
  const shown = rows.rows.slice(0, 10)
  return <section className="join-panel" aria-label="JOIN result">
    <header><span><i /> JOIN RESULT</span><b>{rows.rows.length} rows · {result.ms.toFixed(1)} ms</b></header>
    <div className="join-panel-scroll"><table>
      <thead><tr>{rows.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
      <tbody>{shown.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} className={v === null ? 'null' : typeof v === 'number' ? 'num' : undefined}>{v === null ? 'NULL' : String(v)}</td>)}</tr>)}</tbody>
    </table></div>
    {rows.rows.length > shown.length && <p>+ อีก {rows.rows.length - shown.length} แถว · ดูทั้งหมดใน Query details</p>}
    <p>แถวที่เป็น NULL = ผู้ใช้ที่ไม่มีคำสั่งซื้อ (LEFT JOIN ยังเก็บไว้)</p>
  </section>
}
