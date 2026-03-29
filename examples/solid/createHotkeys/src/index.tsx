import { For, Show, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import {
  HotkeysProvider,
  createHotkeyRegistrations,
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
      options: {
        meta: { name: 'Save', description: 'Save the current document' },
      },
    },
    {
      hotkey: 'Shift+U',
      callback: (_e, { hotkey }) => {
        setUndoCount((c) => c + 1)
        setLog((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
      },
      options: {
        meta: { name: 'Undo', description: 'Undo the last action' },
      },
    },
    {
      hotkey: 'Shift+R',
      callback: (_e, { hotkey }) => {
        setRedoCount((c) => c + 1)
        setLog((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
      },
      options: {
        meta: { name: 'Redo', description: 'Redo the last undone action' },
      },
    },
  ])

  return (
    <div class="demo-section">
      <h2>Basic Multi-Hotkey Registration</h2>
      <p>
        All three hotkeys are registered in a single{' '}
        <code>createHotkeys()</code> call with <code>meta</code> for name and
        description.
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
  {
    hotkey: 'Shift+S',
    callback: () => save(),
    options: { meta: { name: 'Save', description: 'Save the document' } },
  },
  {
    hotkey: 'Shift+U',
    callback: () => undo(),
    options: { meta: { name: 'Undo', description: 'Undo the last action' } },
  },
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
        options: {
          meta: {
            name: 'Action A',
            description: 'First action (respects toggle)',
          },
        },
      },
      {
        hotkey: 'Alt+K',
        callback: () => setCounts((c) => ({ ...c, b: c.b + 1 })),
        options: {
          meta: {
            name: 'Action B',
            description: 'Second action (respects toggle)',
          },
        },
      },
      {
        hotkey: 'Alt+L',
        callback: () => setCounts((c) => ({ ...c, c: c.c + 1 })),
        options: {
          enabled: true,
          meta: {
            name: 'Action C',
            description: 'Always-on action (overrides toggle)',
          },
        },
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
    { hotkey: 'Alt+J', callback: () => actionA(),
      options: { meta: { name: 'Action A' } } },
    { hotkey: 'Alt+L', callback: () => actionC(),
      options: { enabled: true, meta: { name: 'Action C' } } },
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
  description: string
  count: number
}

let nextId = 0

const DEFAULT_SHORTCUTS: Array<DynamicShortcut> = [
  {
    id: nextId++,
    hotkey: 'Shift+A',
    label: 'Action A',
    description: 'First dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+B',
    label: 'Action B',
    description: 'Second dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+C',
    label: 'Action C',
    description: 'Third dynamic action',
    count: 0,
  },
]

function DynamicHotkeysDemo() {
  const [shortcuts, setShortcuts] =
    createSignal<Array<DynamicShortcut>>(DEFAULT_SHORTCUTS)
  const [newHotkey, setNewHotkey] = createSignal('')
  const [newLabel, setNewLabel] = createSignal('')
  const [newDescription, setNewDescription] = createSignal('')

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
        options: {
          meta: { name: s.label, description: s.description },
        },
      }),
    ),
  )

  const addShortcut = () => {
    const trimmed = newHotkey().trim()
    if (!trimmed || !newLabel().trim()) return
    setShortcuts((prev) => [
      ...prev,
      {
        id: nextId++,
        hotkey: trimmed,
        label: newLabel().trim(),
        description: newDescription().trim(),
        count: 0,
      },
    ])
    setNewHotkey('')
    setNewLabel('')
    setNewDescription('')
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
          placeholder="Name (e.g. Action D)"
          value={newLabel()}
          onInput={(e) => setNewLabel(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addShortcut()
          }}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription()}
          onInput={(e) => setNewDescription(e.currentTarget.value)}
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
    callback: s.action,
    options: { meta: { name: s.name, description: s.description } },
  })),
)`}</pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live registrations viewer using createHotkeyRegistrations
// ---------------------------------------------------------------------------

function RegistrationsViewer() {
  const { hotkeys, sequences } = createHotkeyRegistrations()

  return (
    <div class="demo-section">
      <h2>Live Registrations (createHotkeyRegistrations)</h2>
      <p>
        This table is rendered from <code>createHotkeyRegistrations()</code> — a
        reactive view of all registered hotkeys. It updates automatically as
        hotkeys are added, removed, enabled/disabled, or triggered.
      </p>
      <table class="registrations-table">
        <thead>
          <tr>
            <th>Hotkey</th>
            <th>Name</th>
            <th>Description</th>
            <th>Enabled</th>
            <th>Triggers</th>
          </tr>
        </thead>
        <tbody>
          <For each={hotkeys()}>
            {(reg) => (
              <tr>
                <td>
                  <kbd>{formatForDisplay(reg.hotkey)}</kbd>
                </td>
                <td>{reg.options.meta?.name ?? '\u2014'}</td>
                <td class="description-cell">
                  {reg.options.meta?.description ?? '\u2014'}
                </td>
                <td>
                  <span
                    class={
                      reg.options.enabled !== false ? 'status-on' : 'status-off'
                    }
                  >
                    {reg.options.enabled !== false ? 'yes' : 'no'}
                  </span>
                </td>
                <td class="trigger-count">{reg.triggerCount}</td>
              </tr>
            )}
          </For>
          <Show when={hotkeys().length === 0}>
            <tr>
              <td colSpan={5} class="hint">
                No hotkeys registered
              </td>
            </tr>
          </Show>
        </tbody>
      </table>
      <Show when={sequences().length > 0}>
        <h3 style={{ 'margin-top': '16px' }}>Sequences</h3>
        <table class="registrations-table">
          <thead>
            <tr>
              <th>Sequence</th>
              <th>Name</th>
              <th>Description</th>
              <th>Triggers</th>
            </tr>
          </thead>
          <tbody>
            <For each={sequences()}>
              {(reg) => (
                <tr>
                  <td>
                    <For each={reg.sequence}>
                      {(s, i) => (
                        <>
                          {i() > 0 && ' '}
                          <kbd>{formatForDisplay(s)}</kbd>
                        </>
                      )}
                    </For>
                  </td>
                  <td>{reg.options.meta?.name ?? '\u2014'}</td>
                  <td class="description-cell">
                    {reg.options.meta?.description ?? '\u2014'}
                  </td>
                  <td class="trigger-count">{reg.triggerCount}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
      <pre class="code-block">{`const { hotkeys, sequences } = createHotkeyRegistrations()

// Render a live table of all registrations
<For each={hotkeys()}>
  {(reg) => (
    <tr>
      <td>{formatForDisplay(reg.hotkey)}</td>
      <td>{reg.options.meta?.name}</td>
      <td>{reg.options.meta?.description}</td>
      <td>{reg.triggerCount}</td>
    </tr>
  )}
</For>`}</pre>
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
          <RegistrationsViewer />
        </div>
      </HotkeysProvider>
      <TanStackDevtools plugins={plugins} />
    </>
  )
}

const rootElement = document.getElementById('root')!
render(() => <App />, rootElement)
