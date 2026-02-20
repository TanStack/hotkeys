import { render } from 'preact'
import { useKeyHold } from '@tanstack/preact-hotkeys'
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import './index.css'

function App() {
  // const isModHeld = useKeyHold('')
  const isShiftHeld = useKeyHold('Shift')
  const isControlHeld = useKeyHold('Control')
  const isAltHeld = useKeyHold('Alt')
  const isMetaHeld = useKeyHold('Meta')
  const isSpaceHeld = useKeyHold('Space')

  return (
    <div className="app">
      <header>
        <h1>useKeyHold</h1>
        <p>
          Returns a boolean indicating if a specific key is currently held.
          Optimized to only re-render when that specific key changes.
        </p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Modifier Key States</h2>
          <div className="modifier-grid">
            <div
              className={`modifier-indicator ${isShiftHeld ? 'active' : ''}`}
            >
              <span className="key-name">Shift</span>
              <span className="status">
                {isShiftHeld ? 'HELD' : 'Released'}
              </span>
            </div>
            <div
              className={`modifier-indicator ${isControlHeld ? 'active' : ''}`}
            >
              <span className="key-name">Control</span>
              <span className="status">
                {isControlHeld ? 'HELD' : 'Released'}
              </span>
            </div>
            <div className={`modifier-indicator ${isAltHeld ? 'active' : ''}`}>
              <span className="key-name">Alt / Option</span>
              <span className="status">{isAltHeld ? 'HELD' : 'Released'}</span>
            </div>
            <div className={`modifier-indicator ${isMetaHeld ? 'active' : ''}`}>
              <span className="key-name">Meta (⌘ / ⊞)</span>
              <span className="status">{isMetaHeld ? 'HELD' : 'Released'}</span>
            </div>
          </div>
        </section>

        <section className="demo-section">
          <h2>Space Bar Demo</h2>
          <div className={`space-indicator ${isSpaceHeld ? 'active' : ''}`}>
            {isSpaceHeld ? '🚀 SPACE HELD!' : 'Hold Space Bar'}
          </div>
        </section>

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import { useKeyHold } from '@tanstack/preact-hotkeys'

function ShiftIndicator() {
  const isShiftHeld = useKeyHold('Shift')

  return (
    <div style={{ opacity: isShiftHeld ? 1 : 0.5 }}>
      {isShiftHeld ? 'Shift is pressed!' : 'Press Shift'}
    </div>
  )
}`}</pre>
        </section>

        <section className="demo-section">
          <h2>Conditional UI Example</h2>
          <p>
            Hold <kbd>Shift</kbd> to reveal the secret message:
          </p>
          <div className={`secret-box ${isShiftHeld ? 'revealed' : ''}`}>
            {isShiftHeld ? (
              <span>🎉 The secret password is: tanstack-hotkeys-rocks!</span>
            ) : (
              <span>••••••••••••••••••••••••••</span>
            )}
          </div>
        </section>

        <section className="demo-section">
          <h2>Use Cases</h2>
          <ul>
            <li>Show different UI based on modifier state</li>
            <li>Enable "power user" mode while holding a key</li>
            <li>Hold-to-reveal sensitive information</li>
            <li>Drag-and-drop with modifier behaviors</li>
            <li>Show additional options on hover + modifier</li>
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

