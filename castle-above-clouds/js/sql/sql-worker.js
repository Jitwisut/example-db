/* =====================================================================
   sql-worker.js · SQLite ที่รันอยู่ใน Web Worker
   ---------------------------------------------------------------------
   ใช้ sql.js (SQLite ที่คอมไพล์เป็น WebAssembly) รันใน thread แยก
   หน้าเว็บจึงไม่ค้างแม้คำสั่ง SQL จะช้า

   worker นี้ "ไม่รู้จัก" ปราสาทเลย: หน้าเว็บส่ง SQL มา → worker รัน → ส่งแถวกลับ
   SQL ทุกคำสั่งที่เว็บใช้อยู่ใน queries.js และโฟลเดอร์ sql/

   มีฐานข้อมูล 2 ก้อนแยกกัน
     castle  เมืองลอยฟ้า (islands, buildings, residents, lanterns, routes)
     lab     ห้องทดลอง SQL injection (accounts, vault)
   ===================================================================== */

const SQLJS_URL = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/'
importScripts(SQLJS_URL + 'sql-wasm.js')

const sqlReady = initSqlJs({ locateFile: file => SQLJS_URL + file })
const databases = {}   // name → SQL.Database

const errorText = e => String(e?.message ?? e)

function getDatabase(name) {
  const db = databases[name]
  if (!db) throw new Error(`database "${name}" is not open`)
  return db
}

/* SELECT หนึ่งคำสั่ง (ใส่ค่าแทน ? ได้) → { columns, rows } */
function selectRows(db, sql, params = []) {
  const statement = db.prepare(sql)
  try {
    statement.bind(params)
    const columns = statement.getColumnNames()
    const rows = []
    while (statement.step()) rows.push(statement.get())
    return { columns, rows }
  } finally {
    statement.free()
  }
}

/* SQL ที่ผู้ใช้พิมพ์ อาจมีหลายคำสั่งคั่นด้วย ; → รันทีละคำสั่ง เก็บผลของแต่ละคำสั่ง */
function runStatements(db, sql, maxRows) {
  const results = []
  try {
    for (const statement of db.iterateStatements(sql)) {
      const columns = statement.getColumnNames()

      // INSERT / UPDATE / DELETE / CREATE … : ไม่มีแถวคืน แต่นับจำนวนแถวที่เปลี่ยน
      if (columns.length === 0) {
        statement.step()
        results.push({ sql: statement.getSQL(), columns, rows: [], changes: db.getRowsModified() })
        continue
      }

      // SELECT : อ่านแถวทั้งหมด (ตัดที่ maxRows กันหน้าเว็บค้าง)
      const rows = []
      let truncated = false
      while (statement.step()) {
        if (rows.length >= maxRows) { truncated = true; break }
        rows.push(statement.get())
      }
      results.push({ sql: statement.getSQL(), columns, rows, truncated })
    }
    return { ok: true, results }
  } catch (e) {
    return { ok: false, results, error: errorText(e) }
  }
}

/* ---------------------------------------------------------------------
   คำสั่งที่หน้าเว็บส่งมาได้ (type → ฟังก์ชัน)
   --------------------------------------------------------------------- */
const handlers = {

  /* เปิดฐานข้อมูล: จากไฟล์ .db (bytes) ถ้ามี ไม่งั้นสร้างใหม่จากสคริปต์ SQL (setupSql) */
  open({ name, bytes, setupSql }, SQL) {
    databases[name]?.close()
    delete databases[name]

    let source = 'seed', error = null
    if (bytes) {
      try {
        const db = new SQL.Database(new Uint8Array(bytes))
        db.exec('SELECT count(*) FROM sqlite_master')   // อ่านไม่ได้ = ไฟล์เสีย
        databases[name] = db
        source = 'file'
      } catch (e) {
        error = errorText(e)
        source = 'seed-fallback'
      }
    }
    if (!databases[name]) {
      databases[name] = new SQL.Database()
      databases[name].run(setupSql)
    }
    // ค่านี้ไม่ถูกเก็บในไฟล์ ต้องเปิดใหม่ทุกครั้ง
    databases[name].run('PRAGMA foreign_keys = ON;')
    return { source, error }
  },

  /* SQL ที่ผู้ใช้พิมพ์ (หลายคำสั่งได้) */
  run({ name, sql, maxRows = 400 }) {
    const started = performance.now()
    const result = runStatements(getDatabase(name), sql, maxRows)
    return { ...result, ms: performance.now() - started }
  },

  /* SELECT หนึ่งคำสั่ง พร้อมพารามิเตอร์ ? (prepared statement) */
  query({ name, sql, params }) {
    try {
      return { ok: true, ...selectRows(getDatabase(name), sql, params) }
    } catch (e) {
      return { ok: false, error: errorText(e) }
    }
  },

  /* ทั้งฐานข้อมูลเป็นไบต์ของไฟล์ SQLite (ไว้บันทึกลง castle.db) */
  export({ name }) {
    const db = getDatabase(name)
    const bytes = db.export()
    db.run('PRAGMA foreign_keys = ON;')   // export() เปิด connection ใหม่ ต้องเปิด FK อีกครั้ง
    return { bytes }
  },
}

self.onmessage = async ({ data }) => {
  const { id, type, ...args } = data
  let reply
  try {
    const SQL = await sqlReady
    if (!handlers[type]) throw new Error(`unknown message type "${type}"`)
    reply = await handlers[type](args, SQL)
  } catch (e) {
    reply = { fatal: errorText(e) }
  }
  self.postMessage({ ...reply, id })
}
