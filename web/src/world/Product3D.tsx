import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group, MathUtils, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { useWorld } from './store'

// สินค้า 3D แบบ procedural: เลือกรูปทรงจากชื่อสินค้า (keyboard, display, headset ...) ถ้าไม่รู้จักใช้หมวด (category)
// สีของตัวเครื่องเป็นวัสดุจริง (อะลูมิเนียม กราไฟต์ กระจก) ส่วนสีเน้นเรืองแสงบอกหมวดสินค้า
// โทนอุ่นทั้งชุด ให้เขตสินค้าแยกจากผู้ใช้ (ฟ้า) คำสั่งซื้อ (น้ำเงิน) และ JOIN (เขียว) ได้ชัด

export const CATEGORY_COLORS: Record<string, string> = { Hardware: '#ff9a4d', Audio: '#ff6b9d', Software: '#f7d774' }
export const productColor = (category: unknown) => CATEGORY_COLORS[String(category)] ?? '#ffc58a'

type Kind = 'keyboard' | 'display' | 'headset' | 'speaker' | 'software' | 'cloud' | 'device' | 'gem'

export function productKind(name: unknown, category: unknown): Kind {
  const n = String(name ?? '').toLowerCase()
  if (/keyboard|keypad/.test(n)) return 'keyboard'
  if (/display|monitor|screen|tv/.test(n)) return 'display'
  if (/headset|headphone|earphone|buds/.test(n)) return 'headset'
  if (/speaker|soundbar/.test(n)) return 'speaker'
  if (/cloud|storage|drive|backup/.test(n)) return 'cloud'
  if (/studio|suite|app|software|license/.test(n)) return 'software'
  const c = String(category ?? '')
  return c === 'Hardware' ? 'device' : c === 'Audio' ? 'speaker' : c === 'Software' ? 'software' : 'gem'
}

interface Props { name: unknown; category: unknown; active?: boolean; lit?: boolean; seed?: number }

export function Product3D({ name, category, active = true, lit = false, seed = 0 }: Props) {
  const root = useRef<Group>(null), spin = useRef<Group>(null)
  const reduced = useWorld(s => s.reduced)
  const accent = productColor(category)
  const kind = productKind(name, category)

  const m = useMemo(() => {
    const a = new Color(accent)
    const alu = new MeshPhysicalMaterial({ color: '#c6ced8', metalness: .9, roughness: .26, clearcoat: .5, clearcoatRoughness: .2, transparent: true })
    const graphite = new MeshPhysicalMaterial({ color: '#20262f', metalness: .55, roughness: .38, clearcoat: .6, clearcoatRoughness: .3, transparent: true })
    const soft = new MeshStandardMaterial({ color: '#2b313b', metalness: .05, roughness: .9, transparent: true })
    const glass = new MeshPhysicalMaterial({ color: '#0a1220', emissive: a, emissiveIntensity: .22, metalness: .1, roughness: .06, clearcoat: 1, transparent: true })
    const cloud = new MeshPhysicalMaterial({ color: '#f2f6fb', emissive: a, emissiveIntensity: .12, roughness: .35, clearcoat: 1, transparent: true })
    const glow = new MeshStandardMaterial({ color: a, emissive: a, emissiveIntensity: 1.8, toneMapped: false, transparent: true })
    return { alu, graphite, soft, glass, cloud, glow, all: [alu, graphite, soft, glass, cloud, glow] }
  }, [accent])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, .05), t = clock.elapsedTime + seed * 1.71, still = reduced ? 0 : 1
    if (root.current) root.current.position.y = Math.sin(t * 1.6) * .05 * still
    if (spin.current) spin.current.rotation.y += dt * .45 * still
    const opacity = active ? 1 : .22
    for (const mat of m.all) mat.opacity = MathUtils.damp(mat.opacity, opacity, 8, dt)
    m.glow.emissiveIntensity = MathUtils.damp(m.glow.emissiveIntensity, active ? lit ? 3.4 : 1.8 : .15, 8, dt)
    m.glass.emissiveIntensity = MathUtils.damp(m.glass.emissiveIntensity, active ? lit ? .5 : .22 : .02, 8, dt)
  })

  return <group ref={root}>
    {kind === 'keyboard' && <group position={[0, -.18, 0]} rotation={[-.35, -.15, 0]}>
      <mesh material={m.alu}><boxGeometry args={[1.4, .09, .56]} /></mesh>
      {Array.from({ length: 3 }, (_, r) => Array.from({ length: 9 }, (_, c) =>
        <mesh key={`${r}-${c}`} position={[-.56 + c * .14, .065, -.15 + r * .15]} material={r === 1 && c === 4 ? m.glow : m.graphite}><boxGeometry args={[.11, .05, .11]} /></mesh>))}
      <mesh position={[0, .065, .25]} material={m.graphite}><boxGeometry args={[.7, .05, .07]} /></mesh>
      <mesh position={[0, -.05, .29]} material={m.glow}><boxGeometry args={[1.32, .015, .015]} /></mesh>
    </group>}

    {kind === 'display' && <group position={[0, -.1, 0]} rotation={[0, -.2, 0]}>
      <mesh position={[0, -.38, 0]} material={m.alu}><cylinderGeometry args={[.3, .34, .04, 32]} /></mesh>
      <mesh position={[0, -.14, -.06]} rotation={[-.12, 0, 0]} material={m.alu}><boxGeometry args={[.1, .48, .05]} /></mesh>
      <mesh position={[0, .3, 0]} material={m.graphite}><boxGeometry args={[1.45, .86, .06]} /></mesh>
      <mesh position={[0, .31, .032]} material={m.glass}><planeGeometry args={[1.36, .76]} /></mesh>
      {[.18, .02, -.14].map((y, i) => <mesh key={y} position={[-.28 + i * .08, .31 + y, .035]} material={m.glow}><planeGeometry args={[.62 - i * .16, .045]} /></mesh>)}
      <mesh position={[.45, .2, .035]} material={m.glow}><circleGeometry args={[.11, 32]} /></mesh>
    </group>}

    {kind === 'headset' && <group ref={spin} position={[0, -.05, 0]}>
      <mesh position={[0, .08, 0]} material={m.alu}><torusGeometry args={[.42, .045, 12, 48, Math.PI]} /></mesh>
      <mesh position={[0, .08, 0]} material={m.soft}><torusGeometry args={[.4, .03, 8, 48, Math.PI]} /></mesh>
      {[-1, 1].map(s => <group key={s} position={[s * .42, -.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={m.graphite}><cylinderGeometry args={[.22, .22, .14, 32]} /></mesh>
        <mesh position={[0, s * -.09, 0]} material={m.soft}><cylinderGeometry args={[.19, .19, .06, 32]} /></mesh>
        <mesh position={[0, s * .075, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}><torusGeometry args={[.15, .014, 8, 40]} /></mesh>
      </group>)}
    </group>}

    {kind === 'speaker' && <group position={[0, -.08, 0]}>
      <mesh material={m.soft}><cylinderGeometry args={[.36, .38, .8, 40]} /></mesh>
      <mesh position={[0, .41, 0]} material={m.alu}><cylinderGeometry args={[.36, .36, .04, 40]} /></mesh>
      <mesh position={[0, .434, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.glow}><ringGeometry args={[.2, .24, 40]} /></mesh>
      <mesh position={[0, .434, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.graphite}><circleGeometry args={[.18, 32]} /></mesh>
      <mesh position={[0, -.41, 0]} material={m.alu}><cylinderGeometry args={[.38, .36, .04, 40]} /></mesh>
      <mesh position={[0, -.2, 0]} material={m.glow}><torusGeometry args={[.385, .01, 6, 48]} /></mesh>
    </group>}

    {kind === 'software' && <group ref={spin}>
      <mesh rotation={[0, 0, .08]} material={m.graphite}><boxGeometry args={[.82, .82, .16]} /></mesh>
      <mesh position={[0, 0, .085]} rotation={[0, 0, .08]} material={m.glass}><planeGeometry args={[.74, .74]} /></mesh>
      <mesh position={[0, 0, .1]} rotation={[0, 0, .08]} material={m.glow}><torusGeometry args={[.2, .035, 10, 3]} /></mesh>
      <mesh position={[0, 0, .1]} material={m.glow}><circleGeometry args={[.06, 24]} /></mesh>
      <mesh position={[0, 0, -.1]} material={m.alu}><boxGeometry args={[.7, .7, .02]} /></mesh>
    </group>}

    {kind === 'cloud' && <group ref={spin} position={[0, .05, 0]}>
      {([[-.28, -.02, 0, .26], [.02, .1, 0, .34], [.32, -.04, 0, .24], [.05, -.12, .12, .26]] as const).map(([x, y, z, r], i) =>
        <mesh key={i} position={[x, y, z]} material={m.cloud}><sphereGeometry args={[r, 32, 24]} /></mesh>)}
      <mesh position={[0, -.36, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glow}><torusGeometry args={[.42, .012, 8, 64]} /></mesh>
      {[0, 1, 2].map(i => <mesh key={i} position={[Math.cos(i * 2.1) * .55, -.3, Math.sin(i * 2.1) * .55]} material={m.glow}><boxGeometry args={[.06, .06, .06]} /></mesh>)}
    </group>}

    {kind === 'device' && <group ref={spin}>
      <mesh material={m.graphite}><boxGeometry args={[.5, .9, .06]} /></mesh>
      <mesh position={[0, 0, .032]} material={m.glass}><planeGeometry args={[.44, .8]} /></mesh>
      <mesh position={[0, .3, .036]} material={m.glow}><planeGeometry args={[.3, .04]} /></mesh>
    </group>}

    {kind === 'gem' && <group ref={spin}><mesh rotation={[0, Math.PI / 4, Math.PI / 8]} material={m.glow}><octahedronGeometry args={[.6, 0]} /></mesh></group>}
  </group>
}
