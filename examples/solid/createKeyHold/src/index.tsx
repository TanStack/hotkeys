/* @refresh reload */
import { render } from 'solid-js/web'
import { createKeyHold, HotkeysProvider } from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import './index.css'

function App() {
  const isShiftHeld = createKeyHold('Shift')
  const isControlHeld = createKeyHold('Control')
  const isAltHeld = createKeyHold('Alt')
  const isMetaHeld = createKeyHold('Meta')
  const isSpaceHeld = createKeyHold('Space')

  return (
    <div class="app">
      <header>
        <h1>createKeyHold</h1>
        <p>
          Returns an accessor indicating if a specific key is currently held.
          Optimized to only update when that specific key changes.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Modifier Key States</h2>
          <div class="modifier-grid">
            <div class={`modifier-indicator ${isShiftHeld() ? 'active' : ''}`}>
              <span class="key-name">Shift</span>
              <span class="status">{isShiftHeld() ? 'HELD' : 'Released'}</span>
            </div>
            <div
              class={`modifier-indicator ${isControlHeld() ? 'active' : ''}`}
            >
              <span class="key-name">Control</span>
              <span class="status">
                {isControlHeld() ? 'HELD' : 'Released'}
              </span>
            </div>
            <div class={`modifier-indicator ${isAltHeld() ? 'active' : ''}`}>
              <span class="key-name">Alt / Option</span>
              <span class="status">{isAltHeld() ? 'HELD' : 'Released'}</span>
            </div>
            <div class={`modifier-indicator ${isMetaHeld() ? 'active' : ''}`}>
              <span class="key-name">Meta (⌘ / ⊞)</span>
              <span class="status">{isMetaHeld() ? 'HELD' : 'Released'}</span>
            </div>
          </div>
        </section>

        <section class="demo-section">
          <h2>Space Bar Demo</h2>
          <div class={`space-indicator ${isSpaceHeld() ? 'active' : ''}`}>
            {isSpaceHeld() ? '🚀 SPACE HELD!' : 'Hold Space Bar'}
          </div>
        </section>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import { createKeyHold } from '@tanstack/solid-hotkeys'

function ShiftIndicator() {
  const isShiftHeld = createKeyHold('Shift')

  return (
    <div style={{ opacity: isShiftHeld() ? 1 : 0.5 }}>
      {isShiftHeld() ? 'Shift is pressed!' : 'Press Shift'}
    </div>
  )
}`}</pre>
        </section>

        <section class="demo-section">
          <h2>Conditional UI Example</h2>
          <p>
            Hold <kbd>Shift</kbd> to reveal the secret message:
          </p>
          <div class={`secret-box ${isShiftHeld() ? 'revealed' : ''}`}>
            {isShiftHeld() ? (
              <span>🎉 The secret password is: tanstack-hotkeys-rocks!</span>
            ) : (
              <span>••••••••••••••••••••••••••</span>
            )}
          </div>
        </section>

        <section class="demo-section">
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
