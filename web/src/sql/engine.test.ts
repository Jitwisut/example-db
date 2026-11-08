import initSqlJs, { type SqlJsStatic } from 'sql.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { ALL_TOPICS } from '../content/topics'
import { createSeededDb, readSchema, runSql } from './engine'
import type { StatementResult } from './types'

let SQL: SqlJsStatic
beforeAll(async () => {
  SQL = await initSqlJs()
})

const rowsOf = (r: StatementResult | undefined) => (r && r.kind === 'rows' ? r.rows : [])

describe('engine', () => {
  it('seeds the tables from main.py', () => {
    const schema = readSchema(createSeededDb(SQL))
    expect(schema.map((t) => [t.name, t.rowCount])).toEqual([
      ['CONTACT', 4],
      ['EMP', 5],
      ['EMPLOYEE', 5],
    ])
  })

  it('runs SELECT and WHERE', () => {
    const out = runSql(createSeededDb(SQL), 'SELECT FIRST_NAME FROM EMPLOYEE WHERE AGE < 23')
    expect(out.ok).toBe(true)
    expect(rowsOf(out.results[0])).toEqual([['Vinay']])
  })

  it('reports changed rows for UPDATE and keeps each statement result', () => {
    const out = runSql(
      createSeededDb(SQL),
      "UPDATE EMPLOYEE SET AGE = AGE + 1 WHERE SEX = 'M'; SELECT AGE FROM EMPLOYEE WHERE FIRST_NAME = 'Vinay';",
    )
    expect(out.results[0]).toMatchObject({ kind: 'changes', changes: 2 })
    expect(rowsOf(out.results[1])).toEqual([[21]])
  })

  it('INNER JOIN drops Tripthi, LEFT JOIN keeps her with NULL', () => {
    const db = createSeededDb(SQL)
    const inner = runSql(db, 'SELECT EMP.FIRST_NAME FROM EMP JOIN CONTACT ON EMP.CONTACT = CONTACT.ID')
    const left = runSql(
      db,
      'SELECT EMP.FIRST_NAME, CONTACT.CITY FROM EMP LEFT JOIN CONTACT ON EMP.CONTACT = CONTACT.ID',
    )
    expect(rowsOf(inner.results[0])).toHaveLength(4)
    expect(rowsOf(left.results[0])).toHaveLength(5)
    expect(rowsOf(left.results[0])).toContainEqual(['Tripthi', null])
  })

  it('aggregates with GROUP BY', () => {
    const out = runSql(createSeededDb(SQL), 'SELECT SEX, COUNT(*) FROM EMPLOYEE GROUP BY SEX ORDER BY SEX')
    expect(rowsOf(out.results[0])).toEqual([
      ['F', 3],
      ['M', 2],
    ])
  })

  it('returns a useful error and keeps earlier results', () => {
    const out = runSql(createSeededDb(SQL), 'SELECT 1; SELEC * FROM EMPLOYEE;')
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.error).toMatch(/syntax error/)
    expect(out.results).toHaveLength(1)
  })

  it('caps very large outputs', () => {
    const out = runSql(
      createSeededDb(SQL),
      'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n LIMIT 2000) SELECT x FROM n',
      100,
    )
    const r = out.results[0]
    expect(r.kind === 'rows' && r.rows.length).toBe(100)
    expect(r.kind === 'rows' && r.truncated).toBe(true)
  })

  it('a fresh database restores seed data after destructive statements', () => {
    const db = createSeededDb(SQL)
    runSql(db, 'DELETE FROM EMPLOYEE; DROP TABLE CONTACT;')
    expect(readSchema(db).map((t) => t.name)).toEqual(['EMP', 'EMPLOYEE'])
    expect(readSchema(createSeededDb(SQL)).find((t) => t.name === 'EMPLOYEE')?.rowCount).toBe(5)
  })
})

describe('topic content', () => {
  for (const topic of ALL_TOPICS) {
    for (const ex of topic.examples) {
      it(`${topic.id} · ${ex.label} runs without error`, () => {
        const out = runSql(createSeededDb(SQL), ex.sql)
        expect(out.ok ? '' : out.error).toBe('')
        expect(out.results.length).toBeGreaterThan(0)
      })
    }
  }

  it('facts quoted in tips are true', () => {
    const run = (sql: string) => rowsOf(runSql(createSeededDb(SQL), sql).results.at(-1))
    expect(run('SELECT DISTINCT EMAIL FROM CONTACT')).toHaveLength(2)
    expect(run('SELECT FIRST_NAME FROM EMPLOYEE ORDER BY INCOME DESC, AGE ASC').slice(-2)).toEqual([
      ['Vinay'],
      ['Tripthi'],
    ])
    expect(run("SELECT FIRST_NAME FROM EMP WHERE CONTACT IS NULL")).toEqual([['Tripthi']])
  })
})
