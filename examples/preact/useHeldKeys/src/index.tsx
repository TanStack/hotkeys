import React from 'preact/compat'
import { render } from 'preact'
import {
  formatKeyForDebuggingDisplay,
  useHeldKeys,
  useHeldKeyCodes,
} from '@tanstack/preact-hotkeys'
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import './index.css'

function App() {
  const heldKeys = useHeldKeys()
  const heldCodes = useHeldKeyCodes()

  // Track history of key combinations
  const [history, setHistory] = React.useState<Array<string>>([])

  React.useEffect(() => {
    if (heldKeys.length > 0) {
      const combo = heldKeys
        .map((k) => formatKeyForDebuggingDisplay(k))
        .join(' + ')
      setHistory((h) => {
        // Only add if different from last entry
        if (h[h.length - 1] !== combo) {
          return [...h.slice(-9), combo]
        }
        return h
      })
    }
  }, [heldKeys])

  console.log('heldKeys', heldKeys)

  return (
    <div className="app">
      <header>
        <h1>useHeldKeys</h1>
        <p>
          Returns an array of all currently pressed keys. Useful for displaying
          key combinations or building custom shortcut recording.
        </p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Currently Held Keys</h2>
          <div className="key-display">
            {heldKeys.length > 0 ? (
              heldKeys.map((key, index) => {
                const code = heldCodes[key]
                return (
                  <React.Fragment key={key}>
                    {index > 0 && <span className="plus">+</span>}
                    <kbd className="large">
                      {formatKeyForDebuggingDisplay(key)}
                      {code && code !== key && (
                        <small className="code-label">
                          {formatKeyForDebuggingDisplay(code, {
                            source: 'code',
                          })}
                        </small>
                      )}
                    </kbd>
                  </React.Fragment>
                )
              })
            ) : (
              <span className="placeholder">Press any keys...</span>
            )}
          </div>
          <div className="stats">
            Keys held: <strong>{heldKeys.length}</strong>
          </div>
        </section>

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import { useHeldKeys } from '@tanstack/preact-hotkeys'

function KeyDisplay() {
  const heldKeys = useHeldKeys()

  return (
    <div>
      Currently pressed: {heldKeys.join(' + ') || 'None'}
    </div>
  )
}`}</pre>
        </section>

        <section className="demo-section">
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

        <section className="demo-section">
          <h2>Recent Combinations</h2>
          {history.length > 0 ? (
            <ul className="history-list">
              {history.map((combo, i) => (
                <li key={i}>{combo}</li>
              ))}
            </ul>
          ) : (
            <p className="placeholder">Press some key combinations...</p>
          )}
          <button onClick={() => setHistory([])}>Clear History</button>
        </section>

        <section className="demo-section">
          <h2>Use Cases</h2>
          <ul>
            <li>Building a keyboard shortcut recorder</li>
            <li>Displaying currently held keys to users</li>
            <li>Debugging keyboard input</li>
            <li>Creating key combination tutorials</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

render(
  // optionally, provide default options to an optional HotkeysProvider
  <HotkeysProvider
  // defaultOptions={{
  //   hotkey: {
  //     preventDefault: true,
  //   },
  // }}
  >
    <App />
  </HotkeysProvider>,
  document.getElementById('root')!,
)

