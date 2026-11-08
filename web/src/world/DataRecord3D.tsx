import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { SceneLabel } from './SceneLabel'
import { Character3D, roleColor } from './Character3D'
import { Product3D, productColor } from './Product3D'
import { Color, Group, MathUtils, MeshStandardMaterial, Vector3 } from 'three'
import { DISTRICTS, recordPosition, type RecordRow, type Table } from './model'
import { useWorld } from './store'
export function DataRecord3D({ table, row, index, deleted = false }: { table: Table; row: RecordRow; index: number; deleted?: boolean }) {
  const group = useRef<Group>(null), material = useRef<MeshStandardMaterial>(null), velocity = useRef(new Vector3()), age = useRef(0)
  const [hover, setHover] = useState(false)
  const result = useWorld(s => s.result), revision = useWorld(s => s.revision), reduced = useWorld(s => s.reduced)
  const selected = useWorld(s => s.selected?.table === table && s.selected.id === row.id)
  const viz = result.visualization
  const target = useMemo(() => new Vector3(...recordPosition(table, index, row, viz)), [table, index, row, viz])
  const initial = useMemo(() => {
    const oldIndex = result.before[table].findIndex(r => r.id === row.id)
    return new Vector3(...recordPosition(table, oldIndex < 0 ? index : oldIndex, row, { ...viz, mode: 'select' }))
  }, [result.before, table, row, index, viz])
  const changed = viz.table === table && viz.changed.includes(row.id)
  const active = !(viz.table === table && ['select', 'where', 'order'].includes(viz.mode) && !viz.ids.includes(row.id)) && !(viz.mode === 'join' && (table === 'users' ? !viz.links.some(l => l.user === row.id) : table === 'orders' ? !viz.links.some(l => l.order === row.id) : false))
  // สีขอบฐาน: ผู้ใช้ตาม role, สินค้าตามหมวด (ชุดสีเดียวกับตัวละครและโมเดลสินค้า)
  const color = new Color(table === 'users' ? roleColor(row.role) : table === 'products' ? productColor(row.category) : DISTRICTS[table].color)
  useEffect(() => {
    age.current = 0; velocity.current.set(0, 0, 0)
    if (group.current) { group.current.position.copy(reduced ? target : initial); group.current.scale.setScalar(changed && viz.mode === 'insert' && !reduced ? .01 : 1); group.current.visible = true }
  }, [revision, initial, target, changed, viz.mode, reduced])
  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta, .04); age.current += dt
    if (reduced) g.position.copy(target)
    else {
      velocity.current.x += ((target.x - g.position.x) * 28 - velocity.current.x * 9) * dt
      velocity.current.y += ((target.y - g.position.y) * 28 - velocity.current.y * 9) * dt
      velocity.current.z += ((target.z - g.position.z) * 28 - velocity.current.z * 9) * dt
      g.position.addScaledVector(velocity.current, dt)
    }
    const scale = deleted ? reduced ? 0 : Math.max(0, 1 - Math.max(0, age.current - .4) / 1.1) : active ? hover || selected ? 1.12 : 1 : .65
    g.scale.setScalar(MathUtils.damp(g.scale.x, scale, 6, dt)); g.visible = g.scale.x > .015
    if (deleted && !reduced) { g.rotation.y += dt * 2; g.position.y += dt * .8 }
    if (material.current) {
      material.current.emissiveIntensity = MathUtils.damp(material.current.emissiveIntensity, active ? hover || selected || (changed && age.current < 1.8) ? 2.4 : .8 : .025, 7, dt)
      material.current.opacity = active ? .98 : .22
    }
  })
  const inspect = () => useWorld.getState().set({ selected: { table, id: row.id } })
  const focus = () => { const s = useWorld.getState(); s.set({ focus: { table, id: row.id }, selected: { table, id: row.id }, cameraRevision: s.cameraRevision + 1, explore: false }) }
  const old = result.before[table].find(r => r.id === row.id)
  return <group ref={group} position={initial} onClick={e => { e.stopPropagation(); if (!deleted) inspect() }} onDoubleClick={e => { e.stopPropagation(); if (!deleted) focus() }} onPointerOver={e => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }} onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
    <mesh position={[0, -.6, 0]}><cylinderGeometry args={[.78, .85, .12, 6]} /><meshStandardMaterial color="#132a37" metalness={.8} roughness={.35} /><Edges color={active ? color : '#18303c'} /></mesh>
    {table === 'users'
      ? <group position={[0, .17, 0]} scale={1.35}><Character3D role={row.role} active={active} lit={hover || selected || changed} waving={hover} seed={row.id} /></group>
      : table === 'products'
      ? <group position={[0, .2, 0]} scale={1.4}><Product3D name={row.name} category={row.category} active={active} lit={hover || selected || changed} seed={row.id} /></group>
      : <>
    {/* คำสั่งซื้อ: กล่องพัสดุเรืองแสง */}
    <mesh>
      <boxGeometry args={[1.1, .85, .7]} />
      <meshStandardMaterial ref={material} color={active ? '#163141' : '#0c1420'} emissive={color} emissiveIntensity={.8} metalness={.65} roughness={.25} transparent opacity={.98} />
      <Edges color={active ? color : '#17313a'} />
    </mesh>
    {[0, 1, 2].map(n => <mesh key={n} position={[0, -.32 + n * .28, .36]}><boxGeometry args={[.8, .035, .015]} /><meshBasicMaterial color={active ? color : '#20303d'} /></mesh>)}
      </>}
    {(active || hover) && !deleted && <SceneLabel center position={[0, table === 'users' ? 1.85 : table === 'products' ? 1.75 : 1.1, 0]} distanceFactor={table === 'orders' ? 30 : 24} zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}><div className={`record-label ${hover || selected ? 'lit' : ''}`}><span>{table === 'orders' ? `ORD-${String(row.id).padStart(3, '0')}` : String(row.name)}</span><small>{table === 'users' ? String(row.role) : table === 'orders' ? `฿${row.total}` : `฿${row.price}`}</small></div></SceneLabel>}
    {viz.mode === 'order' && viz.table === table && active && <SceneLabel center position={[0, -1, 0]} distanceFactor={30} zIndexRange={[5, 0]}><span className="spatial-value">#{viz.ids.indexOf(row.id) + 1} · {String(row.age ?? row.total ?? row.price)}</span></SceneLabel>}
    {selected && !deleted && <SceneLabel position={[1.1, 1.2, 0]} zIndexRange={[50, 40]}><section className="spatial-inspector" onPointerDown={e => e.stopPropagation()}><header><span>{table} <b>#{row.id}</b></span><button aria-label="Close record inspector" onClick={() => useWorld.getState().set({ selected: null })}>×</button></header>{Object.entries(row).map(([key, value]) => <div key={key} className={viz.fields.length && !viz.fields.includes(key) ? 'subdued' : ''}><span>{key}</span><strong>{changed && old && old[key] !== value && <del>{String(old[key])} → </del>}{String(value ?? 'NULL')}</strong></div>)}<button className="inspector-focus" onClick={focus}>Focus on record ↗</button></section></SceneLabel>}
  </group>
}
