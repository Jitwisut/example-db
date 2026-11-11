/* =====================================================================
   database.js · ตัวกลางระหว่างหน้าเว็บกับ SQLite
   ---------------------------------------------------------------------
   หน้าเว็บเรียกเมธอดในไฟล์นี้เท่านั้น เช่น
     await castleDb.run("SELECT * FROM buildings WHERE roof_color = 'red'")
     await castleDb.query(INSPECT.building, [5])
     await lab.loginVulnerable("' OR 1=1 --", 'x')

   ข้างในส่งข้อความไปที่ sql-worker.js แล้วรอคำตอบ (Promise)
   ===================================================================== */
import {
  CASTLE_SETUP_FILES, TABLES, selectWholeTable,
  LAB_SETUP, LOGIN_PROTECTED, buildVulnerableLogin, LAB_SECRET_VALUES,
} from './queries.js'

const WORKER_URL = new URL('./sql-worker.js', import.meta.url)
const USER_QUERY_TIMEOUT_MS = 5000

/* ---------------------------------------------------------------------
   WorkerConnection · ส่งข้อความหา worker แล้วรอคำตอบ
   ถ้าคำสั่งค้างนานเกินกำหนด (เช่น loop ไม่จบ) จะปิด worker แล้วเริ่มใหม่
   --------------------------------------------------------------------- */
class WorkerConnection {
  constructor(url) {
    this.url = url
    this.nextId = 0
    this.waiting = new Map()   // id → { resolve, reject, timer }
    this.onRestart = null
    this.start()
  }

  start() {
    this.worker = new Worker(this.url)
    this.worker.onmessage = ({ data }) => this.receive(data)
    this.worker.onerror = e => this.failAll(new Error('SQLite worker failed to load: ' + (e.message || 'network')))
  }

  receive(reply) {
    const call = this.waiting.get(reply.id)
    if (!call) return
    clearTimeout(call.timer)
    this.waiting.delete(reply.id)
    if (reply.fatal) call.reject(new Error(reply.fatal))
    else call.resolve(reply)
  }

  failAll(error) {
    for (const call of this.waiting.values()) { clearTimeout(call.timer); call.reject(error) }
    this.waiting.clear()
  }

  restart() {
    this.worker.terminate()
    this.failAll(new Error('timeout'))
    this.start()
    this.onRestart?.()
  }

  send(type, args = {}, timeoutMs = USER_QUERY_TIMEOUT_MS) {
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.restart(), timeoutMs)
      this.waiting.set(id, { resolve, reject, timer })
      this.worker.postMessage({ type, id, ...args })
    })
  }
}

const connection = new WorkerConnection(WORKER_URL)

/* ไฟล์ .sql ในโฟลเดอร์ sql/ คือสคริปต์ที่สร้างเมืองจริง ๆ */
async function loadSqlFiles(paths) {
  const texts = await Promise.all(paths.map(async path => {
    const response = await fetch(path, { cache: 'no-store' })
    if (!response.ok) throw new Error(`cannot load ${path} (HTTP ${response.status})`)
    return response.text()
  }))
  return texts.join('\n')
}


/* =====================================================================
   castleDb · ฐานข้อมูลของเมือง
   ===================================================================== */
export const castleDb = {
  name: 'castle',

  /** ถ้าต้องเริ่ม worker ใหม่ (คำสั่งค้าง) หน้าเว็บจะได้เปิดฐานข้อมูลใหม่ */
  set onRestart(callback) { connection.onRestart = callback },

  /** เปิดจากไฟล์ castle.db (bytes) ถ้ามี ไม่งั้นสร้างจาก sql/00_schema.sql + sql/01_seed_data.sql */
  async open({ bytes = null, timeoutMs } = {}) {
    const setupSql = await loadSqlFiles(CASTLE_SETUP_FILES)
    return connection.send('open', { name: this.name, bytes, setupSql }, timeoutMs)
  },

  /** ล้างทุกอย่าง กลับไปเป็นข้อมูลตั้งต้น */
  reset() {
    return this.open()
  },

  /** SQL ที่ผู้ใช้พิมพ์ในช่อง SQL (หลายคำสั่งได้) */
  run(sql) {
    return connection.send('run', { name: this.name, sql })
  },

  /** SELECT หนึ่งคำสั่ง · params แทนที่ ? ตามลำดับ */
  query(sql, params = []) {
    return connection.send('query', { name: this.name, sql, params })
  },

  /** อ่านทุกตาราง → { islands: [{…}], buildings: [{…}], … } ไว้ให้ฉาก 3D ตามข้อมูลจริง */
  async snapshot() {
    const snapshot = {}
    for (const table of TABLES) {
      const result = await this.query(selectWholeTable(table))
      snapshot[table] = result.ok ? rowsToObjects(result) : []
    }
    return snapshot
  },

  /** ไบต์ของไฟล์ SQLite ทั้งก้อน ไว้บันทึกเป็น castle.db */
  async exportFile() {
    const { bytes } = await connection.send('export', { name: this.name })
    return bytes
  },
}


/* =====================================================================
   lab · ห้องทดลอง SQL injection (ฐานข้อมูลแยกจากเมือง)
   ===================================================================== */
export const lab = {
  name: 'lab',

  /** สร้างตาราง accounts + vault ใหม่ */
  reset() {
    return connection.send('open', { name: this.name, setupSql: LAB_SETUP })
  },

  /** VULNERABLE · ต่อสตริง: ' -- UNION ในข้อความจะกลายเป็นคำสั่ง SQL */
  async loginVulnerable(username, password) {
    const sql = buildVulnerableLogin(username, password)
    const { ok, error, results } = await connection.send('run', { name: this.name, sql, maxRows: 50 })
    const firstSelect = results.find(result => result.columns.length > 0)
    return {
      sql, ok, error,
      columns: firstSelect?.columns ?? [],
      rows: firstSelect?.rows ?? [],
      secrets: await this.secretValues(),
    }
  },

  /** PROTECTED · prepared statement: ข้อความทั้งก้อนเป็นแค่ "ข้อมูล" ไม่ถูกอ่านเป็น SQL */
  async loginProtected(username, password) {
    const result = await connection.send('query', { name: this.name, sql: LOGIN_PROTECTED, params: [username, password] })
    return { sql: LOGIN_PROTECTED, ...result, rows: result.rows ?? [], columns: result.columns ?? [], secrets: await this.secretValues() }
  },

  /** รหัสผ่าน + ข้อมูลลับทั้งหมด · ใช้แค่ระบายสีช่องที่หลุดออกมา */
  async secretValues() {
    const result = await connection.send('query', { name: this.name, sql: LAB_SECRET_VALUES })
    return result.ok ? result.rows.map(([value]) => String(value)) : []
  },
}


/* { columns: ['id','name'], rows: [[1,'Keep']] } → [{ id: 1, name: 'Keep' }] */
function rowsToObjects({ columns, rows }) {
  return rows.map(row => Object.fromEntries(columns.map((column, i) => [column, row[i]])))
}
