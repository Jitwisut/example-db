import type { Database, SqlJsStatic } from 'sql.js'
import { runSql } from '../sql/engine'
import { emptyViz, type LabResult, type RecordRow, type Snapshot, type Table, type Visualization, type WorldResult } from './model'
const TABLES: Table[] = ['users', 'orders', 'products']
export const WORLD_SEED = `
PRAGMA foreign_keys = ON;
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, age INTEGER NOT NULL CHECK(age >= 0), role TEXT NOT NULL);
CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL CHECK(price >= 0), category TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, total REAL NOT NULL CHECK(total >= 0), status TEXT NOT NULL DEFAULT 'completed');
INSERT INTO users(name, age, role) VALUES ('Alice', 28, 'Developer'), ('Bob', 23, 'Designer'), ('Charlie', 32, 'Analyst'), ('Diana', 25, 'Developer'), ('Kai', 29, 'Designer'), ('Luna', 24, 'Analyst');
INSERT INTO products(name, price, category) VALUES ('Orbit Keyboard', 129, 'Hardware'), ('Prism Display', 349, 'Hardware'), ('Vector Studio', 79, 'Software'), ('Nova Headset', 199, 'Audio'), ('Cloud Storage', 29, 'Software'), ('Pulse Speaker', 89, 'Audio');
INSERT INTO orders(user_id, product_id, total, status) VALUES (1, 1, 129, 'completed'), (1, 3, 79, 'completed'), (2, 2, 349, 'pending'), (3, 4, 199, 'completed'), (4, 5, 29, 'pending'), (5, 6, 89, 'completed'), (3, 1, 129, 'completed'), (2, 5, 29, 'pending');
`
export function createWorldDb(SQL: SqlJsStatic) { const db = new SQL.Database(); db.run(WORLD_SEED); return db }
function records(db: Database, sql: string): RecordRow[] {
  const r = db.exec(sql)[0]
  return r ? r.values.map(values => Object.fromEntries(r.columns.map((c, i) => [c, values[i]])) as RecordRow) : []
}
export function snapshot(db: Database): Snapshot { return Object.fromEntries(TABLES.map(t => [t, records(db, `SELECT * FROM ${t} ORDER BY id LIMIT 121`)])) as Snapshot }
export function initialWorld(db: Database): WorldResult {
  const s = snapshot(db)
  return { before: s, after: s, visualization: { ...emptyViz, ids: s.users.map(r => r.id) }, results: [], ms: 0, affected: 0 }
}
const limitation = 'คำสั่งนี้รันจริงแล้ว แต่ยังไม่มีแอนิเมชันเฉพาะ — เปิด Query details เพื่อดูผลลัพธ์จริง'
function visualize(db: Database, sql: string, before: Snapshot, after: Snapshot): Visualization {
  const base: Visualization = { ...emptyViz, mode: 'unsupported', message: limitation }
  const mutation = sql.match(/^(insert\s+into|update|delete\s+from)\s+(users|orders|products)\b/i)
  if (mutation) {
    const table = mutation[2].toLowerCase() as Table
    const mode = mutation[1].toLowerCase().startsWith('insert') ? 'insert' : mutation[1].toLowerCase().startsWith('delete') ? 'delete' : 'update'
    const old = new Map(before[table].map(r => [r.id, r]))
    const current = new Map(after[table].map(r => [r.id, r]))
    const changed = mode === 'delete' ? before[table].filter(r => !current.has(r.id)).map(r => r.id) : after[table].filter(r => JSON.stringify(old.get(r.id)) !== JSON.stringify(r)).map(r => r.id)
    return { ...base, mode, table, changed, ids: changed, message: undefined }
  }
  // Deliberately narrow mappings: never infer identity from names, result order, or aliases.
  // Unsupported SQL still executes and its actual result remains available in the inspector.
  const group = sql.match(/^SELECT\s+role\s*,\s*COUNT\(\*\)(?:\s+AS\s+\w+)?\s+FROM\s+users\s+GROUP\s+BY\s+role(?:\s+ORDER\s+BY\s+role(?:\s+(?:ASC|DESC))?)?$/i)
  if (group) {
    const groups = records(db, 'SELECT role, COUNT(*) AS count FROM users GROUP BY role').map(r => ({ label: String(r.role), count: Number(r.count), ids: after.users.filter(u => u.role === r.role).map(u => u.id) }))
    return { ...base, mode: 'group', groups, ids: after.users.map(r => r.id), message: undefined }
  }
  const join = sql.match(/^SELECT\s+([\w.*,\s]+)\s+(FROM\s+users\s+(?:(?:INNER|LEFT(?:\s+OUTER)?)\s+)?JOIN\s+orders\s+ON\s+users\.id\s*=\s*orders\.user_id)$/i)
  if (join && !/\b(distinct|as)\b/i.test(join[1])) {
    const links = records(db, `SELECT users.id AS uid, orders.id AS oid ${join[2]}`).map(r => ({ user: Number(r.uid), order: r.oid === null ? null : Number(r.oid) }))
    return { ...base, mode: 'join', ids: [...new Set(links.map(l => l.user))], links, message: undefined }
  }
  const simple = sql.match(/^SELECT\s+(\*|[a-z_][\w]*(?:\s*,\s*[a-z_][\w]*)*)\s+(FROM\s+(users|orders|products))((?:\s+WHERE\s+[\s\S]+?)?(?:\s+ORDER\s+BY\s+[\w,\s]+)?(?:\s+LIMIT\s+\d+(?:\s+OFFSET\s+\d+)?)?)$/i)
  if (simple && !/\b(select|union|intersect|except|distinct|group|join|random|over|returning)\b/i.test(simple[4])) {
    const table = simple[3].toLowerCase() as Table
    const fields = simple[1] === '*' ? Object.keys(after[table][0] ?? {}) : simple[1].split(',').map(s => s.trim().toLowerCase())
    try {
      const ids = records(db, `SELECT id ${simple[2]}${simple[4]}`).map(r => r.id)
      return { ...base, table, fields, ids, mode: /\bORDER\s+BY\b/i.test(simple[4]) ? 'order' : /\bWHERE\b/i.test(simple[4]) ? 'where' : 'select', message: undefined }
    } catch { return base }
  }
  return base
}
export function executeWorld(db: Database, input: string): WorldResult {
  const sql = input.trim().replace(/;\s*$/, '')
  if (!sql) throw new Error('กรุณาใส่คำสั่ง SQL ก่อนรัน')
  // SQLite's own parser handles quotes and semicolons inside string literals.
  let count = 0
  for (const statement of db.iterateStatements(sql)) { void statement; count++ }
  if (count !== 1) throw new Error('รันครั้งละหนึ่งคำสั่ง เพื่อให้เห็นการเปลี่ยนแปลงของโลกอย่างชัดเจน')
  if (!/^(SELECT|WITH|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b/i.test(sql)) throw new Error('โลกนี้รองรับ SELECT, WITH, INSERT, UPDATE และ DELETE — ใช้ RESET WORLD เพื่อเริ่มใหม่')
  const before = snapshot(db)
  db.run('SAVEPOINT world_query')
  try {
    const out = runSql(db, sql, 500)
    if (!out.ok) throw new Error(out.error)
    const after = snapshot(db)
    if (TABLES.some(t => after[t].length > 120)) throw new Error('โลกนี้รองรับ 120 เรคคอร์ดต่อตาราง กรุณาลดจำนวนข้อมูล')
    const visualization = visualize(db, sql, before, after)
    const affected = out.results.reduce((n, r) => n + (r.kind === 'changes' ? r.changes : r.kind === 'rows' ? r.rows.length : 0), 0)
    db.run('RELEASE world_query')
    return { before, after, visualization, results: out.results, affected, ms: out.ms }
  } catch (error) { db.run('ROLLBACK TO world_query; RELEASE world_query'); throw error }
}
export function runLab(SQL: SqlJsStatic, username: string, password: string, protectedMode: boolean): LabResult {
  // A new database for every attempt: no access to the world database or real accounts.
  const db = new SQL.Database()
  db.run("CREATE TABLE accounts(id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT); INSERT INTO accounts VALUES(1,'admin','nebula42','Administrator'),(2,'visitor','orbit123','Explorer'),(3,'analyst','prism789','Analyst');")
  const sql = protectedMode ? 'SELECT id, username, role FROM accounts WHERE username = ? AND password = ?' : `SELECT id, username, role FROM accounts WHERE username = '${username}' AND password = '${password}'`
  try {
    const statement = db.prepare(sql)
    if (protectedMode) statement.bind([username, password])
    const rows: RecordRow[] = []
    while (statement.step()) rows.push(statement.getAsObject() as RecordRow)
    statement.free()
    return { sql, rows, granted: rows.length > 0, protected: protectedMode }
  } catch (e) { return { sql, rows: [], granted: false, protected: protectedMode, error: e instanceof Error ? e.message : String(e) } }
  finally { db.close() }
}
