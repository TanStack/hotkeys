import { For, Show, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import {
  HotkeysProvider,
  createHotkeys,
  formatForDisplay,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import type { CreateHotkeyDefinition, Hotkey } from '@tanstack/solid-hotkeys'
import './index.css'

const plugins = [hotkeysDevtoolsPlugin()]

function BasicMultiHotkeys() {
  const [log, setLog] = createSignal<Array<string>>([])
  const [saveCount, setSaveCount] = createSignal(0)
  const [undoCount, setUndoCount] = createSignal(0)
  const [redoCount, setRedoCount] = createSignal(0)

  createHotkeys([
    {
      hotkey: 'Shift+S',
      callback: (_e, { hotkey }) => {
        setSaveCount((c) => c + 1)
        setLog((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
      },
    },
    {
      hotkey: 'Shift+U',
      callback: (_e, { hotkey }) => {
        setUndoCount((c) => c + 1)
        setLog((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
      },
    },
    {
      hotkey: 'Shift+R',
      callback: (_e, { hotkey }) => {
        setRedoCount((c) => c + 1)
        setLog((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
      },
    },
  ])

  return (
    <div class="demo-section">
      <h2>Basic Multi-Hotkey Registration</h2>
      <p>
        All three hotkeys are registered in a single{' '}
        <code>createHotkeys()</code> call.
      </p>
      <div class="hotkey-grid">
        <div>
          <kbd>{formatForDisplay('Shift+S' as Hotkey)}</kbd> Save ({saveCount()}
          )
        </div>
        <div>
          <kbd>{formatForDisplay('Shift+U' as Hotkey)}</kbd> Undo ({undoCount()}
          )
        </div>
        <div>
          <kbd>{formatForDisplay('Shift+R' as Hotkey)}</kbd> Redo ({redoCount()}
          )
        </div>
      </div>
      <Show when={log().length > 0}>
        <div class="log">
          <For each={log()}>
            {(entry) => <div class="log-entry">{entry}</div>}
          </For>
        </div>
      </Show>
      <pre class="code-block">{`createHotkeys([
  { hotkey: 'Shift+S', callback: () => save() },
  { hotkey: 'Shift+U', callback: () => undo() },
  { hotkey: 'Shift+R', callback: () => redo() },
])`}</pre>
    </div>
  )
}

function CommonOptionsDemo() {
  const [enabled, setEnabled] = createSignal(true)
  const [counts, setCounts] = createSignal({ a: 0, b: 0, c: 0 })

  createHotkeys(
    [
      {
        hotkey: 'Alt+J',
        callback: () => setCounts((c) => ({ ...c, a: c.a + 1 })),
      },
      {
        hotkey: 'Alt+K',
        callback: () => setCounts((c) => ({ ...c, b: c.b + 1 })),
      },
      {
        hotkey: 'Alt+L',
        callback: () => setCounts((c) => ({ ...c, c: c.c + 1 })),
        options: { enabled: true },
      },
    ],
    () => ({ enabled: enabled() }),
  )

  return (
    <div class="demo-section">
      <h2>Common Options with Per-Hotkey Overrides</h2>
      <p>
        <kbd>{formatForDisplay('Alt+J' as Hotkey)}</kbd> and{' '}
        <kbd>{formatForDisplay('Alt+K' as Hotkey)}</kbd> respect the global
        toggle. <kbd>{formatForDisplay('Alt+L' as Hotkey)}</kbd> overrides{' '}
        <code>enabled: true</code> so it always works.
      </p>
      <div style={{ 'margin-bottom': '12px' }}>
        <button onClick={() => setEnabled((e) => !e)}>
          {enabled() ? 'Disable' : 'Enable'} common hotkeys
        </button>
      </div>
      <div class="hotkey-grid">
        <div>
          <kbd>{formatForDisplay('Alt+J' as Hotkey)}</kbd> Action A (
          {counts().a})
        </div>
        <div>
          <kbd>{formatForDisplay('Alt+K' as Hotkey)}</kbd> Action B (
          {counts().b})
        </div>
        <div>
          <kbd>{formatForDisplay('Alt+L' as Hotkey)}</kbd> Action C (
          {counts().c})<span class="hint"> (always on)</span>
        </div>
      </div>
      <pre class="code-block">{`createHotkeys(
  [
    { hotkey: 'Alt+J', callback: () => actionA() },
    { hotkey: 'Alt+K', callback: () => actionB() },
    { hotkey: 'Alt+L', callback: () => actionC(),
      options: { enabled: true } }, // overrides common
  ],
  () => ({ enabled: enabled() }), // common option
)`}</pre>
    </div>
  )
}

interface DynamicShortcut {
  id: number
  hotkey: string
  label: string
  count: number
}

let nextId = 0

function DynamicHotkeysDemo() {
  const [shortcuts, setShortcuts] = createSignal<Array<DynamicShortcut>>([
    { id: nextId++, hotkey: 'Shift+A', label: 'Action A', count: 0 },
    { id: nextId++, hotkey: 'Shift+B', label: 'Action B', count: 0 },
    { id: nextId++, hotkey: 'Shift+C', label: 'Action C', count: 0 },
  ])
  const [newHotkey, setNewHotkey] = createSignal('')
  const [newLabel, setNewLabel] = createSignal('')

  createHotkeys(() =>
    shortcuts().map(
      (s): CreateHotkeyDefinition => ({
        hotkey: s.hotkey as Hotkey,
        callback: () => {
          setShortcuts((prev) =>
            prev.map((item) =>
              item.id === s.id ? { ...item, count: item.count + 1 } : item,
            ),
          )
        },
      }),
    ),
  )

  const addShortcut = () => {
    const trimmed = newHotkey().trim()
    if (!trimmed || !newLabel().trim()) return
    setShortcuts((prev) => [
      ...prev,
      { id: nextId++, hotkey: trimmed, label: newLabel().trim(), count: 0 },
    ])
    setNewHotkey('')
    setNewLabel('')
  }

  const removeShortcut = (id: number) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div class="demo-section">
      <h2>Dynamic Hotkey List</h2>
      <p>
        Add or remove hotkeys at runtime. Because <code>createHotkeys</code>{' '}
        accepts a dynamic array, this works with Solid's reactivity.
      </p>
      <div class="dynamic-list">
        <For each={shortcuts()}>
          {(s) => (
            <div class="dynamic-item">
              <kbd>{formatForDisplay(s.hotkey as Hotkey)}</kbd>
              <span>{s.label}</span>
              <span class="count">{s.count}</span>
              <button onClick={() => removeShortcut(s.id)}>Remove</button>
            </div>
          )}
        </For>
        <Show when={shortcuts().length === 0}>
          <p class="hint">No shortcuts registered. Add one below.</p>
        </Show>
      </div>
      <div class="add-form">
        <input
          type="text"
          placeholder="Hotkey (e.g. Shift+D)"
          value={newHotkey()}
          onInput={(e) => setNewHotkey(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addShortcut()
          }}
        />
        <input
          type="text"
          placeholder="Label (e.g. Action D)"
          value={newLabel()}
          onInput={(e) => setNewLabel(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addShortcut()
          }}
        />
        <button onClick={addShortcut} disabled={!newHotkey() || !newLabel()}>
          Add
        </button>
      </div>
      <pre class="code-block">{`const [shortcuts] = createSignal([...])

createHotkeys(
  () => shortcuts().map((s) => ({
    hotkey: s.hotkey,
    callback: () => {
      setShortcuts((prev) =>
        prev.map((item) =>
          item.id === s.id ? { ...item, count: item.count + 1 } : item,
        ),
      )
    },
  })),
)`}</pre>
    </div>
  )
}

function App() {
  return (
    <>
      <HotkeysProvider>
        <div class="app">
          <header>
            <h1>createHotkeys</h1>
            <p>
              Register multiple hotkeys in a single primitive call. Supports
              dynamic arrays for variable-length shortcut lists.
            </p>
          </header>
          <BasicMultiHotkeys />
          <CommonOptionsDemo />
          <DynamicHotkeysDemo />
        </div>
      </HotkeysProvider>
      <TanStackDevtools plugins={plugins} />
    </>
  )
}

const rootElement = document.getElementById('root')!
render(() => <App />, rootElement)
