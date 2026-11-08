import initSqlJs, { type SqlJsStatic, type Database } from 'sql.js'
import { beforeAll, afterEach, describe, expect, it } from 'vitest'
import { CATEGORIES } from './model'
import { createWorldDb, executeWorld, initialWorld, runLab, snapshot } from './engine'
let SQL: SqlJsStatic
const databases: Database[] = []
const fresh = () => { const db = createWorldDb(SQL); databases.push(db); return db }
beforeAll(async () => { SQL = await initSqlJs() })
afterEach(() => { databases.forEach(db => db.close()); databases.length = 0 })
describe('SQL world identity and state', () => {
  it('maps every seeded record to a unique stable ID', () => {
    const { after } = initialWorld(fresh())
    expect(Object.values(after).map(r => r.length)).toEqual([6, 8, 6])
    for (const rows of Object.values(after)) expect(new Set(rows.map(r => r.id)).size).toBe(rows.length)
  })
  for (const category of CATEGORIES.filter(c => c.id !== 'lab')) it(`${category.label} example executes with its own real visualization`, () => {
    const out = executeWorld(fresh(), category.sql)
    expect(out.visualization.mode).toBe(category.id)
    expect(out.results.length).toBe(1)
  })
  it('projects only requested fields and filters using database identities', () => {
    const out = executeWorld(fresh(), 'SELECT name, age FROM users WHERE age > 25;')
    expect(out.visualization.ids).toEqual([1, 3, 5])
    expect(out.visualization.fields).toEqual(['name', 'age'])
    expect(out.affected).toBe(3)
  })
  it('spatial order equals SQL order including ties and limit', () => {
    const out = executeWorld(fresh(), 'SELECT name FROM users ORDER BY age DESC, id ASC LIMIT 3;')
    expect(out.visualization.ids).toEqual([3, 5, 1])
    expect(out.results[0]).toMatchObject({ rows: [['Charlie'], ['Kai'], ['Alice']] })
  })
  it('INNER and LEFT JOIN preserve one-to-many and null relationships', () => {
    const db = fresh()
    const inner = executeWorld(db, 'SELECT users.name, orders.total FROM users INNER JOIN orders ON users.id = orders.user_id;')
    const left = executeWorld(db, 'SELECT users.name, orders.total FROM users LEFT JOIN orders ON users.id = orders.user_id;')
    expect(inner.visualization.links).toHaveLength(8)
    expect(inner.visualization.links.filter(l => l.user === 1)).toEqual([{ user: 1, order: 1 }, { user: 1, order: 2 }])
    expect(left.visualization.links).toHaveLength(9)
    expect(left.visualization.links).toContainEqual({ user: 6, order: null })
  })
  it('groups reflect data after a mutation and membership is exact', () => {
    const db = fresh()
    executeWorld(db, "UPDATE users SET role = 'Designer' WHERE id = 1")
    const out = executeWorld(db, 'SELECT role, COUNT(*) AS count FROM users GROUP BY role')
    expect(out.visualization.groups).toContainEqual({ label: 'Designer', count: 3, ids: [1, 2, 5] })
  })
  it('insert, update, delete persist and report actual before/after snapshots', () => {
    const db = fresh()
    const insert = executeWorld(db, "INSERT INTO users(name, age, role) VALUES ('Eve', 26, 'Developer')")
    expect(insert.affected).toBe(1); expect(insert.visualization.changed).toEqual([7])
    const update = executeWorld(db, "UPDATE users SET role = 'Designer' WHERE id = 7")
    expect(update.before.users.find(r => r.id === 7)?.role).toBe('Developer')
    expect(update.after.users.find(r => r.id === 7)?.role).toBe('Designer')
    const deletion = executeWorld(db, 'DELETE FROM users WHERE id = 1')
    expect(deletion.visualization.changed).toEqual([1])
    expect(deletion.after.orders.filter(r => r.user_id === null).map(r => r.id)).toEqual([1, 2])
    expect(snapshot(db).users.map(r => r.id)).toEqual([2, 3, 4, 5, 6, 7])
  })
  it('preserves duplicate names with separate identities', () => {
    const db = fresh(); executeWorld(db, "INSERT INTO users(name, age, role) VALUES ('Alice', 28, 'Designer')")
    const out = executeWorld(db, "SELECT name FROM users WHERE name = 'Alice'")
    expect(out.visualization.ids).toEqual([1, 7])
  })
  it('uses SQLite parsing, allowing semicolons in values and rejecting multiple statements', () => {
    const db = fresh()
    executeWorld(db, "INSERT INTO users(name, age, role) VALUES ('A; B', 22, 'Designer');")
    expect(() => executeWorld(db, 'DELETE FROM users; SELECT * FROM users')).toThrow(/หนึ่งคำสั่ง/)
    expect(snapshot(db).users).toHaveLength(7)
  })
  it('rolls back failed constraints and oversized mutations', () => {
    const db = fresh(), before = snapshot(db)
    expect(() => executeWorld(db, 'UPDATE users SET age = -2')).toThrow()
    expect(snapshot(db)).toEqual(before)
    expect(() => executeWorld(db, "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<130) INSERT INTO users(name,age,role) SELECT 'New',x,'Developer' FROM n")).toThrow(/120/)
    expect(snapshot(db)).toEqual(before)
  })
  it('returns real results without inventing unsupported mappings', () => {
    const db = fresh()
    for (const query of ['SELECT COUNT(*) FROM users', 'SELECT DISTINCT role FROM users', 'SELECT name AS person FROM users', 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)']) {
      const out = executeWorld(db, query)
      expect(out.visualization.mode).toBe('unsupported')
      expect(out.visualization.message).toBeTruthy()
      expect(out.results[0].kind).toBe('rows')
    }
  })
  it('handles an empty result and no-op mutation honestly', () => {
    const db = fresh()
    expect(executeWorld(db, 'SELECT * FROM users WHERE age > 100').visualization.ids).toEqual([])
    const out = executeWorld(db, 'DELETE FROM users WHERE id = 999')
    expect(out.affected).toBe(0); expect(out.visualization.changed).toEqual([])
  })
  it('reset constructs the original world again', () => {
    executeWorld(fresh(), 'DELETE FROM orders')
    expect(snapshot(fresh()).orders).toHaveLength(8)
  })
})
describe('isolated injection lab', () => {
  it('valid and invalid credentials are checked by SQLite in both modes', () => {
    for (const protectedMode of [false, true]) {
      expect(runLab(SQL, 'admin', 'nebula42', protectedMode)).toMatchObject({ granted: true, rows: [{ id: 1, username: 'admin', role: 'Administrator' }] })
      expect(runLab(SQL, 'admin', 'wrong', protectedMode).granted).toBe(false)
    }
  })
  it('the same payload bypasses unsafe construction but fails real binding', () => {
    expect(runLab(SQL, "' OR 1=1 --", 'anything', false).rows).toHaveLength(3)
    expect(runLab(SQL, "' OR 1=1 --", 'anything', true)).toMatchObject({ rows: [], granted: false })
  })
  it('lab attempts cannot mutate or inspect the world database', () => {
    const db = fresh(), before = snapshot(db)
    runLab(SQL, "'; DELETE FROM accounts; --", '', false)
    expect(runLab(SQL, 'admin', 'nebula42', true).granted).toBe(true)
    expect(snapshot(db)).toEqual(before)
  })
})
