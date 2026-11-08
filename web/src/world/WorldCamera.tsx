import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitImpl } from 'three-stdlib'
import { Euler, Vector3 } from 'three'
import gsap from 'gsap'
import { useWorld } from './store'
import { DISTRICTS, recordPosition } from './model'
export function WorldCamera() {
  const controls = useRef<OrbitImpl>(null)
  const { camera, gl, size } = useThree()
  const shift = useRef({ x: 0, y: 0 })
  const category = useWorld(s => s.category), revision = useWorld(s => s.cameraRevision), entered = useWorld(s => s.entered), explore = useWorld(s => s.explore), reduced = useWorld(s => s.reduced)
  const flight = useRef<gsap.core.Timeline | null>(null)
  const keys = useRef(new Set<string>()), velocity = useRef(new Vector3()), direction = useRef(new Vector3()), side = useRef(new Vector3()), look = useRef(new Euler(0, 0, 0, 'YXZ'))
  useEffect(() => {
    if (explore) return
    const s = useWorld.getState()
    // มุมกว้างให้เห็นครบ 4 เขต (users, orders, products, JOIN)
    let target: [number, number, number] = [3, 0, -3]
    let position: [number, number, number] = [32, 27, 40]
    if (entered) { target = [2, 0, -2]; position = [27, 23, 34] }
    if (category === 'lab') { target = [28, 2, -24]; position = [40, 13, 3] }
    else if (category === 'join') { target = [18.4, -3, 1.2]; position = [35.4, 19, 24.2] }
    else if (s.result.results.length) {
      target = [...DISTRICTS[s.result.visualization.table].position]
      // เขตสินค้าอยู่หลังแกนกลาง: มองจากด้านซ้ายหน้าเพื่อไม่ให้แกนกลางบัง
      position = s.result.visualization.table === 'products' ? [target[0] - 9, target[1] + 11, target[2] + 15] : [target[0] + 16, target[1] + 14, target[2] + 19]
    }
    if (s.focus) {
      const rows = s.result.after[s.focus.table], i = rows.findIndex(r => r.id === s.focus!.id)
      if (i >= 0) { target = recordPosition(s.focus.table, i, rows[i], s.result.visualization); position = [target[0] + 5, target[1] + 4, target[2] + 7] }
    }
    // จอแนวตั้งแคบ: ถอยกล้องออกให้เห็นทั้งสามเขตข้อมูล
    if (size.width < 760 && !s.focus) position = position.map((v, i) => target[i] + (v - target[i]) * 1.35) as [number, number, number]
    flight.current?.kill()
    const timeline = gsap.timeline({ defaults: { duration: reduced ? 0 : entered ? 1.5 : 3.5, ease: 'power3.inOut' } })
    timeline.to(camera.position, { x: position[0], y: position[1], z: position[2] }, 0)
    if (controls.current) timeline.to(controls.current.target, { x: target[0], y: target[1], z: target[2] }, 0)
    flight.current = timeline
    return () => { timeline.kill() }
  }, [camera, category, revision, entered, explore, reduced, size.width < 760])
  // จัดองค์ประกอบภาพด้วย view offset (เลื่อนภาพบนจอ ไม่กระทบการหมุนกล้อง)
  // จอกว้าง: หน้าแรกดันโลกไปขวาพ้นหัวข้อ / โหมดใช้งานดันเข้ากลางระหว่างเมนูกับ HUD และยกขึ้นพ้นแผง console
  // จอแคบ: หน้าแรกดันโลกลงไปใต้ปุ่ม ENTER ไม่ให้ทับข้อความ
  useEffect(() => {
    const wide = size.width > 900
    const x = !entered ? (wide ? -size.width * 0.14 : 0) : size.width > 1100 ? -size.width * 0.035 : size.width > 760 ? -size.width * 0.08 : 0
    const y = entered ? (size.width > 760 ? size.height * 0.08 : 0) : wide ? 0 : -size.height * 0.36
    const tween = gsap.to(shift.current, { x, y, duration: reduced ? 0 : 1.2, ease: 'power3.inOut' })
    return () => { tween.kill() }
  }, [entered, size.width, size.height, reduced])
  useEffect(() => () => { if ('clearViewOffset' in camera) { camera.clearViewOffset(); camera.updateProjectionMatrix() } }, [camera])
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest('input,textarea,.monaco-editor,[contenteditable]')) return; keys.current.add(e.code); if (explore && ['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code)) e.preventDefault() }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const blur = () => { keys.current.clear(); velocity.current.set(0, 0, 0) }
    let dragging = false
    const start = () => { flight.current?.kill(); dragging = true }
    const end = () => { dragging = false }
    const move = (e: PointerEvent) => {
      if (!explore || !dragging) return
      look.current.setFromQuaternion(camera.quaternion)
      look.current.y -= e.movementX * .003
      look.current.x = Math.max(-1.4, Math.min(1.4, look.current.x - e.movementY * .003))
      camera.quaternion.setFromEuler(look.current)
    }
    const canvas = gl.domElement
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    canvas.addEventListener('pointerdown', start); window.addEventListener('pointerup', end); canvas.addEventListener('pointermove', move); canvas.addEventListener('wheel', start)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); canvas.removeEventListener('pointerdown', start); window.removeEventListener('pointerup', end); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('wheel', start); blur() }
  }, [camera, gl, explore])
  useFrame((_, delta) => {
    const view = 'view' in camera ? camera.view : null
    const { x, y } = shift.current
    if ('setViewOffset' in camera && (Math.abs(x) > .5 || Math.abs(y) > .5 || view?.enabled)) {
      if (!view || view.offsetX !== x || view.offsetY !== y || view.fullWidth !== size.width || view.fullHeight !== size.height) {
        camera.setViewOffset(size.width, size.height, x, y, size.width, size.height)
        camera.updateProjectionMatrix()
      }
    }
    if (!explore) return
    const dt = Math.min(delta, .05), k = keys.current, speed = k.has('ShiftLeft') || k.has('ShiftRight') ? 17 : 7
    camera.getWorldDirection(direction.current); direction.current.y = 0; direction.current.normalize()
    side.current.crossVectors(direction.current, camera.up).normalize()
    direction.current.multiplyScalar((Number(k.has('KeyW')) - Number(k.has('KeyS'))) * speed)
    direction.current.addScaledVector(side.current, (Number(k.has('KeyD')) - Number(k.has('KeyA'))) * speed)
    direction.current.y = (Number(k.has('KeyE')) - Number(k.has('KeyQ'))) * speed
    velocity.current.lerp(direction.current, 1 - Math.exp(-7 * dt)); camera.position.addScaledVector(velocity.current, dt)
    camera.position.y = Math.max(.8, Math.min(60, camera.position.y))
    camera.position.x = Math.max(-65, Math.min(65, camera.position.x)); camera.position.z = Math.max(-65, Math.min(65, camera.position.z))
  })
  return <OrbitControls ref={controls} makeDefault enabled={!explore} enableDamping dampingFactor={.07} minDistance={4} maxDistance={85} maxPolarAngle={Math.PI * .48} target={[-2, 0, -4]} onStart={() => flight.current?.kill()} />
}
