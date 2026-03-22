import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  HotkeysProvider,
  useHotkey,
  useHotkeySequence,
} from '@tanstack/react-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import './index.css'

function App() {
  const [lastSequence, setLastSequence] = React.useState<string | null>(null)
  const [history, setHistory] = React.useState<Array<string>>([])

  const addToHistory = (action: string) => {
    setLastSequence(action)
    setHistory((h) => [...h.slice(-9), action])
  }

  useHotkeySequence(['G', 'G'], () => addToHistory('gg → Go to top'))
  useHotkeySequence(['Shift+G'], () => addToHistory('G → Go to bottom'))
  useHotkeySequence(['D', 'D'], () => addToHistory('dd → Delete line'))
  useHotkeySequence(['Y', 'Y'], () => addToHistory('yy → Yank (copy) line'))
  useHotkeySequence(['D', 'W'], () => addToHistory('dw → Delete word'))
  useHotkeySequence(['C', 'I', 'W'], () =>
    addToHistory('ciw → Change inner word'),
  )

  useHotkeySequence(
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    () => addToHistory('↑↑↓↓ → Konami code (partial)'),
    { timeout: 1500 },
  )

  useHotkeySequence(
    ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
    () => addToHistory('←→←→ → Side to side!'),
    { timeout: 1500 },
  )

  useHotkeySequence(['H', 'E', 'L', 'L', 'O'], () =>
    addToHistory('hello → Hello World!'),
  )

  useHotkeySequence(['Shift+R', 'Shift+T'], () =>
    addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
  )

  // Clear history with Escape
  useHotkey('Escape', () => {
    setLastSequence(null)
    setHistory([])
  })

  return (
    <div className="app">
      <header>
        <h1>useHotkeySequence</h1>
        <p>
          Register multi-key sequences (like Vim commands). Keys must be pressed
          within the timeout window (default: 1000ms).
        </p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Vim-Style Commands</h2>
          <table className="sequence-table">
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

        <section className="demo-section">
          <h2>Fun Sequences</h2>
          <div className="fun-sequences">
            <div className="sequence-card">
              <h3>Konami Code (Partial)</h3>
              <p>
                <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd>
              </p>
              <span className="hint">Use arrow keys within 1.5 seconds</span>
            </div>
            <div className="sequence-card">
              <h3>Side to Side</h3>
              <p>
                <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd>
              </p>
              <span className="hint">Arrow keys within 1.5 seconds</span>
            </div>
            <div className="sequence-card">
              <h3>Spell It Out</h3>
              <p>
                <kbd>h</kbd> <kbd>e</kbd> <kbd>l</kbd> <kbd>l</kbd> <kbd>o</kbd>
              </p>
              <span className="hint">Type "hello" quickly</span>
            </div>
          </div>
        </section>

        {lastSequence && (
          <div className="info-box success">
            <strong>Triggered:</strong> {lastSequence}
          </div>
        )}

        <section className="demo-section">
          <h2>Input handling</h2>
          <p>
            Sequences are not detected when typing in text inputs, textareas,
            selects, or contenteditable elements. Button-type inputs (
            <code>type="button"</code>, <code>submit</code>, <code>reset</code>)
            still receive sequences. Focus the input below and try <kbd>g</kbd>{' '}
            <kbd>g</kbd> or <kbd>h</kbd>
            <kbd>e</kbd>
            <kbd>l</kbd>
            <kbd>l</kbd>
            <kbd>o</kbd> — nothing will trigger. Click outside to try again.
          </p>
          <input
            type="text"
            className="demo-input"
            placeholder="Focus here – sequences won't trigger while typing..."
          />
        </section>

        <section className="demo-section">
          <h2>Chained Shift+letter sequences</h2>
          <p>
            Each step is a chord: hold <kbd>Shift</kbd> and press a letter. You
            can press <kbd>Shift</kbd> alone between steps—those modifier-only
            presses do not reset progress, so the next chord still counts.
          </p>
          <table className="sequence-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>Shift</kbd>+<kbd>r</kbd> then <kbd>Shift</kbd>+
                  <kbd>t</kbd>
                </td>
                <td>Chained Shift+letter (2 steps)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import { useHotkeySequence } from '@tanstack/react-hotkeys'

function VimEditor() {
  // Basic sequence
  useHotkeySequence(['G', 'G'], () => {
    scrollToTop()
  })

  // With custom timeout (1.5 seconds)
  useHotkeySequence(
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    () => activateCheatMode(),
    { timeout: 1500 }
  )

  // Three-key sequence
  useHotkeySequence(['C', 'I', 'W'], () => {
    changeInnerWord()
  })

  // Same modifier on each step (Shift+letter, then Shift+letter)
  useHotkeySequence(['Shift+R', 'Shift+T'], () => {
    doSomething()
  })
}`}</pre>
        </section>

        {history.length > 0 && (
          <section className="demo-section">
            <h2>History</h2>
            <ul className="history-list">
              {history.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <button onClick={() => setHistory([])}>Clear History</button>
          </section>
        )}

        <p className="hint">
          Press <kbd>Escape</kbd> to clear history
        </p>
      </main>

      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // optionally, provide default options to an optional HotkeysProvider
  <HotkeysProvider
  // defaultOptions={{
  //   hotkeySequence: {
  //     timeout: 1500,
  //   },
  // }}
  >
    <App />
  </HotkeysProvider>,
)
