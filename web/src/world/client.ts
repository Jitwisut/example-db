import WorldWorker from './worker?worker'
import type { Request, Response } from './model'
type Input = Request extends infer R ? R extends Request ? Omit<R, 'id'> : never : never
class WorldClient {
  private worker = this.spawn()
  private seq = 0
  private pending = new Map<number, { resolve: (r: Response) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>()
  private spawn() {
    const worker = new WorldWorker()
    worker.onmessage = ({ data }: MessageEvent<Response>) => {
      const pending = this.pending.get(data.id)
      if (!pending) return
      clearTimeout(pending.timer); this.pending.delete(data.id)
      if (data.error) pending.reject(new Error(data.error)); else pending.resolve(data)
    }
    worker.onerror = () => this.restart('โหลด SQLite ไม่สำเร็จ ลอง RESET WORLD อีกครั้ง')
    return worker
  }
  private restart(message: string) {
    this.worker.terminate()
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error(message)) }
    this.pending.clear(); this.worker = this.spawn()
  }
  send(request: Input): Promise<Response> {
    const id = ++this.seq
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.restart('คำสั่งใช้เวลาเกิน 8 วินาที ฐานข้อมูลถูกเริ่มใหม่ — กด RESET WORLD เพื่อซิงก์ฉาก'), 8000)
      this.pending.set(id, { resolve, reject, timer }); this.worker.postMessage({ ...request, id })
    })
  }
}
export const worldClient = new WorldClient()
