import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, Line } from '@react-three/drei'
import { DoubleSide, Group, MathUtils, Vector3 } from 'three'
import type { Cell } from '../sql/types'
import { Character3D } from './Character3D'
import { SceneLabel } from './SceneLabel'
import { JOIN_DISTRICT, JOIN_SLOTS, joinSlot, recordPosition, type Link, type RecordRow, type Visualization } from './model'
import { useWorld } from './store'

// เขต JOIN: ทุกแถวของผล JOIN ถูกประกอบเป็นหน่วยเดียว (ตัวละครผู้ใช้ + กล่องคำสั่งซื้อ)
// คู่ที่จับได้มาจาก query จริงใน SQLite (viz.links) ไม่ได้คำนวณเองใน JavaScript

const GREEN = JOIN_DISTRICT.color
const NULL_RED = '#ff6b81'
const ORDER_BLUE = '#749eff'

function money(v: Cell | undefined) {
  return v === null || v === undefined ? 'NULL' : `฿${Number(v).toLocaleString('en-US')}`
}

function JoinPlatform({ joined, count }: { joined: boolean; count: number }) {
  return <group position={JOIN_DISTRICT.position}>
    <mesh position={[0, -.65, 0]}><cylinderGeometry args={[6.6, 5.8, 1.1, 6]} /><meshStandardMaterial color="#0d1f24" metalness={.85} roughness={.35} /><Edges color="#24524a" /></mesh>
    <mesh position={[0, -.08, 0]}><cylinderGeometry args={[6.45, 6.45, .12, 6]} /><meshStandardMaterial color="#12302d" metalness={.7} roughness={.4} /><Edges color={GREEN} /></mesh>
    <mesh position={[0, -1.45, 0]}><cylinderGeometry args={[4.5, 1.8, 1.2, 6]} /><meshStandardMaterial color="#07161a" metalness={.8} roughness={.5} /><Edges color="#173a35" /></mesh>
    {[5.4, 5.7].map((r, i) => <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, 0]}><ringGeometry args={[r, r + .035, 96]} /><meshBasicMaterial color={i ? '#24524a' : GREEN} transparent opacity={.75} side={DoubleSide} /></mesh>)}
    {/* สัญลักษณ์ ⋈ กลางลาน ตอนยังไม่มีผล */}
    {!joined && <group position={[0, .1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[-1, 1].map(s => <mesh key={s} position={[s * .9, 0, 0]}><ringGeometry args={[.9, 1.02, 3, 1, s > 0 ? Math.PI : 0]} /><meshBasicMaterial color={GREEN} transparent opacity={.35} side={DoubleSide} /></mesh>)}
    </group>}
    <pointLight position={[0, 4, 0]} color={GREEN} intensity={joined ? 30 : 10} distance={16} />
    <SceneLabel center position={[0, .2, 6.4]} distanceFactor={42} zIndexRange={[8, 1]}>
      <button className="district-label join-label" onClick={() => { const s = useWorld.getState(); s.choose('join'); void s.run() }}>
        <i style={{ background: GREEN }} /><span>JOIN DISTRICT</span><small>{joined ? `${String(count).padStart(2, '0')} RESULT ROWS` : 'RUN A JOIN →'}</small>
      </button>
    </SceneLabel>
  </group>
}

interface UnitProps {
  link: Link; index: number; total: number; user?: RecordRow; order?: RecordRow; from: Vector3
  selected: boolean; onSelect: () => void; revision: number
}

function JoinedRecord({ link, index, total, user, order, from, selected, onSelect, revision }: UnitProps) {
  const group = useRef<Group>(null), age = useRef(0), velocity = useRef(new Vector3())
  const reduced = useWorld(s => s.reduced)
  const [hover, setHover] = useState(false)
  const target = useMemo(() => new Vector3(...joinSlot(index, total)), [index, total])
  const missing = link.order === null

  useEffect(() => {
    age.current = 0; velocity.current.set(0, 0, 0)
    if (group.current) { group.current.position.copy(reduced ? target : from); group.current.scale.setScalar(reduced ? 1 : .01) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- เริ่มแอนิเมชันใหม่เฉพาะเมื่อรัน query ใหม่
  }, [revision, reduced])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta, .04)
    age.current += dt
    if (reduced) { g.position.copy(target); g.scale.setScalar(1); return }
    if (age.current < index * .12) return // แต่ละแถวออกเดินทางไม่พร้อมกัน
    const v = velocity.current
    v.x += ((target.x - g.position.x) * 22 - v.x * 8) * dt
    v.y += ((target.y - g.position.y) * 22 - v.y * 8) * dt
    v.z += ((target.z - g.position.z) * 22 - v.z * 8) * dt
    g.position.addScaledVector(v, dt)
    g.scale.setScalar(MathUtils.damp(g.scale.x, hover || selected ? 1.08 : 1, 6, dt))
  })

  const accent = missing ? NULL_RED : GREEN
  return <group ref={group}
    onClick={e => { e.stopPropagation(); onSelect() }}
    onPointerOver={e => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
    onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
    <mesh position={[0, .02, 0]}><cylinderGeometry args={[1.45, 1.5, .08, 6]} /><meshStandardMaterial color="#0f2427" metalness={.8} roughness={.3} /><Edges color={accent} /></mesh>
    <group position={[-.62, .52, 0]} scale={.9}><Character3D role={user?.role} lit={hover || selected} waving={hover} seed={link.user + index} /></group>
    {/* สะพานเชื่อม = เงื่อนไข ON users.id = orders.user_id */}
    <mesh position={[.04, .34, 0]}><boxGeometry args={[.42, .045, .045]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} toneMapped={false} /></mesh>
    {missing
      ? <mesh position={[.66, .38, 0]}><boxGeometry args={[.78, .58, .52]} /><meshStandardMaterial color={NULL_RED} transparent opacity={.08} /><Edges color={NULL_RED} /></mesh>
      : <mesh position={[.66, .38, 0]}><boxGeometry args={[.78, .58, .52]} /><meshStandardMaterial color="#14263f" emissive={ORDER_BLUE} emissiveIntensity={.9} metalness={.6} roughness={.25} /><Edges color={ORDER_BLUE} /></mesh>}
    <SceneLabel center position={[0, 1.95, 0]} distanceFactor={30} zIndexRange={[7, 1]} style={{ pointerEvents: 'none' }}>
      <div className={`join-chip ${missing ? 'is-null' : ''} ${hover || selected ? 'lit' : ''}`}>
        <span>{String(user?.name ?? `user #${link.user}`)} <b>⋈</b> {missing ? 'NULL' : `ORD-${String(link.order).padStart(3, '0')}`}</span>
        <small>{missing ? 'ไม่มีคำสั่งซื้อที่ตรงกัน' : money(order?.total)}</small>
      </div>
    </SceneLabel>
    {selected && <SceneLabel position={[1.5, 1.4, 0]} zIndexRange={[50, 40]}>
      <button className="bridge-inspector" onClick={e => { e.stopPropagation(); onSelect() }}>
        users.id = {link.user} {missing ? '↛ ไม่มี orders.user_id ที่ตรงกัน' : `↔ orders.user_id = ${link.user}`}<br />
        {missing ? 'LEFT JOIN เก็บแถวผู้ใช้ไว้ และเติม NULL ให้คอลัมน์ของ orders' : `Order #${link.order} · ${String(user?.name)} · ${money(order?.total)}`}
        <span>Click to close</span>
      </button>
    </SceneLabel>}
  </group>
}

function Beam({ from, to, color, dashed }: { from: Vector3; to: Vector3; color: string; dashed?: boolean }) {
  const points = useMemo(() => {
    const mid = from.clone().lerp(to, .5)
    mid.y = Math.max(from.y, to.y) + 3.2
    return [from.toArray(), mid.toArray(), to.toArray()] as [number, number, number][]
  }, [from, to])
  return <Line points={points} color={color} lineWidth={1.6} transparent opacity={.75} dashed={dashed} dashSize={.35} gapSize={.25} />
}

export function JoinDistrict() {
  const result = useWorld(s => s.result), revision = useWorld(s => s.revision)
  const [selected, setSelected] = useState<number | null>(null)
  useEffect(() => setSelected(null), [revision])
  const viz: Visualization = result.visualization
  const joined = viz.mode === 'join'
  const links = useMemo(() => joined ? viz.links.slice(0, JOIN_SLOTS) : [], [joined, viz])
  const users = result.after.users, orders = result.after.orders

  const units = useMemo(() => links.map((link, i) => {
    const ui = users.findIndex(r => r.id === link.user)
    const oi = link.order === null ? -1 : orders.findIndex(r => r.id === link.order)
    const userPos = ui >= 0 ? new Vector3(...recordPosition('users', ui, users[ui], viz)) : null
    const orderPos = oi >= 0 ? new Vector3(...recordPosition('orders', oi, orders[oi], viz)) : null
    const slot = new Vector3(...joinSlot(i, links.length))
    const from = userPos && orderPos ? userPos.clone().lerp(orderPos, .5) : userPos ?? slot.clone()
    return { link, user: users[ui], order: orders[oi], userPos, orderPos, slot, from }
  }), [links, users, orders, viz])

  return <group>
    <JoinPlatform joined={joined} count={viz.links.length} />
    {units.map((u, i) => <group key={`${revision}-${i}`}>
      <JoinedRecord link={u.link} index={i} total={links.length} user={u.user} order={u.order} from={u.from} revision={revision}
        selected={selected === i} onSelect={() => setSelected(selected === i ? null : i)} />
      {u.userPos && <Beam from={u.userPos.clone().setY(u.userPos.y + 1)} to={u.slot.clone().setY(u.slot.y + 1.2)} color={u.link.order === null ? NULL_RED : '#47daff'} dashed={u.link.order === null} />}
      {u.orderPos && <Beam from={u.orderPos.clone().setY(u.orderPos.y + .6)} to={u.slot.clone().setY(u.slot.y + .7)} color={ORDER_BLUE} />}
    </group>)}
  </group>
}
