/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, Show } from 'solid-js'
import {
  createHotkey,
  createHotkeySequence,
  HotkeysProvider,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import './index.css'

function App() {
  const [lastSequence, setLastSequence] = createSignal<string | null>(null)
  const [history, setHistory] = createSignal<Array<string>>([])

  const addToHistory = (action: string) => {
    setLastSequence(action)
    setHistory((h) => [...h.slice(-9), action])
  }

  createHotkeySequence(['G', 'G'], () => addToHistory('gg → Go to top'))
  createHotkeySequence(['Shift+G'], () => addToHistory('G → Go to bottom'))
  createHotkeySequence(['D', 'D'], () => addToHistory('dd → Delete line'))
  createHotkeySequence(['Y', 'Y'], () => addToHistory('yy → Yank (copy) line'))
  createHotkeySequence(['D', 'W'], () => addToHistory('dw → Delete word'))
  createHotkeySequence(['C', 'I', 'W'], () =>
    addToHistory('ciw → Change inner word'),
  )

  createHotkeySequence(
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    () => addToHistory('↑↑↓↓ → Konami code (partial)'),
    { timeout: 1500 },
  )

  createHotkeySequence(
    ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
    () => addToHistory('←→←→ → Side to side!'),
    { timeout: 1500 },
  )

  createHotkeySequence(['H', 'E', 'L', 'L', 'O'], () =>
    addToHistory('hello → Hello World!'),
  )

  createHotkey('Escape', () => {
    setLastSequence(null)
    setHistory([])
  })

  return (
    <div class="app">
      <header>
        <h1>createHotkeySequence</h1>
        <p>
          Register multi-key sequences (like Vim commands). Keys must be pressed
          within the timeout window (default: 1000ms).
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Vim-Style Commands</h2>
          <table class="sequence-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>g</kbd> <kbd>g</kbd>
                </td>
                <td>Go to top</td>
              </tr>
              <tr>
                <td>
                  <kbd>G</kbd> (Shift+G)
                </td>
                <td>Go to bottom</td>
              </tr>
              <tr>
                <td>
                  <kbd>d</kbd> <kbd>d</kbd>
                </td>
                <td>Delete line</td>
              </tr>
              <tr>
                <td>
                  <kbd>y</kbd> <kbd>y</kbd>
                </td>
                <td>Yank (copy) line</td>
              </tr>
              <tr>
                <td>
                  <kbd>d</kbd> <kbd>w</kbd>
                </td>
                <td>Delete word</td>
              </tr>
              <tr>
                <td>
                  <kbd>c</kbd> <kbd>i</kbd> <kbd>w</kbd>
                </td>
                <td>Change inner word</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="demo-section">
          <h2>Fun Sequences</h2>
          <div class="fun-sequences">
            <div class="sequence-card">
              <h3>Konami Code (Partial)</h3>
              <p>
                <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd>
              </p>
              <span class="hint">Use arrow keys within 1.5 seconds</span>
            </div>
            <div class="sequence-card">
              <h3>Side to Side</h3>
              <p>
                <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd>
              </p>
              <span class="hint">Arrow keys within 1.5 seconds</span>
            </div>
            <div class="sequence-card">
              <h3>Spell It Out</h3>
              <p>
                <kbd>h</kbd> <kbd>e</kbd> <kbd>l</kbd> <kbd>l</kbd> <kbd>o</kbd>
              </p>
              <span class="hint">Type "hello" quickly</span>
            </div>
          </div>
        </section>

        <Show when={lastSequence()}>
          <div class="info-box success">
            <strong>Triggered:</strong> {lastSequence()}
          </div>
        </Show>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import { createHotkeySequence } from '@tanstack/solid-hotkeys'

function VimEditor() {
  createHotkeySequence(['G', 'G'], () => {
    scrollToTop()
  })

  createHotkeySequence(
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    () => activateCheatMode(),
    { timeout: 1500 }
  )

  createHotkeySequence(['C', 'I', 'W'], () => {
    changeInnerWord()
  })
}`}</pre>
        </section>

        <Show when={history().length > 0}>
          <section class="demo-section">
            <h2>History</h2>
            <ul class="history-list">
              {history().map((item, i) => (
                <li>{item}</li>
              ))}
            </ul>
            <button onClick={() => setHistory([])}>Clear History</button>
          </section>
        </Show>

        <p class="hint">
          Press <kbd>Escape</kbd> to clear history
        </p>
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
