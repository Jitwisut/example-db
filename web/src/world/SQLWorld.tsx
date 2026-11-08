import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, Edges, Line, PerformanceMonitor, Sparkles, Stars } from '@react-three/drei'
import { SceneLabel } from './SceneLabel'
import { JoinDistrict } from './JoinDistrict'
import { Color, DoubleSide, Group, InstancedMesh, MathUtils, Mesh, Object3D } from 'three'
import { WorldCamera } from './WorldCamera'
import { DataRecord3D } from './DataRecord3D'
import { DISTRICTS, JOIN_DISTRICT, type Table } from './model'
import { useWorld } from './store'
function Ring({ radius, color, y = 0 }: { radius: number; color: string; y?: number }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}><ringGeometry args={[radius, radius + .035, 96]} /><meshBasicMaterial color={color} transparent opacity={.7} side={DoubleSide} /></mesh>
}
function Platform({ table }: { table: Table }) {
  const district = DISTRICTS[table], rows = useWorld(s => s.result.after[table])
  return <group position={district.position}>
    <mesh position={[0, -.65, 0]}><cylinderGeometry args={[6.5, 5.7, 1.1, 6]} /><meshStandardMaterial color="#0d1d2e" metalness={.85} roughness={.35} /><Edges color="#254653" /></mesh>
    <mesh position={[0, -.08, 0]}><cylinderGeometry args={[6.35, 6.35, .12, 6]} /><meshStandardMaterial color="#142b3b" metalness={.7} roughness={.4} /><Edges color={district.color} /></mesh>
    <mesh position={[0, -1.45, 0]}><cylinderGeometry args={[4.5, 1.8, 1.2, 6]} /><meshStandardMaterial color="#07121f" metalness={.8} roughness={.5} /><Edges color="#183140" /></mesh>
    <Ring radius={5.3} color={district.color} y={.02} />
    <Ring radius={5.55} color="#284354" y={.02} />
    {Array.from({ length: 6 }, (_, i) => { const angle = i * Math.PI / 3; return <group key={i} position={[Math.cos(angle) * 5.5, .05, Math.sin(angle) * 5.5]} rotation={[0, -angle, 0]}><mesh><boxGeometry args={[.3, .1, .8]} /><meshBasicMaterial color={district.color} /></mesh><mesh position={[0, -.65, 0]}><boxGeometry args={[.4, 1.2, .9]} /><meshStandardMaterial color="#0b1726" /></mesh></group> })}
    <SceneLabel center position={[0, .2, 5.3]} distanceFactor={42} zIndexRange={[8, 1]}><button className="district-label" onClick={() => { const s = useWorld.getState(); s.set({ entered: true, sql: `SELECT * FROM ${table};` }); void s.run() }}><i style={{ background: district.color }} /><span>{table.toUpperCase()} DISTRICT</span><small>{String(rows.length).padStart(2, '0')} RECORDS</small></button></SceneLabel>
  </group>
}
function DatabaseCore() {
  const rotor = useRef<Group>(null), reduced = useWorld(s => s.reduced)
  useFrame((_, dt) => { if (rotor.current && !reduced) rotor.current.rotation.y += dt * .08 })
  return <group position={[0, 0, -11]}>
    <mesh position={[0, -.3, 0]}><cylinderGeometry args={[4.3, 5, .8, 12]} /><meshStandardMaterial color="#122637" metalness={.8} roughness={.3} /><Edges color="#34576b" /></mesh>
    <mesh position={[0, 4, 0]}><cylinderGeometry args={[1.1, 1.1, 8, 8]} /><meshStandardMaterial color="#163644" emissive="#21c7ff" emissiveIntensity={.5} metalness={.7} roughness={.2} /><Edges color="#47daff" /></mesh>
    {Array.from({ length: 7 }, (_, i) => <group key={i} position={[0, .5 + i * 1.1, 0]}><mesh><cylinderGeometry args={[2.6, 2.8, .55, 12]} /><meshStandardMaterial color="#142a3b" metalness={.85} roughness={.3} /><Edges color="#3b758a" /></mesh><Ring radius={2.64} color="#47daff" y={.28} /></group>)}
    <group ref={rotor} position={[0, 4, 0]} rotation={[.2, 0, .2]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[4.1, .035, 6, 100]} /><meshBasicMaterial color="#62dfff" /></mesh><mesh rotation={[Math.PI / 2, .7, 0]}><torusGeometry args={[4.5, .02, 6, 100]} /><meshBasicMaterial color="#265875" /></mesh></group>
    <mesh position={[0, 9.5, 0]}><cylinderGeometry args={[.025, .1, 5, 6]} /><meshBasicMaterial color="#9dedff" /></mesh>
    <pointLight position={[0, 4, 0]} color="#47daff" intensity={45} distance={22} />
    <SceneLabel center position={[0, 10, 0]} distanceFactor={45} zIndexRange={[4, 0]}><div className="core-tag">RELATIONAL CORE<span>SQLITE ENGINE / ONLINE</span></div></SceneLabel>
  </group>
}
function Infrastructure() {
  const mesh = useRef<InstancedMesh>(null)
  useEffect(() => {
    if (!mesh.current) return
    const object = new Object3D()
    for (let i = 0; i < 55; i++) {
      const angle = i * 2.39996, radius = 28 + (i % 6) * 4
      object.position.set(Math.cos(angle) * radius, -5 + (i % 5) * 1.2, Math.sin(angle) * radius - 15)
      object.scale.set(1.5 + i % 3, 3 + i % 7 * 1.8, 1.5 + i % 2)
      // ไม่วางตึกบังห้องทดลอง Injection Lab และมุมกล้องที่มองเข้าไป
      const lx = object.position.x - 28, lz = object.position.z + 24
      if (Math.hypot(lx, lz) < 13 || (lx > 0 && lz > 0 && Math.hypot(lx, lz) < 30)) object.scale.set(0, 0, 0)
      if (Math.hypot(object.position.x - JOIN_DISTRICT.position[0], object.position.z - JOIN_DISTRICT.position[2]) < 12) object.scale.set(0, 0, 0)
      object.rotation.y = angle; object.updateMatrix(); mesh.current.setMatrixAt(i, object.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [])
  return <group>
    <instancedMesh ref={mesh} args={[undefined, undefined, 55]}><boxGeometry /><meshStandardMaterial color="#102336" metalness={.5} roughness={.7} /></instancedMesh>
    <gridHelper args={[160, 80, '#13364a', '#0c1b2b']} position={[0, -4.4, 0]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]}><planeGeometry args={[240, 240]} /><meshStandardMaterial color="#050c16" roughness={.7} metalness={.6} /></mesh>
    {[[[-7, -.3, 3], [-4, -.3, -3], [0, -.3, -11]], [[8, .7, -5], [5, .7, -10], [0, -.3, -11]], [[-9, 1.7, -14], [-4, 1.7, -15], [0, -.3, -11]], [[-1, -.3, 3], [8, -.3, 8], [13, -.3, 5]], [[14, .7, -5], [17, -.3, -2], [19, -.3, -1]]].map((points, i) => <group key={i}><Line points={points as [number, number, number][]} color="#142c3a" lineWidth={18} /><Line points={points as [number, number, number][]} color={i === 2 ? '#b18b62' : i > 2 ? '#3fae8f' : '#2a9bb9'} lineWidth={1.3} /></group>)}
  </group>
}
function Scanner() {
  const ref = useRef<Mesh>(null), age = useRef(0)
  const revision = useWorld(s => s.revision), viz = useWorld(s => s.result.visualization), reduced = useWorld(s => s.reduced)
  useEffect(() => { age.current = 0 }, [revision])
  useFrame((_, dt) => { if (!ref.current) return; age.current += dt; ref.current.visible = !reduced && revision > 1 && age.current < 2.2 && ['select','where'].includes(viz.mode); ref.current.position.z = -7 + age.current * 7 })
  return <group position={DISTRICTS[viz.table].position}><mesh ref={ref} rotation={[0, 0, 0]}><planeGeometry args={[12, 6]} /><meshBasicMaterial color="#47daff" transparent opacity={.1} side={DoubleSide} depthWrite={false} /></mesh></group>
}
function GroupLabels() {
  const viz = useWorld(s => s.result.visualization)
  if (viz.mode !== 'group') return null
  return <group>{viz.groups.map((g, i) => <SceneLabel key={g.label} center position={[-7 + (i - (viz.groups.length - 1) / 2) * 4, 2.7 + g.count * 1.7, 3]} zIndexRange={[7, 1]}><div className="group-label"><strong>{g.count}</strong><span>{g.label}</span></div></SceneLabel>)}</group>
}
function InjectionChamber() {
  const lab = useWorld(s => s.lab), category = useWorld(s => s.category), reduced = useWorld(s => s.reduced)
  const barrier = useRef<Group>(null)
  useFrame((_, dt) => { if (barrier.current) barrier.current.position.y = MathUtils.damp(barrier.current.position.y, lab?.granted ? 8 : 0, reduced ? 1000 : 3, dt) })
  const color = lab?.granted ? '#ffca8a' : '#ff465c'
  return <group position={[28, 0, -24]}>
    <mesh position={[0, -.5, 0]}><cylinderGeometry args={[8, 7, 1, 8]} /><meshStandardMaterial color="#1d1623" metalness={.7} roughness={.4} /><Edges color="#6f293e" /></mesh>
    <Ring radius={6.5} color={color} y={.03} />
    {[-6, 6].map(x => <group key={x} position={[x, 3.5, -3]}><mesh><boxGeometry args={[1.2, 7, 1.3]} /><meshStandardMaterial color="#2b202e" metalness={.8} roughness={.3} /><Edges color={color} /></mesh><mesh position={[0, 0, .7]}><boxGeometry args={[.06, 6, .02]} /><meshBasicMaterial color={color} /></mesh></group>)}
    <mesh position={[0, 7.2, -3]}><boxGeometry args={[13, .7, 1.3]} /><meshStandardMaterial color="#302033" /><Edges color={color} /></mesh>
    <group ref={barrier}>{Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-5 + i * 1.25, 3, 1.4]}><boxGeometry args={[.035, 6, .035]} /><meshBasicMaterial color={color} transparent opacity={.65} /></mesh>)}</group>
    <mesh position={[0, 1.5, -1]}><boxGeometry args={[3.5, 2.5, 1.2]} /><meshStandardMaterial color="#231b2b" emissive={color} emissiveIntensity={.12} metalness={.6} roughness={.3} /><Edges color={color} /></mesh>
    <SceneLabel center position={[0, 4.5, -2]} zIndexRange={[6, 0]}><div className="chamber-sign">{lab ? lab.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED' : 'AUTHENTICATION CORE'}<span>ISOLATED SECURITY SECTOR</span></div></SceneLabel>
    {lab?.rows.map((r, i) => <group key={r.id} position={[-3 + i * 2.7, 1.4, -5]}><mesh><boxGeometry args={[.8, 1.4, .8]} /><meshStandardMaterial color="#3a1d2c" emissive={color} emissiveIntensity={.5} /><Edges color={color} /></mesh><SceneLabel center position={[0, 1.2, 0]}><div className="record-label">{r.username}<small>{r.role}</small></div></SceneLabel></group>)}
    <pointLight color={color} intensity={category === 'lab' ? 100 : 20} distance={28} position={[0, 5, 0]} />
  </group>
}
function Scene() {
  const result = useWorld(s => s.result), reduced = useWorld(s => s.reduced), category = useWorld(s => s.category)
  const fogColor = useMemo(() => new Color(category === 'lab' ? '#100810' : '#050b15'), [category])
  return <>
    <color attach="background" args={[fogColor]} /><fog attach="fog" args={[fogColor, 38, 110]} />
    <ambientLight intensity={.85} color="#9ab7d1" /><hemisphereLight args={['#8ac1e2', '#080c18', 1.1]} />
    <directionalLight position={[5, 20, 10]} intensity={2.5} color="#c4eaff" /><directionalLight position={[-15, 5, -10]} intensity={2} color="#1e609b" />
    <Stars radius={95} depth={50} count={1100} factor={2} saturation={0} fade speed={reduced ? 0 : .12} />
    {!reduced && <Sparkles count={90} scale={[60, 20, 60]} position={[0, 2, -10]} size={1.5} speed={.15} color="#7ba0bc" opacity={.4} />}
    <Infrastructure /><DatabaseCore />
    {(['users', 'orders', 'products'] as Table[]).map(table => <group key={table}><Platform table={table} />{result.after[table].map((row, index) => <DataRecord3D key={row.id} table={table} row={row} index={index} />)}{result.before[table].filter(r => !result.after[table].some(a => a.id === r.id)).map(row => <DataRecord3D key={`deleted-${row.id}`} table={table} row={row} index={result.before[table].indexOf(row)} deleted />)}</group>)}
    <Scanner /><JoinDistrict /><GroupLabels /><InjectionChamber /><WorldCamera /><AdaptiveDpr pixelated />
  </>
}
class WorldBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <Fallback /> : this.props.children }
}
function Fallback() { return <div className="webgl-fallback"><strong>3D rendering is unavailable</strong><p>เบราว์เซอร์นี้เปิด WebGL ไม่ได้ คุณยังรัน SQL และดูข้อมูลจริงผ่าน Query details ได้</p><button onClick={() => useWorld.getState().set({ entered: true, details: true })}>Open data inspector</button></div> }
export default function SQLWorld() {
  const [dpr, setDpr] = useState(1.5), [visible, setVisible] = useState(!document.hidden)
  useEffect(() => { const change = () => setVisible(!document.hidden); document.addEventListener('visibilitychange', change); return () => document.removeEventListener('visibilitychange', change) }, [])
  return <WorldBoundary><Canvas className="world-canvas" camera={{ position: [34, 28, 45], fov: 43, near: .1, far: 220 }} dpr={[1, dpr]} frameloop={visible ? 'always' : 'never'} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} fallback={<Fallback />} onPointerMissed={() => useWorld.getState().set({ selected: null })}><Suspense fallback={null}><PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)}><Scene /></PerformanceMonitor></Suspense></Canvas></WorldBoundary>
}
