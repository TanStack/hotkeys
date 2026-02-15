/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, createEffect } from 'solid-js'
import {
  formatKeyForDebuggingDisplay,
  createHeldKeys,
  createHeldKeyCodes,
  HotkeysProvider,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import './index.css'

function App() {
  const heldKeys = createHeldKeys()
  const heldCodes = createHeldKeyCodes()
  const [history, setHistory] = createSignal<Array<string>>([])

  createEffect(() => {
    const keys = heldKeys()
    if (keys.length > 0) {
      const combo = keys.map((k) => formatKeyForDebuggingDisplay(k)).join(' + ')
      setHistory((h) => {
        if (h[h.length - 1] !== combo) {
          return [...h.slice(-9), combo]
        }
        return h
      })
    }
  })

  return (
    <div class="app">
      <header>
        <h1>createHeldKeys</h1>
        <p>
          Returns a signal of all currently pressed keys. Useful for displaying
          key combinations or building custom shortcut recording.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Currently Held Keys</h2>
          <div class="key-display">
            {heldKeys().length > 0 ? (
              heldKeys().map((key, index) => {
                const code = heldCodes()[key]
                return (
                  <>
                    {index > 0 && <span class="plus">+</span>}
                    <kbd class="large">
                      {formatKeyForDebuggingDisplay(key)}
                      {code && code !== key && (
                        <small class="code-label">
                          {formatKeyForDebuggingDisplay(code, {
                            source: 'code',
                          })}
                        </small>
                      )}
                    </kbd>
                  </>
                )
              })
            ) : (
              <span class="placeholder">Press any keys...</span>
            )}
          </div>
          <div class="stats">
            Keys held: <strong>{heldKeys().length}</strong>
          </div>
        </section>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import { createHeldKeys } from '@tanstack/solid-hotkeys'

function KeyDisplay() {
  const heldKeys = createHeldKeys()

  return (
    <div>
      Currently pressed: {heldKeys().join(' + ') || 'None'}
    </div>
  )
}`}</pre>
        </section>

        <section class="demo-section">
          <h2>Try These Combinations</h2>
          <ul>
            <li>
              Hold <kbd>Shift</kbd> + <kbd>Control</kbd> + <kbd>A</kbd>
            </li>
            <li>Press multiple letter keys at once</li>
            <li>Hold modifiers and watch them appear</li>
            <li>Release keys one by one</li>
          </ul>
        </section>

        <section class="demo-section">
          <h2>Recent Combinations</h2>
          {history().length > 0 ? (
            <ul class="history-list">
              {history().map((combo, i) => (
                <li>{combo}</li>
              ))}
            </ul>
          ) : (
            <p class="placeholder">Press some key combinations...</p>
          )}
          <button onClick={() => setHistory([])}>Clear History</button>
        </section>

        <section class="demo-section">
          <h2>Use Cases</h2>
          <ul>
            <li>Building a keyboard shortcut recorder</li>
            <li>Displaying currently held keys to users</li>
            <li>Debugging keyboard input</li>
            <li>Creating key combination tutorials</li>
          </ul>
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
