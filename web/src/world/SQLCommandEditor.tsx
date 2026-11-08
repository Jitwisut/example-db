import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/languages/definitions/sql/register'
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'
import { useWorld } from './store'
self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
loader.config({ monaco })
export default function SQLCommandEditor() {
  const sql = useWorld(s => s.sql), busy = useWorld(s => s.busy)
  return <Editor height="96px" language="sql" theme="sql-world" value={sql} beforeMount={m => m.editor.defineTheme('sql-world', { base: 'vs-dark', inherit: true, rules: [{ token: 'keyword', foreground: '72DAFF' }, { token: 'string', foreground: 'FFCA8A' }, { token: 'number', foreground: 'B0A6FF' }], colors: { 'editor.background': '#0b1420', 'editor.foreground': '#d3e3ee', 'editorLineNumber.foreground': '#45576a', 'editor.selectionBackground': '#244457', 'editor.lineHighlightBackground': '#0b1420' } })} onChange={value => useWorld.getState().set({ sql: value ?? '' })} onMount={(editor, m) => { editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Enter, () => void useWorld.getState().run()) }} options={{ readOnly: busy, minimap: { enabled: false }, fontFamily: 'JetBrains Mono', fontSize: 12, lineNumbersMinChars: 2, lineDecorationsWidth: 8, scrollBeyondLastLine: false, automaticLayout: true, wordWrap: 'on', padding: { top: 8, bottom: 8 }, folding: false, glyphMargin: false, renderLineHighlight: 'none', overviewRulerLanes: 0, hideCursorInOverviewRuler: true, scrollbar: { verticalScrollbarSize: 3, horizontalScrollbarSize: 3 }, ariaLabel: 'SQL query editor', tabSize: 2 }} loading={<div className="editor-loading">Loading SQL editor…</div>} />
}
