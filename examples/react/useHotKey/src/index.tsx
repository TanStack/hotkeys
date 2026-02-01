import React from 'react'
import ReactDOM from 'react-dom/client'
import {  formatForDisplay, useHotkey } from '@tanstack/react-keys'
import type {Hotkey} from '@tanstack/react-keys'
import './index.css'

function App() {
  const [lastHotkey, setLastHotkey] = React.useState<Hotkey | null>(null)
  const [saveCount, setSaveCount] = React.useState(0)
  const [incrementCount, setIncrementCount] = React.useState(0)
  const [enabled, setEnabled] = React.useState(true)

  // Basic hotkey with callback context
  useHotkey(
    'Mod+S',
    (event, { hotkey, parsedHotkey }) => {
      event.preventDefault()
      setLastHotkey(hotkey)
      setSaveCount((c) => c + 1)
      console.log('Hotkey triggered:', hotkey)
      console.log('Parsed hotkey:', parsedHotkey)
    },
    { preventDefault: true },
  )

  // requireReset prevents repeated triggering while holding keys
  useHotkey(
    'Mod+K',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      setIncrementCount((c) => c + 1)
    },
    { requireReset: true },
  )

  // Conditional hotkey (enabled/disabled)
  useHotkey(
    'Mod+E',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      alert('This hotkey can be toggled!')
    },
    { enabled },
  )

  // Clear with Escape
  useHotkey('Escape', () => {
    setLastHotkey(null)
    setSaveCount(0)
    setIncrementCount(0)
  })

  return (
    <div className="app">
      <header>
        <h1>useHotkey</h1>
        <p>
          Register keyboard shortcuts with callback context containing the
          hotkey and parsed hotkey information.
        </p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Basic Hotkey</h2>
          <p>
            Press <kbd>{formatForDisplay('Mod+S')}</kbd> to trigger
          </p>
          <div className="counter">Save triggered: {saveCount}x</div>
          <pre className="code-block">{`useHotkey(
  'Mod+S',
  (event, { hotkey, parsedHotkey }) => {
    event.preventDefault()
    console.log('Hotkey:', hotkey)
    console.log('Parsed:', parsedHotkey)
  },
  { preventDefault: true }
)`}</pre>
        </section>

        <section className="demo-section">
          <h2>With requireReset</h2>
          <p>
            Hold <kbd>{formatForDisplay('Mod+K')}</kbd> — only increments once
            until you release all keys
          </p>
          <div className="counter">Increment: {incrementCount}</div>
          <p className="hint">
            This prevents repeated triggering while holding the keys down.
            Release all keys to allow re-triggering.
          </p>
          <pre className="code-block">{`useHotkey(
  'Mod+K',
  (event, { hotkey }) => {
    setCount(c => c + 1)
  },
  { requireReset: true }
)`}</pre>
        </section>

        <section className="demo-section">
          <h2>Conditional Hotkey</h2>
          <p>
            <kbd>{formatForDisplay('Mod+E')}</kbd> is currently{' '}
            <strong>{enabled ? 'enabled' : 'disabled'}</strong>
          </p>
          <button onClick={() => setEnabled(!enabled)}>
            {enabled ? 'Disable' : 'Enable'} Hotkey
          </button>
          <pre className="code-block">{`const [enabled, setEnabled] = useState(true)

useHotkey(
  'Mod+E',
  (event, { hotkey }) => {
    alert('Triggered!')
  },
  { enabled }
)`}</pre>
        </section>

        {lastHotkey && (
          <div className="info-box">
            <strong>Last triggered:</strong> {formatForDisplay(lastHotkey)}
          </div>
        )}

        <p className="hint">
          Press <kbd>Escape</kbd> to reset all counters
        </p>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
