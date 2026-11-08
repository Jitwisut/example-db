import { useCallback, useEffect, useRef, useState } from 'react'
import type { RunState } from './components/ResultView'
import { TIMEOUT_MS, TimeoutError, type SqlClient } from './sql/client'
import type { TableInfo } from './sql/types'

export type Route = { page: 'home' } | { page: 'topic'; id: string } | { page: 'lab' }

function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/')
  if (parts[0] === 'topic' && parts[1]) return { page: 'topic', id: decodeURIComponent(parts[1]) }
  if (parts[0] === 'lab') return { page: 'lab' }
  return { page: 'home' }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

/** รัน SQL ผ่าน client และเก็บสถานะผลลัพธ์ล่าสุด (ไม่สนผลของการรันเก่าที่ตอบกลับช้า) */
export function useRunner(client: SqlClient) {
  const [state, setState] = useState<RunState>({ status: 'idle' })
  const latest = useRef(0)

  const run = useCallback(
    async (sql: string, fresh: boolean): Promise<TableInfo[] | null> => {
      const ticket = ++latest.current
      setState({ status: 'running' })
      try {
        const { outcome, schema } = await client.run(sql, fresh)
        if (ticket === latest.current) setState({ status: 'done', outcome, at: Date.now() })
        return schema
      } catch (err) {
        if (ticket !== latest.current) return null
        const message =
          err instanceof TimeoutError
            ? `Query ใช้เวลาเกิน ${TIMEOUT_MS / 1000} วินาทีจึงถูกหยุด และฐานข้อมูลถูกรีเซ็ตกลับเป็นข้อมูลตั้งต้น`
            : err instanceof Error
              ? err.message
              : String(err)
        setState({ status: 'failed', message, at: Date.now() })
        return null
      }
    },
    [client],
  )

  return { state, run }
}

export function readStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* โหมดส่วนตัวหรือปิด storage ไว้ ไม่เป็นไร */
  }
}
