/* @refresh reload */
import { render } from 'solid-js/web'
import { For, Show, createSignal } from 'solid-js'
import {
  HotkeysProvider,
  createHotkey,
  createHotkeyRegistrations,
  createHotkeySequences,
  formatForDisplay,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import './index.css'

function App() {
  const [lastSequence, setLastSequence] = createSignal<string | null>(null)
  const [history, setHistory] = createSignal<Array<string>>([])
  const [helloSequenceEnabled, setHelloSequenceEnabled] = createSignal(true)
  const addToHistory = (action: string) => {
    setLastSequence(action)
    setHistory((h) => [...h.slice(-9), action])
  }

  createHotkeySequences([
    {
      sequence: ['G', 'G'],
      callback: () => addToHistory('gg \u2192 Go to top'),
      options: {
        meta: {
          name: 'Go to top',
          description: 'Scroll to the beginning of the document',
        },
      },
    },
    {
      sequence: ['Shift+G'],
      callback: () => addToHistory('G \u2192 Go to bottom'),
      options: {
        meta: {
          name: 'Go to bottom',
          description: 'Scroll to the end of the document',
        },
      },
    },
    {
      sequence: ['D', 'D'],
      callback: () => addToHistory('dd \u2192 Delete line'),
      options: {
        meta: {
          name: 'Delete line',
          description: 'Delete the current line',
        },
      },
    },
    {
      sequence: ['Y', 'Y'],
      callback: () => addToHistory('yy \u2192 Yank (copy) line'),
      options: {
        meta: {
          name: 'Yank line',
          description: 'Copy the current line to clipboard',
        },
      },
    },
    {
      sequence: ['D', 'W'],
      callback: () => addToHistory('dw \u2192 Delete word'),
      options: {
        meta: {
          name: 'Delete word',
          description: 'Delete from cursor to end of word',
        },
      },
    },
    {
      sequence: ['C', 'I', 'W'],
      callback: () => addToHistory('ciw \u2192 Change inner word'),
      options: {
        meta: {
          name: 'Change inner word',
          description: 'Delete word under cursor and enter insert mode',
        },
      },
    },
    {
      sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
      callback: () =>
        addToHistory('\u2191\u2191\u2193\u2193 \u2192 Konami code (partial)'),
      options: {
        timeout: 1500,
        meta: {
          name: 'Konami code',
          description: 'Partial Konami code using arrow keys',
        },
      },
    },
    {
      sequence: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
      callback: () =>
        addToHistory('\u2190\u2192\u2190\u2192 \u2192 Side to side!'),
      options: {
        timeout: 1500,
        meta: {
          name: 'Side to side',
          description: 'Left-right-left-right arrow pattern',
        },
      },
    },
    {
      sequence: ['H', 'E', 'L', 'L', 'O'],
      callback: () => addToHistory('hello \u2192 Hello World!'),
      options: {
        get enabled() {
          return helloSequenceEnabled()
        },
        meta: {
          name: 'Hello',
          description: 'Spell out hello to trigger',
        },
      },
    },
    {
      sequence: ['Shift+R', 'Shift+T'],
      callback: () =>
        addToHistory('\u21E7R \u21E7T \u2192 Chained Shift+letter (2 steps)'),
      options: {
        meta: {
          name: 'Chained Shift',
          description: 'Two consecutive Shift+letter chords',
        },
      },
    },
  ])

  // Clear history with Escape
  createHotkey('Escape', () => {
    setLastSequence(null)
    setHistory([])
  })

  return (
    <div class="app">
      <header>
        <h1>createHotkeySequences</h1>
        <p>
          Register many multi-key sequences in one primitive (like Vim
          commands). Keys must be pressed within the timeout window (default:
          1000ms).
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
                <kbd>{'\u2191'}</kbd> <kbd>{'\u2191'}</kbd>{' '}
                <kbd>{'\u2193'}</kbd> <kbd>{'\u2193'}</kbd>
              </p>
              <span class="hint">Use arrow keys within 1.5 seconds</span>
            </div>
            <div class="sequence-card">
              <h3>Side to Side</h3>
              <p>
                <kbd>{'\u2190'}</kbd> <kbd>{'\u2192'}</kbd>{' '}
                <kbd>{'\u2190'}</kbd> <kbd>{'\u2192'}</kbd>
              </p>
              <span class="hint">Arrow keys within 1.5 seconds</span>
            </div>
            <div class="sequence-card">
              <h3>Spell It Out</h3>
              <p>
                <kbd>h</kbd> <kbd>e</kbd> <kbd>l</kbd> <kbd>l</kbd> <kbd>o</kbd>
              </p>
              <span class="hint">Type "hello" quickly</span>
              <p class="sequence-toggle-status">
                This sequence is{' '}
                <strong>
                  {helloSequenceEnabled() ? 'enabled' : 'disabled'}
                </strong>
                .
              </p>
              <button
                type="button"
                onClick={() => setHelloSequenceEnabled(!helloSequenceEnabled())}
              >
                {helloSequenceEnabled() ? 'Disable' : 'Enable'} sequence
              </button>
            </div>
          </div>
        </section>

        <Show when={lastSequence()}>
          <div class="info-box success">
            <strong>Triggered:</strong> {lastSequence()}
          </div>
        </Show>

        <section class="demo-section">
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
            class="demo-input"
            placeholder="Focus here \u2013 sequences won't trigger while typing..."
          />
        </section>

        <section class="demo-section">
          <h2>Chained Shift+letter sequences</h2>
          <p>
            Each step is a chord: hold <kbd>Shift</kbd> and press a letter. You
            can press <kbd>Shift</kbd> alone between steps—those modifier-only
            presses do not reset progress, so the next chord still counts.
          </p>
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
                  <kbd>Shift</kbd>+<kbd>r</kbd> then <kbd>Shift</kbd>+
                  <kbd>t</kbd>
                </td>
                <td>Chained Shift+letter (2 steps)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <RegistrationsViewer />

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import { createHotkeySequences, createHotkeyRegistrations } from '@tanstack/solid-hotkeys'

function VimEditor() {
  createHotkeySequences([
    {
      sequence: ['G', 'G'],
      callback: () => scrollToTop(),
      options: { meta: { name: 'Go to top', description: 'Scroll to top' } },
    },
    {
      sequence: ['C', 'I', 'W'],
      callback: () => changeInnerWord(),
      options: { meta: { name: 'Change inner word' } },
    },
  ])

  // Introspect all registrations
  const { sequences } = createHotkeyRegistrations()
  // sequences()[0].options.meta?.name → 'Go to top'
  // sequences()[0].triggerCount → 3
}`}</pre>
        </section>

        <Show when={history().length > 0}>
          <section class="demo-section">
            <h2>History</h2>
            <ul class="history-list">
              <For each={history()}>{(item) => <li>{item}</li>}</For>
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

// ---------------------------------------------------------------------------
// Live registrations viewer using createHotkeyRegistrations
// ---------------------------------------------------------------------------

function RegistrationsViewer() {
  const { hotkeys, sequences } = createHotkeyRegistrations()

  return (
    <section class="demo-section">
      <h2>Live Registrations (createHotkeyRegistrations)</h2>
      <p>
        This table is rendered from <code>createHotkeyRegistrations()</code> — a
        reactive view of all registered hotkeys and sequences. Trigger counts
        update in real-time.
      </p>

      <Show when={hotkeys().length > 0}>
        <h3>Hotkeys</h3>
        <table class="registrations-table">
          <thead>
            <tr>
              <th>Hotkey</th>
              <th>Name</th>
              <th>Description</th>
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
                  <td class="trigger-count">{reg.triggerCount}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      <h3>Sequences ({sequences().length})</h3>
      <table class="registrations-table">
        <thead>
          <tr>
            <th>Sequence</th>
            <th>Name</th>
            <th>Description</th>
            <th>Enabled</th>
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
          <Show when={sequences().length === 0}>
            <tr>
              <td colSpan={5} class="hint">
                No sequences registered
              </td>
            </tr>
          </Show>
        </tbody>
      </table>
    </section>
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
