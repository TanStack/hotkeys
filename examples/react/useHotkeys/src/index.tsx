import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/react-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { Hotkey, UseHotkeyDefinition } from '@tanstack/react-hotkeys'
import './index.css'

const plugins = [hotkeysDevtoolsPlugin()]

function App() {
  return (
    <>
      <HotkeysProvider>
        <div className="app">
          <header>
            <h1>useHotkeys</h1>
            <p>
              Register multiple hotkeys in a single hook call. Supports dynamic
              arrays for variable-length shortcut lists.
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

// ---------------------------------------------------------------------------
// Basic: multiple hotkeys registered at once
// ---------------------------------------------------------------------------

function BasicMultiHotkeys() {
  const [log, setLog] = React.useState<Array<string>>([])
  const [saveCount, setSaveCount] = React.useState(0)
  const [undoCount, setUndoCount] = React.useState(0)
  const [redoCount, setRedoCount] = React.useState(0)

  useHotkeys([
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
    <div className="demo-section">
      <h2>Basic Multi-Hotkey Registration</h2>
      <p>
        All three hotkeys are registered in a single <code>useHotkeys()</code>{' '}
        call with <code>meta</code> for name and description.
      </p>
      <div className="hotkey-grid">
        <div>
          <kbd>{formatForDisplay('Shift+S' as Hotkey)}</kbd> Save ({saveCount})
        </div>
        <div>
          <kbd>{formatForDisplay('Shift+U' as Hotkey)}</kbd> Undo ({undoCount})
        </div>
        <div>
          <kbd>{formatForDisplay('Shift+R' as Hotkey)}</kbd> Redo ({redoCount})
        </div>
      </div>
      {log.length > 0 && (
        <div className="log">
          {log.map((entry, i) => (
            <div key={i} className="log-entry">
              {entry}
            </div>
          ))}
        </div>
      )}
      <pre className="code-block">{`useHotkeys([
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

// ---------------------------------------------------------------------------
// Common options with per-hotkey overrides
// ---------------------------------------------------------------------------

function CommonOptionsDemo() {
  const [enabled, setEnabled] = React.useState(true)
  const [counts, setCounts] = React.useState({ a: 0, b: 0, c: 0 })

  useHotkeys(
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
    { enabled },
  )

  return (
    <div className="demo-section">
      <h2>Common Options with Per-Hotkey Overrides</h2>
      <p>
        <kbd>{formatForDisplay('Alt+J' as Hotkey)}</kbd> and{' '}
        <kbd>{formatForDisplay('Alt+K' as Hotkey)}</kbd> respect the global
        toggle. <kbd>{formatForDisplay('Alt+L' as Hotkey)}</kbd> overrides{' '}
        <code>enabled: true</code> so it always works.
      </p>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setEnabled((e) => !e)}>
          {enabled ? 'Disable' : 'Enable'} common hotkeys
        </button>
      </div>
      <div className="hotkey-grid">
        <div>
          <kbd>{formatForDisplay('Alt+J' as Hotkey)}</kbd> Action A ({counts.a})
        </div>
        <div>
          <kbd>{formatForDisplay('Alt+K' as Hotkey)}</kbd> Action B ({counts.b})
        </div>
        <div>
          <kbd>{formatForDisplay('Alt+L' as Hotkey)}</kbd> Action C ({counts.c})
          <span className="hint"> (always on)</span>
        </div>
      </div>
      <pre className="code-block">{`useHotkeys(
  [
    { hotkey: 'Alt+J', callback: () => actionA(),
      options: { meta: { name: 'Action A' } } },
    { hotkey: 'Alt+L', callback: () => actionC(),
      options: { enabled: true, meta: { name: 'Action C' } } },
  ],
  { enabled }, // common option
)`}</pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dynamic hotkey list: add & remove at runtime
// ---------------------------------------------------------------------------

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
    React.useState<Array<DynamicShortcut>>(DEFAULT_SHORTCUTS)
  const [newHotkey, setNewHotkey] = React.useState('')
  const [newLabel, setNewLabel] = React.useState('')
  const [newDescription, setNewDescription] = React.useState('')

  const definitions: Array<UseHotkeyDefinition> = shortcuts.map((s) => ({
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
  }))

  useHotkeys(definitions)

  const addShortcut = () => {
    const trimmed = newHotkey.trim()
    if (!trimmed || !newLabel.trim()) return
    setShortcuts((prev) => [
      ...prev,
      {
        id: nextId++,
        hotkey: trimmed,
        label: newLabel.trim(),
        description: newDescription.trim(),
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
    <div className="demo-section">
      <h2>Dynamic Hotkey List</h2>
      <p>
        Add or remove hotkeys at runtime. Because <code>useHotkeys</code>{' '}
        accepts a dynamic array, this is safe without breaking the rules of
        hooks.
      </p>
      <div className="dynamic-list">
        {shortcuts.map((s) => (
          <div key={s.id} className="dynamic-item">
            <kbd>{formatForDisplay(s.hotkey as Hotkey)}</kbd>
            <span>{s.label}</span>
            <span className="count">{s.count}</span>
            <button onClick={() => removeShortcut(s.id)}>Remove</button>
          </div>
        ))}
        {shortcuts.length === 0 && (
          <p className="hint">No shortcuts registered. Add one below.</p>
        )}
      </div>
      <div className="add-form">
        <input
          type="text"
          placeholder="Hotkey (e.g. Shift+D)"
          value={newHotkey}
          onChange={(e) => setNewHotkey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addShortcut()
          }}
        />
        <input
          type="text"
          placeholder="Name (e.g. Action D)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addShortcut()
          }}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addShortcut()
          }}
        />
        <button onClick={addShortcut} disabled={!newHotkey || !newLabel}>
          Add
        </button>
      </div>
      <pre className="code-block">{`const shortcuts = useShortcutsConfig() // dynamic data

useHotkeys(
  shortcuts.map((s) => ({
    hotkey: s.key,
    callback: s.action,
    options: { meta: { name: s.name, description: s.description } },
  })),
)`}</pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live registrations viewer using useHotkeyRegistrations
// ---------------------------------------------------------------------------

function RegistrationsViewer() {
  const { hotkeys, sequences } = useHotkeyRegistrations()

  return (
    <div className="demo-section">
      <h2>Live Registrations (useHotkeyRegistrations)</h2>
      <p>
        This table is rendered from <code>useHotkeyRegistrations()</code> — a
        reactive view of all registered hotkeys. It updates automatically as
        hotkeys are added, removed, enabled/disabled, or triggered.
      </p>
      <table className="registrations-table">
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
          {hotkeys.map((reg) => (
            <tr key={reg.id}>
              <td>
                <kbd>{formatForDisplay(reg.hotkey)}</kbd>
              </td>
              <td>{reg.options.meta?.name ?? '—'}</td>
              <td className="description-cell">
                {reg.options.meta?.description ?? '—'}
              </td>
              <td>
                <span
                  className={
                    reg.options.enabled !== false ? 'status-on' : 'status-off'
                  }
                >
                  {reg.options.enabled !== false ? 'yes' : 'no'}
                </span>
              </td>
              <td className="trigger-count">{reg.triggerCount}</td>
            </tr>
          ))}
          {hotkeys.length === 0 && (
            <tr>
              <td colSpan={5} className="hint">
                No hotkeys registered
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {sequences.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>Sequences</h3>
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Name</th>
                <th>Description</th>
                <th>Triggers</th>
              </tr>
            </thead>
            <tbody>
              {sequences.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    {reg.sequence.map((s, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && ' '}
                        <kbd>{formatForDisplay(s)}</kbd>
                      </React.Fragment>
                    ))}
                  </td>
                  <td>{reg.options.meta?.name ?? '—'}</td>
                  <td className="description-cell">
                    {reg.options.meta?.description ?? '—'}
                  </td>
                  <td className="trigger-count">{reg.triggerCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <pre className="code-block">{`const { hotkeys, sequences } = useHotkeyRegistrations()

// Render a live table of all registrations
hotkeys.map((reg) => (
  <tr key={reg.id}>
    <td>{formatForDisplay(reg.hotkey)}</td>
    <td>{reg.options.meta?.name}</td>
    <td>{reg.options.meta?.description}</td>
    <td>{reg.triggerCount}</td>
  </tr>
))`}</pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const rootElement = document.getElementById('root')!
ReactDOM.createRoot(rootElement).render(<App />)
