import { createRoot, useState } from 'octane'

import {
  HotkeysProvider,
  useFormatForDisplay,
  useHotkey,
} from '@tanstack/octane-hotkeys'

import type { GermanKeys, Hotkey, UsKeys } from '@tanstack/octane-hotkeys'

import './index.css'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it.
declare module '@tanstack/octane-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

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
}) @{
  const formatForDisplay = useFormatForDisplay()
  const [count, setCount] = useState(0)
  useHotkey(shortcut.hotkey, () => {
    setCount((c) => c + 1)
    onFire(shortcut.hotkey)
  })
  <div className={`hotkey-row ${lastFired === shortcut.hotkey ? 'fired' : ''}`}>
    <span>
      <kbd>{formatForDisplay(shortcut.hotkey)}</kbd> {shortcut.name}
    </span>
    <span className="count">{count}×</span>
  </div>
}

function ShortcutList({
  shortcuts,
  lastFired,
  onFire,
}: {
  shortcuts: Array<Shortcut>
  lastFired: Hotkey | null
  onFire: (hotkey: Hotkey) => void
}) @{
  <div className="hotkey-list">
    @for (const shortcut of shortcuts; key shortcut.name) {
      <ShortcutRow shortcut={shortcut} lastFired={lastFired} onFire={onFire} />
    }
  </div>
}

function App() @{
  const [lastFired, setLastFired] = useState<Hotkey | null>(null)
  <div className="app">
    <header>
      <h1>Keyboard Layouts</h1>
      <p>
        Registering a layout lets hotkey strings accept the keys it types, such
        as Ö and ß. It changes types only: these hotkeys match the same way
        without it.
      </p>
    </header>

    <main>
      <section className="demo-section">
        <h2>German keys</h2>
        <p className="note">
          Switch your keyboard layout to German to press these.
        </p>
        <ShortcutList
          shortcuts={germanShortcuts}
          lastFired={lastFired}
          onFire={setLastFired}
        />
      </section>

      <section className="demo-section">
        <h2>Keys on every layout</h2>
        <ShortcutList
          shortcuts={everyLayoutShortcuts}
          lastFired={lastFired}
          onFire={setLastFired}
        />
      </section>

      <section className="demo-section">
        <h2>Usage</h2>
        <pre className="code-block">{`import type { GermanKeys, UsKeys } from '@tanstack/octane-hotkeys'

declare module '@tanstack/octane-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

useHotkey('Mod+Ö', toggleComment) // OK
useHotkey('Mod+[', outdent) // OK, because UsKeys is listed
useHotkey('Mod+Ñ', x) // Type error: Spanish isn't registered`}</pre>
      </section>
    </main>
  </div>
}

function Root() @{
  <HotkeysProvider>
    <App />
  </HotkeysProvider>
}

const root = createRoot(document.getElementById('root')!)
root.render(Root)
import.meta.hot?.dispose(() => root.unmount())
