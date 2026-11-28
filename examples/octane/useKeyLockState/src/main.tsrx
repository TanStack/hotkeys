import { createRoot } from 'octane'

import { HotkeysProvider, useKeyLockState } from '@tanstack/octane-hotkeys'

import './index.css'

function describe(state: boolean | null) {
  if (state === null) return 'Unknown'
  return state ? 'On' : 'Off'
}

function App() @{
  const capsLock = useKeyLockState('CapsLock')
  const numLock = useKeyLockState('NumLock')
  const scrollLock = useKeyLockState('ScrollLock')
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
      <div className={`lock ${capsLock === true ? 'on' : ''}`}>
        <span className="lock-name">Caps Lock</span>
        <span>{describe(capsLock)}</span>
      </div>
      <div className={`lock ${numLock === true ? 'on' : ''}`}>
        <span className="lock-name">Num Lock</span>
        <span>{describe(numLock)}</span>
      </div>
      <div className={`lock ${scrollLock === true ? 'on' : ''}`}>
        <span className="lock-name">Scroll Lock</span>
        <span>{describe(scrollLock)}</span>
      </div>
    </div>

    <p className="note">
      Unknown until you press a key, click, or move the mouse. Num Lock and
      Scroll Lock stay unknown on macOS.
    </p>
  </div>
}

function Root() @{
<HotkeysProvider><App /></HotkeysProvider>
}

const root = createRoot(document.getElementById('root')!)
root.render(Root)
import.meta.hot?.dispose(() => root.unmount())
