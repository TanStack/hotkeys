import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HotkeysProvider,
  useFormatForDisplay,
  useHotkey,
} from '@tanstack/react-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import React from 'react'
import ReactDOM from 'react-dom/client'
import type { GermanKeys, Hotkey, UsKeys } from '@tanstack/react-hotkeys'
import './index.css'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it.
declare module '@tanstack/react-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

interface Shortcut {
  hotkey: Hotkey
  name: string
}

// These type-check because German keys are registered above.
const germanShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+Ö', name: 'Toggle comment' },
  { hotkey: 'Mod+Shift+Ä', name: 'Add annotation' },
  { hotkey: 'ß', name: 'Toggle sidebar' },
  { hotkey: '§', name: 'Show sections' },
]

// A to Z, 0 to 9, named keys, and physical codes type-check under every
// registration, and fire on every layout.
const everyLayoutShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+K', name: 'Open command palette' },
  { hotkey: 'Alt+[Digit1]', name: 'Go to the first tab' },
  { hotkey: 'Escape', name: 'Clear' },
]

function ShortcutRow({
  shortcut,
  lastFired,
  onFire,
}: {
  shortcut: Shortcut
  lastFired: Hotkey | null
  onFire: (hotkey: Hotkey) => void
}) {
  const formatForDisplay = useFormatForDisplay()
  const [count, setCount] = React.useState(0)

  useHotkey(shortcut.hotkey, () => {
    setCount((c) => c + 1)
    onFire(shortcut.hotkey)
  })

  return (
    <div
      className={`hotkey-row ${lastFired === shortcut.hotkey ? 'fired' : ''}`}
    >
      <span>
        <kbd>{formatForDisplay(shortcut.hotkey)}</kbd> {shortcut.name}
      </span>
      <span className="count">{count}×</span>
    </div>
  )
}

function App() {
  const [lastFired, setLastFired] = React.useState<Hotkey | null>(null)

  const rows = (shortcuts: Array<Shortcut>) => (
    <div className="hotkey-list">
      {shortcuts.map((shortcut) => (
        <ShortcutRow
          key={shortcut.name}
          shortcut={shortcut}
          lastFired={lastFired}
          onFire={setLastFired}
        />
      ))}
    </div>
  )

  return (
    <div className="app">
      <header>
        <h1>Keyboard Layouts</h1>
        <p>
          Registering a layout lets hotkey strings accept the keys it types,
          such as Ö and ß. It changes types only: these hotkeys match the same
          way without it.
        </p>
      </header>

      <main>
        <section className="demo-section">
          <h2>German keys</h2>
          <p className="note">
            Switch your keyboard layout to German to press these.
          </p>
          {rows(germanShortcuts)}
        </section>

        <section className="demo-section">
          <h2>Keys on every layout</h2>
          {rows(everyLayoutShortcuts)}
        </section>

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import type { GermanKeys, UsKeys } from '@tanstack/react-hotkeys'

declare module '@tanstack/react-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

useHotkey('Mod+Ö', toggleComment) // OK
useHotkey('Mod+[', outdent) // OK, because UsKeys is listed
useHotkey('Mod+Ñ', x) // Type error: Spanish isn't registered`}</pre>
        </section>
      </main>

      <TanStackDevtools plugins={devtoolsPlugins} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HotkeysProvider>
    <App />
  </HotkeysProvider>,
)
