import type { Cell, StatementResult } from '../sql/types'
export type Table = 'users' | 'orders' | 'products'
export type RecordRow = { id: number; [key: string]: Cell }
export type Snapshot = Record<Table, RecordRow[]>
export type Mode = 'select' | 'where' | 'order' | 'join' | 'group' | 'insert' | 'update' | 'delete' | 'lab'
export type Link = { user: number; order: number | null }
export interface Visualization {
  mode: Mode | 'unsupported'; table: Table; ids: number[]; fields: string[];
  links: Link[]; groups: { label: string; ids: number[]; count: number }[];
  changed: number[]; message?: string;
}
export interface WorldResult {
  before: Snapshot; after: Snapshot; visualization: Visualization;
  results: StatementResult[]; ms: number; affected: number;
}
export interface LabResult { sql: string; rows: RecordRow[]; granted: boolean; protected: boolean; error?: string }
export type Request = { id: number } & ({ type: 'run'; sql: string } | { type: 'reset' } | { type: 'lab'; username: string; password: string; protected: boolean })
export type Response = { id: number; error?: string; world?: WorldResult; lab?: LabResult }
export const emptySnapshot: Snapshot = { users: [], orders: [], products: [] }
export const emptyViz: Visualization = { mode: 'select', table: 'users', ids: [], fields: [], links: [], groups: [], changed: [] }
export const CATEGORIES: { id: Mode; label: string; title: string; description: string; sql: string; number: string }[] = [
  { id: 'select', label: 'SELECT', title: 'Make data visible.', description: 'เลือกข้อมูลที่ต้องการ แล้วสำรวจแต่ละเรคคอร์ดในโลกสามมิติ', sql: 'SELECT name, age, role\nFROM users;', number: '01' },
  { id: 'where', label: 'WHERE', title: 'Find your signal.', description: 'กรองข้อมูลด้วยเงื่อนไข — เรคคอร์ดที่ตรงกันจะส่องสว่าง', sql: 'SELECT * FROM users\nWHERE age > 25;', number: '02' },
  { id: 'order', label: 'ORDER BY', title: 'Give data an order.', description: 'จัดเรียงข้อมูลในพื้นที่สามมิติ ตามค่าที่คุณเลือก', sql: 'SELECT * FROM users\nORDER BY age DESC;', number: '03' },
  { id: 'join', label: 'JOIN', title: 'Everything is connected.', description: 'เชื่อมผู้ใช้กับคำสั่งซื้อ แล้วสำรวจความสัมพันธ์ระหว่างตาราง', sql: 'SELECT users.name, orders.total\nFROM users LEFT JOIN orders\nON users.id = orders.user_id;', number: '04' },
  { id: 'group', label: 'GROUP BY', title: 'Discover the patterns.', description: 'รวมข้อมูลที่มีคุณสมบัติเหมือนกัน ขนาดของกลุ่มคือจำนวนจริง', sql: 'SELECT role, COUNT(*) AS count\nFROM users GROUP BY role;', number: '05' },
  { id: 'insert', label: 'INSERT', title: 'Create something new.', description: 'เพิ่มเรคคอร์ดใหม่ แล้วดูโครงสร้างข้อมูลก่อตัวขึ้นในโลก', sql: "INSERT INTO users (name, age, role)\nVALUES ('Eve', 26, 'Developer');", number: '06' },
  { id: 'update', label: 'UPDATE', title: 'Change the possibilities.', description: 'เปลี่ยนค่าของข้อมูล และสังเกตการเปลี่ยนแปลงของเรคคอร์ด', sql: "UPDATE users SET role = 'Designer'\nWHERE id = 1;", number: '07' },
  { id: 'delete', label: 'DELETE', title: 'Make room for change.', description: 'ลบเรคคอร์ดจากฐานข้อมูล แล้วดูวัตถุค่อย ๆ สลายตัว', sql: 'DELETE FROM users\nWHERE id = 3;', number: '08' },
  { id: 'lab', label: 'INJECTION LAB', title: 'Beyond the barrier.', description: 'ทดลอง SQL injection ในข้อมูลสมมติ แล้วเปรียบเทียบกับ parameter binding', sql: '', number: '09' },
]
export const DISTRICTS: Record<Table, { position: [number, number, number]; color: string; code: string }> = {
  users: { position: [-7, 0, 3], color: '#47daff', code: '01' },
  orders: { position: [8, 1, -5], color: '#749eff', code: '02' },
  products: { position: [-9, 2, -14], color: '#ffca8a', code: '03' },
}
export function recordPosition(table: Table, index: number, row: RecordRow, viz: Visualization): [number, number, number] {
  const origin = DISTRICTS[table].position
  const rank = viz.ids.indexOf(row.id)
  if (viz.table === table && viz.mode === 'order' && rank >= 0) return [origin[0] - 3 + rank * 1.7, origin[1] + 1 + (viz.ids.length - rank) * .65, origin[2]]
  if (viz.table === table && viz.mode === 'group') {
    const g = viz.groups.findIndex(g => g.ids.includes(row.id))
    if (g >= 0) { const j = viz.groups[g].ids.indexOf(row.id); return [origin[0] + (g - (viz.groups.length - 1) / 2) * 4, origin[1] + 1 + j * 1.7, origin[2]] }
  }
  return [origin[0] + (index % 3 - 1) * 2.6, origin[1] + 1.3, origin[2] + (Math.floor(index / 3) - .7) * 2.7]
}
// เขต JOIN: พื้นที่แยกที่ประกอบผลลัพธ์ของ JOIN (ผู้ใช้ + คำสั่งซื้อที่จับคู่ได้) ทีละแถว
export const JOIN_DISTRICT = { position: [19, 0, 5] as [number, number, number], color: '#6ef2b0', code: '04' }
export const JOIN_SLOTS = 12
export function joinSlot(i: number, n: number): [number, number, number] {
  const cols = 3, count = Math.min(n, JOIN_SLOTS), rows = Math.ceil(count / cols)
  const c = i % cols, r = Math.floor(i / cols), [x, y, z] = JOIN_DISTRICT.position
  return [x + (c - (Math.min(count, cols) - 1) / 2) * 3.3, y + .1, z + (r - (rows - 1) / 2) * 2.5]
}

