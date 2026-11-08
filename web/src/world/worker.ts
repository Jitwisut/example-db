/// <reference lib="webworker" />
import initSqlJs, { type Database } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { createWorldDb, executeWorld, initialWorld, runLab } from './engine'
import type { Request, Response } from './model'
const ready = initSqlJs({ locateFile: () => wasmUrl })
let db: Database | undefined
let queue = Promise.resolve()
self.onmessage = ({ data }: MessageEvent<Request>) => {
  queue = queue.then(async () => {
    const response: Response = { id: data.id }
    try {
      const SQL = await ready
      if (data.type === 'lab') response.lab = runLab(SQL, data.username, data.password, data.protected)
      else {
        if (!db || data.type === 'reset') { db?.close(); db = createWorldDb(SQL) }
        response.world = data.type === 'run' ? executeWorld(db, data.sql) : initialWorld(db)
      }
    } catch (e) { response.error = e instanceof Error ? e.message : String(e) }
    self.postMessage(response)
  })
}
