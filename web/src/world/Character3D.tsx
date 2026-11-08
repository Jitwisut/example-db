import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group, MathUtils, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { useWorld } from './store'

// ตัวละคร 3D แบบ procedural ของแต่ละเรคคอร์ดในตาราง users
// รูปร่างเหมือนกันทุกคน แต่สีและของลอยข้างตัวบอกบทบาท (role) จากข้อมูลจริง

export const ROLE_COLORS: Record<string, string> = { Developer: '#47daff', Designer: '#ffca8a', Analyst: '#a99bff' }
export const roleColor = (role: unknown) => ROLE_COLORS[String(role)] ?? '#8fe3c4'

interface Props {
  role: unknown
  /** ตรงกับผล query (สว่าง) หรือไม่ (จางลง) */
  active?: boolean
  /** hover / selected / เพิ่งเปลี่ยนค่า */
  lit?: boolean
  /** ทำท่าโบกมือ */
  waving?: boolean
  /** ทำให้แต่ละตัวขยับไม่พร้อมกัน */
  seed?: number
}

export function Character3D({ role, active = true, lit = false, waving = false, seed = 0 }: Props) {
  const root = useRef<Group>(null), head = useRef<Group>(null), armL = useRef<Group>(null), armR = useRef<Group>(null)
  const halo = useRef<Mesh>(null), prop = useRef<Group>(null)
  const reduced = useWorld(s => s.reduced)
  const color = roleColor(role)

  const mats = useMemo(() => {
    const accent = new Color(color)
    const suit = new MeshPhysicalMaterial({ color: new Color('#1a2c40').lerp(accent, .32), metalness: .35, roughness: .32, clearcoat: 1, clearcoatRoughness: .18, transparent: true })
    const plate = new MeshPhysicalMaterial({ color: '#dfe9f3', metalness: .15, roughness: .28, clearcoat: 1, clearcoatRoughness: .1, transparent: true })
    const dark = new MeshStandardMaterial({ color: '#0b1520', metalness: .6, roughness: .45, transparent: true })
    const glow = new MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.6, toneMapped: false, transparent: true })
    return { suit, plate, dark, glow, all: [suit, plate, dark, glow] }
  }, [color])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, .05), t = clock.elapsedTime + seed * 1.37
    const g = root.current
    if (!g) return
    const still = reduced ? 0 : 1
    // หายใจ / ลอยขึ้นลงเบา ๆ
    g.position.y = Math.sin(t * 2.1) * .035 * still
    if (head.current) {
      head.current.rotation.y = Math.sin(t * .7) * .35 * still
      head.current.rotation.x = Math.sin(t * 1.3) * .05 * still
    }
    if (armL.current) armL.current.rotation.z = MathUtils.damp(armL.current.rotation.z, .12 + Math.sin(t * 2.1) * .05 * still, 6, dt)
    if (armR.current) {
      const wave = waving && !reduced
      armR.current.rotation.z = MathUtils.damp(armR.current.rotation.z, wave ? -2.5 + Math.sin(t * 9) * .35 : -.12 - Math.sin(t * 2.1) * .05 * still, 8, dt)
    }
    if (halo.current) { halo.current.rotation.z += dt * .9 * still; halo.current.position.y = 1.02 + Math.sin(t * 2.4) * .03 * still }
    if (prop.current) { prop.current.rotation.y += dt * 1.1 * still; prop.current.position.y = .55 + Math.sin(t * 1.8) * .08 * still }
    // สถานะ: ตรงเงื่อนไข = สว่าง, ไม่ตรง = โปร่งใส
    const opacity = active ? 1 : .22
    for (const m of mats.all) m.opacity = MathUtils.damp(m.opacity, opacity, 8, dt)
    mats.glow.emissiveIntensity = MathUtils.damp(mats.glow.emissiveIntensity, active ? lit ? 3.2 : 1.6 : .15, 8, dt)
  })

  return <group ref={root}>
    {/* ขา */}
    {[-.12, .12].map(x => <mesh key={x} position={[x, -.34, 0]} material={mats.dark}><capsuleGeometry args={[.075, .22, 6, 12]} /></mesh>)}
    {/* ลำตัว + แผ่นอก */}
    <mesh position={[0, .06, 0]} material={mats.suit}><capsuleGeometry args={[.22, .3, 8, 20]} /></mesh>
    <mesh position={[0, .12, .19]} rotation={[-.12, 0, 0]} material={mats.plate}><boxGeometry args={[.24, .2, .05]} /></mesh>
    <mesh position={[0, .12, .218]} rotation={[-.12, 0, 0]} material={mats.glow}><boxGeometry args={[.11, .025, .01]} /></mesh>
    <mesh position={[0, -.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.glow}><torusGeometry args={[.215, .014, 6, 32]} /></mesh>
    {/* ไหล่และแขน */}
    {([[-1, armL], [1, armR]] as const).map(([side, ref]) => <group key={side} ref={ref} position={[side * .27, .26, 0]}>
      <mesh material={mats.plate}><sphereGeometry args={[.09, 16, 12]} /></mesh>
      <mesh position={[side * .02, -.17, 0]} material={mats.suit}><capsuleGeometry args={[.055, .2, 6, 12]} /></mesh>
      <mesh position={[side * .03, -.33, 0]} material={mats.plate}><sphereGeometry args={[.055, 12, 10]} /></mesh>
    </group>)}
    {/* หัว: หมวกเงา + visor เรืองแสง */}
    <group ref={head} position={[0, .62, 0]}>
      <mesh position={[0, -.17, 0]} material={mats.dark}><cylinderGeometry args={[.06, .08, .08, 12]} /></mesh>
      <mesh material={mats.plate}><sphereGeometry args={[.21, 32, 24]} /></mesh>
      <mesh position={[0, .01, .1]} scale={[1, .5, .72]} material={mats.dark}><sphereGeometry args={[.19, 32, 16]} /></mesh>
      <mesh position={[0, .02, .222]} material={mats.glow}><boxGeometry args={[.2, .028, .01]} /></mesh>
      {[-1, 1].map(s => <mesh key={s} position={[s * .2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.suit}><cylinderGeometry args={[.05, .05, .05, 16]} /></mesh>)}
    </group>
    <mesh ref={halo} position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.glow}><torusGeometry args={[.13, .008, 6, 40]} /></mesh>
    {/* ของประจำบทบาท ลอยข้างตัว */}
    <group ref={prop} position={[.48, .55, .05]}>
      {String(role) === 'Developer' && <><mesh material={mats.glow}><boxGeometry args={[.13, .13, .13]} /></mesh><mesh material={mats.dark} scale={1.25}><boxGeometry args={[.13, .13, .13]} /></mesh></>}
      {String(role) === 'Designer' && <><mesh material={mats.glow}><icosahedronGeometry args={[.07, 0]} /></mesh><mesh rotation={[Math.PI / 2.4, 0, 0]} material={mats.plate}><torusGeometry args={[.12, .012, 6, 28]} /></mesh></>}
      {String(role) === 'Analyst' && [.06, .12, .09].map((h, i) => <mesh key={i} position={[(i - 1) * .055, h / 2 - .06, 0]} material={mats.glow}><boxGeometry args={[.035, h, .035]} /></mesh>)}
      {!['Developer', 'Designer', 'Analyst'].includes(String(role)) && <mesh material={mats.glow}><octahedronGeometry args={[.07, 0]} /></mesh>}
    </group>
  </group>
}
