/* @refresh reload */

import { TanStackDevtools } from '@tanstack/solid-devtools'
import {
  HotkeysProvider,
  createFormatForDisplay,
  createHotkey,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { For, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import type { GermanKeys, Hotkey, UsKeys } from '@tanstack/solid-hotkeys'
import './index.css'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it.
declare module '@tanstack/solid-hotkeys' {
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

function ShortcutRow(props: {
  shortcut: Shortcut
  lastFired: Hotkey | null
  onFire: (hotkey: Hotkey) => void
}) {
  const formatForDisplay = createFormatForDisplay()
  const [count, setCount] = createSignal(0)

  createHotkey(
    () => props.shortcut.hotkey,
    () => {
      setCount((c) => c + 1)
      props.onFire(props.shortcut.hotkey)
    },
  )

  return (
    <div
      class={`hotkey-row ${props.lastFired === props.shortcut.hotkey ? 'fired' : ''}`}
    >
      <span>
        <kbd>{formatForDisplay(props.shortcut.hotkey)}</kbd>{' '}
        {props.shortcut.name}
      </span>
      <span class="count">{count()}×</span>
    </div>
  )
}

function App() {
  const [lastFired, setLastFired] = createSignal<Hotkey | null>(null)

  const rows = (shortcuts: Array<Shortcut>) => (
    <div class="hotkey-list">
      <For each={shortcuts}>
        {(shortcut) => (
          <ShortcutRow
            shortcut={shortcut}
            lastFired={lastFired()}
            onFire={setLastFired}
          />
        )}
      </For>
    </div>
  )

  return (
    <div class="app">
      <header>
        <h1>Keyboard Layouts</h1>
        <p>
          Registering a layout lets hotkey strings accept the keys it types,
          such as Ö and ß. It changes types only: these hotkeys match the same
          way without it.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>German keys</h2>
          <p class="note">
            Switch your keyboard layout to German to press these.
          </p>
          {rows(germanShortcuts)}
        </section>

        <section class="demo-section">
          <h2>Keys on every layout</h2>
          {rows(everyLayoutShortcuts)}
        </section>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import type { GermanKeys, UsKeys } from '@tanstack/solid-hotkeys'

declare module '@tanstack/solid-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

createHotkey('Mod+Ö', toggleComment) // OK
createHotkey('Mod+[', outdent) // OK, because UsKeys is listed
createHotkey('Mod+Ñ', x) // Type error: Spanish isn't registered`}</pre>
        </section>
      </main>

      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </div>
  )
}

const root = document.getElementById('root')!
render(
  () => (
    <HotkeysProvider>
      <App />
    </HotkeysProvider>
  ),
  root,
)
