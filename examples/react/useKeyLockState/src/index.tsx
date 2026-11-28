import { TanStackDevtools } from '@tanstack/react-devtools'
import { HotkeysProvider, useKeyLockState } from '@tanstack/react-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import ReactDOM from 'react-dom/client'
import './index.css'

const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

function describe(state: boolean | null) {
  if (state === null) return 'Unknown'
  return state ? 'On' : 'Off'
}

function App() {
  const capsLock = useKeyLockState('CapsLock')
  const numLock = useKeyLockState('NumLock')
  const scrollLock = useKeyLockState('ScrollLock')

  const locks = [
    { name: 'Caps Lock', state: capsLock },
    { name: 'Num Lock', state: numLock },
    { name: 'Scroll Lock', state: scrollLock },
  ]

  return (
    <div className="app">
      <h1>useKeyLockState</h1>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
        <p role="status" className="warning">
          {capsLock === true ? 'Caps Lock is on' : ''}
        </p>
      </div>

      <div className="locks">
        {locks.map((lock) => (
          <div
            key={lock.name}
            className={`lock ${lock.state === true ? 'on' : ''}`}
          >
            <span className="lock-name">{lock.name}</span>
            <span>{describe(lock.state)}</span>
          </div>
        ))}
      </div>

      <p className="note">
        Unknown until you press a key, click, or move the mouse. Num Lock and
        Scroll Lock stay unknown on macOS.
      </p>

      <TanStackDevtools plugins={devtoolsPlugins} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HotkeysProvider>
    <App />
  </HotkeysProvider>,
)
