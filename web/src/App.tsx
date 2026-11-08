import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDownUp, ArrowRight, AudioLines, Box, ChevronDown, ChevronRight, CircleHelp, Code2, Compass, Crosshair, Database, Fingerprint, Focus, Globe2, Layers3, Link2, LoaderCircle, Maximize, Minus, MousePointer2, PanelLeftClose, PanelLeftOpen, Play, Plus, Radio, RotateCcw, ScanLine, Search, Shield, SlidersHorizontal, Terminal, Trash2, X } from 'lucide-react'
import { CATEGORIES, type Table } from './world/model'
import { useWorld } from './world/store'
import { JoinResultPanel } from './world/JoinResultPanel'
const SQLWorld = lazy(() => import('./world/SQLWorld'))
const SQLCommandEditor = lazy(() => import('./world/SQLCommandEditor'))
const icons = { select: ScanLine, where: Search, order: ArrowDownUp, join: Link2, group: Layers3, insert: Plus, update: SlidersHorizontal, delete: Trash2, lab: Shield }
export function App() {
  const entered = useWorld(s => s.entered), category = useWorld(s => s.category), ready = useWorld(s => s.ready), reduced = useWorld(s => s.reduced), error = useWorld(s => s.error), menu = useWorld(s => s.menu)
  const [help, setHelp] = useState(false)
  useEffect(() => { void useWorld.getState().reset() }, [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = useWorld.getState()
      if (e.key === 'Escape') { s.set({ selected: null, focus: null, details: false, explore: false, cameraRevision: s.cameraRevision + 1 }); setHelp(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !(e.target as HTMLElement).closest('.monaco-editor') && s.entered && s.category !== 'lab') { e.preventDefault(); void s.run() }
    }
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler)
  }, [])
  return <div className={`experience ${entered ? 'has-entered' : 'on-arrival'} ${category === 'lab' ? 'red-zone' : ''} ${category === 'join' ? 'join-zone' : ''} ${reduced ? 'reduced-motion' : ''}`}>
    <a className="skip-link" href="#command-dock">Skip to SQL editor</a>
    <main className="world-stage" aria-label="Interactive SQL database world"><Suspense fallback={<div className="loading-world"><LoaderCircle className="spin" /> Constructing the database universe…</div>}><SQLWorld /></Suspense></main>
    <div className="vignette" /><div className="atmosphere" />
    <header className="topbar">
      <button className="wordmark" aria-label="SQL World overview" onClick={() => { const s = useWorld.getState(); s.choose('select'); s.set({ entered: false }) }}><span className="brand-symbol"><Box size={23} strokeWidth={1.3} /></span>SQL<span>WORLD</span><small>EXPLORER / 01</small></button>
      <nav aria-label="Main navigation"><button className={category !== 'lab' ? 'active' : ''} onClick={() => useWorld.getState().choose('select')}>EXPLORE</button><button onClick={() => { useWorld.getState().set({ entered: true, menu: !menu }) }}>SQL CATEGORIES</button><button className={category === 'lab' ? 'active lab-nav' : 'lab-nav'} onClick={() => useWorld.getState().choose('lab')}><Shield size={12} /> INJECTION LAB</button></nav>
      <div className="system-status"><i className={ready ? 'online' : ''} /><span>{ready ? 'SYSTEM ONLINE' : 'INITIALIZING'}</span><button className="icon-button" aria-label="Controls and help" onClick={() => setHelp(!help)}><CircleHelp size={17} /></button></div>
    </header>
    <AnimatePresence mode="wait">
      {!entered ? <motion.section key="arrival" className="arrival" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: reduced ? 0 : .7 }}>
        <div className="eyebrow"><span className="tiny-line" /> AN INTERACTIVE DATABASE UNIVERSE</div>
        <h1>EXPLORE<br />THE WORLD<br />OF <span>SQL.</span></h1>
        <p className="arrival-subtitle">Data is a place.<br />Every query takes you somewhere.</p>
        <p className="thai-intro">สำรวจฐานข้อมูลผ่านโลกสามมิติ<br />และดูว่าคำสั่ง SQL เปลี่ยนข้อมูลอย่างไร</p>
        <button className="enter-button" disabled={!ready} onClick={() => useWorld.getState().set({ entered: true })}><span>{ready ? 'ENTER THE WORLD' : 'INITIALIZING WORLD'}</span>{ready ? <ArrowRight size={17} /> : <LoaderCircle size={16} className="spin" />}</button>
        <div className="arrival-note"><MousePointer2 size={13} /> DRAG TO ORBIT <span>·</span> SCROLL TO DISCOVER</div>
      </motion.section> : <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .4 }}>
        <CategoryMenu /><CommandDock />
      </motion.div>}
    </AnimatePresence>
    <WorldHUD /><CameraControls onHelp={() => setHelp(true)} />
    {!entered && <div className="arrival-bottom"><span><Radio size={12} /> LIVE ENVIRONMENT</span><p>THREE DISTRICTS. INFINITE POSSIBILITIES.</p><div><span>01 / 03</span><i /><i /><i /></div></div>}
    <footer className="statusbar"><span><i /> {category === 'lab' ? 'SECURITY SECTOR' : 'DATABASE UNIVERSE'} <b>/</b> LOCAL SESSION</span><span className="footer-center">{entered ? 'DRAG TO ORBIT · SCROLL TO ZOOM · DOUBLE-CLICK TO FOCUS' : 'A WORLD YOU CAN EXPLORE. A DATABASE YOU CAN CONTROL.'}</span><span>SQLITE / WASM <b>↗</b></span></footer>
    <AnimatePresence>{error && <motion.div className="error-toast" role="alert" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><strong>QUERY INTERRUPTED</strong><p>{error}</p><button aria-label="Dismiss error" onClick={() => useWorld.getState().set({ error: '' })}><X size={16} /></button></motion.div>}</AnimatePresence>
    {entered && <JoinResultPanel />}
    <DataInspector />
    {help && <section className="help-panel glass"><header><span><Compass size={16} /> EXPLORER FIELD GUIDE</span><button aria-label="Close help" onClick={() => setHelp(false)}><X size={17} /></button></header><p>ข้อมูลทุกชิ้นมาจาก SQLite ในเครื่องของคุณ การรีเฟรชหรือ RESET WORLD จะเริ่มข้อมูลใหม่</p><dl><dt>Orbit</dt><dd>Left drag / one finger</dd><dt>Zoom</dt><dd>Scroll / pinch</dd><dt>Pan</dt><dd>Right drag / two fingers</dd><dt>Inspect / Focus</dt><dd>Click / double-click</dd><dt>Run query</dt><dd>⌘ / Ctrl + Enter</dd><dt>Explore mode</dt><dd>WASD + drag to look</dd><dt>Rise / descend</dt><dd>E / Q · Shift to accelerate</dd><dt>Leave focus</dt><dd>Esc</dd></dl><p>เลือกหมวด แก้ SQL แล้วกด Run query<br />คลิกวัตถุหรือเปิด Query details เพื่อดูค่าจริง</p><button className="text-button" onClick={() => useWorld.getState().set({ reduced: !reduced })}>{reduced ? '✓' : '○'} Reduce motion</button></section>}
  </div>
}
function CategoryMenu() {
  const category = useWorld(s => s.category), menu = useWorld(s => s.menu), busy = useWorld(s => s.busy)
  const topic = CATEGORIES.find(c => c.id === category)!
  return <><section className="scene-heading"><div className="eyebrow">{category === 'lab' ? 'RESTRICTED SECTOR / 09' : `QUERY EXPLORER / ${topic.number}`}</div><h1>{topic.title}</h1><p>{topic.description}</p></section>
    <aside className={`category-menu ${menu ? '' : 'collapsed'}`} aria-label="SQL categories"><button className="menu-heading" onClick={() => useWorld.getState().set({ menu: !menu })}>{menu ? <><span>SQL OPERATIONS</span><PanelLeftClose size={14} /></> : <PanelLeftOpen size={17} />}</button>{menu && <><div className="category-section-label">READ & EXPLORE</div>{CATEGORIES.map((c, i) => { const Icon = icons[c.id]; return <div key={c.id}>{i === 5 && <div className="category-section-label mutation-label">SHAPE THE WORLD</div>}{i === 8 && <div className="menu-divider" />}<button disabled={busy} className={`category-item ${category === c.id ? 'active' : ''} ${c.id === 'lab' ? 'security-item' : ''}`} onClick={() => useWorld.getState().choose(c.id)} aria-pressed={category === c.id}><span className="category-number">{c.number}</span><Icon size={16} strokeWidth={1.5} /><span>{c.label}</span>{category === c.id && <ChevronRight size={13} />}</button></div> })}<div className="menu-bottom"><Database size={12} /><span>DISPOSABLE LOCAL DATABASE</span></div></>}</aside></>
}
function WorldHUD() {
  const result = useWorld(s => s.result), category = useWorld(s => s.category), entered = useWorld(s => s.entered), lab = useWorld(s => s.lab)
  const [expanded, setExpanded] = useState(true)
  const total = Object.values(result.after).reduce((n, rows) => n + rows.length, 0), viz = result.visualization
  return <aside className="world-hud"><button className="hud-heading" onClick={() => setExpanded(!expanded)}><span><span className="live-dot" /> {category === 'lab' ? 'SECURITY TELEMETRY' : 'WORLD TELEMETRY'}</span><ChevronDown size={13} style={{ transform: expanded ? '' : 'rotate(-90deg)' }} /></button>{expanded && <><div className="hud-metrics"><div><strong>{category === 'lab' ? '03' : '03'}</strong><span>{category === 'lab' ? 'DEMO ACCOUNTS' : 'DATA DISTRICTS'}</span></div><div><strong>{category === 'lab' ? String(lab?.rows.length ?? 0).padStart(2, '0') : String(total).padStart(2, '0')}</strong><span>{category === 'lab' ? 'RETURNED ROWS' : 'LIVE RECORDS'}</span></div></div><div className="signal-bars">{Array.from({ length: 38 }, (_, i) => <i key={i} style={{ height: `${5 + ((i * 17 + 7) % 19)}px`, opacity: .25 + (i % 5) * .14 }} />)}</div><div className="hud-coordinate"><span>{category === 'lab' ? 'SANDBOX / ISOLATED' : 'WORLD / CONNECTED'}</span><Globe2 size={12} /></div>{entered && result.results.length > 0 && category !== 'lab' && <div className="query-telemetry"><span>{viz.mode === 'where' ? 'MATCHED' : viz.mode === 'group' ? 'GROUPS' : viz.mode === 'join' ? 'RELATIONS' : ['insert','update','delete'].includes(viz.mode) ? 'AFFECTED' : 'RETURNED'}</span><strong>{viz.mode === 'where' ? `${viz.ids.length} / ${result.after[viz.table].length}` : viz.mode === 'group' ? viz.groups.length : result.affected}</strong><small>{result.ms.toFixed(1)} ms</small></div>}</>}</aside>
}
function CameraControls({ onHelp }: { onHelp: () => void }) {
  const explore = useWorld(s => s.explore), entered = useWorld(s => s.entered)
  const resetCamera = () => { const s = useWorld.getState(); s.set({ focus: null, explore: false, cameraRevision: s.cameraRevision + 1 }) }
  return <div className="camera-area"><div className="orientation"><span>N</span><div><i /><b /></div><small>Y ↑</small></div><div className="camera-controls"><button title="Reset camera" aria-label="Reset camera" onClick={resetCamera}><RotateCcw size={17} /></button><button title="Focus camera" aria-label="Focus camera" onClick={() => { const s = useWorld.getState(); const first = s.result.after[s.result.visualization.table][0]; s.set({ focus: s.selected ?? (first ? { table: s.result.visualization.table, id: first.id } : null), explore: false, cameraRevision: s.cameraRevision + 1 }) }}><Focus size={18} /></button><button title="Explore mode — WASD + drag" aria-label="Explore mode" aria-pressed={explore} className={explore ? 'active' : ''} onClick={() => useWorld.getState().set({ explore: !explore, entered: true })}><Compass size={18} /></button><button title="Controls" aria-label="Show controls" onClick={onHelp}><CircleHelp size={18} /></button></div><div className="camera-mode">{explore ? 'FREE CAM' : 'ORBIT CAM'}</div>{entered && explore && <div className="explore-hint">W A S D <span>MOVE</span><br />DRAG <span>LOOK</span><br />ESC <span>EXIT</span></div>}</div>
}
function CommandDock() {
  const category = useWorld(s => s.category), busy = useWorld(s => s.busy), result = useWorld(s => s.result), ready = useWorld(s => s.ready)
  const [collapsed, setCollapsed] = useState(false)
  const topic = CATEGORIES.find(c => c.id === category)!
  if (category === 'lab') return <InjectionLab />
  return <section id="command-dock" className={`command-dock glass ${collapsed ? 'dock-collapsed' : ''}`}>
    <header className="dock-header"><span><Terminal size={14} /><b>QUERY CONSOLE</b><i>/</i><span>{topic.label}</span></span><div><button title="Load example SQL" aria-label="Load example SQL" disabled={busy} onClick={() => useWorld.getState().set({ sql: topic.sql })}><Code2 size={15} /></button><button title={collapsed ? 'Expand editor' : 'Collapse editor'} aria-label={collapsed ? 'Expand editor' : 'Collapse editor'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <Maximize size={14} /> : <Minus size={15} />}</button></div></header>
    {!collapsed && <><Suspense fallback={<div className="editor-loading">Loading SQL editor…</div>}><SQLCommandEditor /></Suspense><div className="dock-actions"><div><span className="local-label"><i /> LOCAL SESSION</span><button className="shortcut" onClick={() => void useWorld.getState().run()} disabled={busy || !ready}>⌘ / CTRL ↵</button></div><button className="run-button" disabled={busy || !ready} onClick={() => void useWorld.getState().run()}>{busy ? <LoaderCircle size={13} className="spin" /> : <Play size={12} fill="currentColor" />} {busy ? 'EXECUTING' : 'RUN QUERY'} <ArrowRight size={14} /></button></div></>}
    <div className="dock-toolbar"><button disabled={busy} onClick={() => void useWorld.getState().reset()}><RotateCcw size={12} /> Reset world</button><button disabled={busy || result.results.length === 0} onClick={() => useWorld.getState().replay()}><Play size={11} /> Replay animation</button><button onClick={() => useWorld.getState().set({ details: true })}><Code2 size={12} /> Query details <ChevronRight size={11} /></button></div>
    {result.visualization.message && <div className="limitation" role="status">{result.visualization.message}</div>}
    <div className="dock-caption"><span><MousePointer2 size={11} /> CLICK A RECORD TO INSPECT</span><span><AudioLines size={11} /> {result.results.length ? 'QUERY COMPLETE' : 'AWAITING YOUR QUERY'}</span></div>
  </section>
}
function InjectionLab() {
  const [username, setUsername] = useState('admin'), [password, setPassword] = useState(''), [protectedMode, setProtected] = useState(false)
  const busy = useWorld(s => s.busy), result = useWorld(s => s.lab), revision = useWorld(s => s.revision)
  const sql = protectedMode ? 'SELECT id, username, role FROM accounts\nWHERE username = ? AND password = ?' : `SELECT id, username, role FROM accounts\nWHERE username = '${username}' AND password = '${password}'`
  return <section id="command-dock" className="command-dock injection-dock glass"><header className="dock-header"><span><Fingerprint size={15} /><b>AUTHENTICATION LAB</b></span><span className="sandbox-label">LOCAL SANDBOX</span></header><div className="lab-content"><div className="mode-toggle"><button className={!protectedMode ? 'active' : ''} onClick={() => { setProtected(false); useWorld.getState().set({ lab: null }) }}>VULNERABLE</button><button className={protectedMode ? 'active protected' : ''} onClick={() => { setProtected(true); useWorld.getState().set({ lab: null }) }}><Shield size={12} /> PROTECTED</button></div><form onSubmit={e => { e.preventDefault(); void useWorld.getState().runLab(username, password, protectedMode) }}><label>USERNAME<input value={username} autoComplete="off" onChange={e => { setUsername(e.target.value); useWorld.getState().set({ lab: null }) }} /></label><label>PASSWORD<input value={password} autoComplete="off" placeholder="Try an input…" onChange={e => { setPassword(e.target.value); useWorld.getState().set({ lab: null }) }} /></label><button disabled={busy} className="run-button" type="submit">{busy ? <LoaderCircle size={14} className="spin" /> : <Play size={12} />} EXECUTE</button></form><div className="lab-examples"><span>TRY</span><button onClick={() => { setUsername('admin'); setPassword('nebula42'); useWorld.getState().set({ lab: null }) }}>Valid login</button><button onClick={() => { setUsername("' OR 1=1 --"); setPassword('anything'); useWorld.getState().set({ lab: null }) }}>Injection payload</button></div><pre className="assembled-query" key={revision}><code>{sql}</code></pre>{protectedMode && <p className="binding-note">Bound values: {JSON.stringify([username, password])} — input ถูกส่งเป็นค่า ไม่ใช่ไวยากรณ์ SQL</p>}
      {result && <div className={`lab-result ${result.granted ? 'granted' : 'denied'}`} role="status"><strong>{result.error ? 'SQL ERROR' : result.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'} <span>{result.rows.length} rows</span></strong><p>{result.error ?? (result.protected ? result.granted ? 'ข้อมูลตรงกับบัญชีสมมติ ผ่านการตรวจสอบด้วย parameter binding' : 'ไม่พบบัญชีที่ตรงกัน — parameter binding เก็บ input เป็นข้อมูล จึงไม่เปลี่ยนเงื่อนไข SQL' : result.granted ? 'คำสั่งคืนบัญชีจากฐานข้อมูลสมมติ ดูผลจริงด้านล่าง แล้วลอง input เดิมใน Protected mode' : 'ไม่พบข้อมูลที่ตรงกับเงื่อนไข SQL')}</p>{result.rows.map(r => <span className="account-chip" key={r.id}>#{r.id} {r.username} · {r.role}</span>)}</div>}
    </div><div className="dock-toolbar"><span><Shield size={12} /> Fictional accounts · isolated SQLite database</span><button onClick={() => { setUsername('admin'); setPassword(''); useWorld.getState().set({ lab: null }) }}>Reset lab</button></div></section>
}
function DataInspector() {
  const details = useWorld(s => s.details), result = useWorld(s => s.result)
  const [tab, setTab] = useState<Table | 'result'>('result')
  if (!details) return null
  return <aside className="data-inspector glass" aria-label="Query details"><header><span><Database size={16} /> QUERY DETAILS</span><button aria-label="Close query details" onClick={() => useWorld.getState().set({ details: false })}><X size={17} /></button></header><div className="inspector-tabs">{(['result', 'users', 'orders', 'products'] as const).map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div><div className="inspector-body">{tab === 'result' ? result.results.length ? result.results.map((r, i) => <section key={i}><pre>{r.sql}</pre>{r.kind === 'rows' ? <><p>{r.rows.length} rows{r.truncated ? ' · truncated at 500 rows' : ''} · {result.ms.toFixed(1)} ms</p><div className="table-scroll"><table><thead><tr>{r.columns.map((c, j) => <th key={j}>{c}</th>)}</tr></thead><tbody>{r.rows.map((row, j) => <tr key={j}>{row.map((value, k) => <td key={k}>{String(value ?? 'NULL')}</td>)}</tr>)}</tbody></table></div></> : <p>{r.kind === 'changes' ? `${r.changes} rows affected` : 'Statement completed'}</p>}</section>) : <p>ยังไม่มีผลลัพธ์ เลือกหมวดแล้วกด RUN QUERY<br />เลือกแท็บตารางเพื่อสำรวจข้อมูลตั้งต้น</p> : <><p>{result.after[tab].length} records · click to focus in the world</p>{result.after[tab].map(row => <button className="record-list-item" key={row.id} onClick={() => { const s = useWorld.getState(); s.set({ details: false, selected: { table: tab, id: row.id }, focus: { table: tab, id: row.id }, explore: false, cameraRevision: s.cameraRevision + 1 }) }}><span>#{row.id}</span><strong>{String(row.name ?? `Order ${row.id}`)}</strong><Crosshair size={14} /></button>)}</>}</div><div className="inspector-foot">SOURCE OF TRUTH / SQLITE WASM</div></aside>
}
