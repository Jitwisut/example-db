import { create } from 'zustand'
import { CATEGORIES, emptySnapshot, emptyViz, type Mode, type WorldResult, type Table, type LabResult } from './model'
import { worldClient } from './client'
interface WorldStore {
  category: Mode; sql: string; entered: boolean; busy: boolean; ready: boolean; error: string; result: WorldResult;
  revision: number; cameraRevision: number; focus: { table: Table; id: number } | null; selected: { table: Table; id: number } | null;
  explore: boolean; details: boolean; menu: boolean; reduced: boolean; lab: LabResult | null;
  set: (value: Partial<WorldStore>) => void; choose: (mode: Mode) => void; run: () => Promise<void>; reset: () => Promise<void>; replay: () => void;
  runLab: (username: string, password: string, protectedMode: boolean) => Promise<void>;
}
// จอมือถือ: เมนูหมวดพับไว้ก่อน ไม่ให้บังฉากและแผง console
const isNarrow = () => matchMedia('(max-width: 760px)').matches
const initial: WorldResult = { before: emptySnapshot, after: emptySnapshot, visualization: emptyViz, results: [], ms: 0, affected: 0 }
export const useWorld = create<WorldStore>((set, get) => ({
  category: 'select', sql: CATEGORIES[0].sql, entered: false, busy: false, ready: false, error: '', result: initial, revision: 0, cameraRevision: 0,
  focus: null, selected: null, explore: false, details: false, menu: !isNarrow(), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, lab: null,
  set,
  choose: category => {
    const s = get()
    set({ category, sql: CATEGORIES.find(c => c.id === category)!.sql, entered: true, selected: null, focus: null, explore: false, error: '', lab: null, details: category === 'lab' ? false : s.details, menu: isNarrow() ? false : s.menu, cameraRevision: s.cameraRevision + 1,
      result: { ...s.result, before: s.result.after, visualization: { ...emptyViz, ids: s.result.after.users.map(r => r.id) }, results: [], affected: 0 } })
  },
  run: async () => {
    if (get().busy) return
    set({ busy: true, error: '', selected: null })
    try { const response = await worldClient.send({ type: 'run', sql: get().sql }); if (response.world) set({ result: response.world, revision: get().revision + 1, cameraRevision: get().cameraRevision + 1, focus: null, explore: false }) }
    catch (e) { set({ error: String((e as Error).message) }) }
    finally { set({ busy: false }) }
  },
  reset: async () => {
    if (get().busy) return
    set({ busy: true, error: '', selected: null, focus: null, explore: false })
    try { const response = await worldClient.send({ type: 'reset' }); if (response.world) set({ result: response.world, ready: true, revision: get().revision + 1, cameraRevision: get().cameraRevision + 1, lab: null }) }
    catch (e) { set({ error: String((e as Error).message) }) }
    finally { set({ busy: false }) }
  },
  replay: () => set(s => ({ revision: s.revision + 1, cameraRevision: s.cameraRevision + 1 })),
  runLab: async (username, password, protectedMode) => {
    if (get().busy) return
    set({ busy: true, error: '', lab: null })
    try { const response = await worldClient.send({ type: 'lab', username, password, protected: protectedMode }); set({ lab: response.lab, revision: get().revision + 1 }) }
    catch (e) { set({ error: String((e as Error).message) }) }
    finally { set({ busy: false }) }
  },
}))
