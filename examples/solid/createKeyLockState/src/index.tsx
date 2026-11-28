/* @refresh reload */

import { render } from '@solidjs/web'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { createKeyLockState, HotkeysProvider } from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import './index.css'

function describe(state: boolean | null) {
  if (state === null) return 'Unknown'
  return state ? 'On' : 'Off'
}

function App() {
  const capsLock = createKeyLockState('CapsLock')
  const numLock = createKeyLockState('NumLock')
  const scrollLock = createKeyLockState('ScrollLock')

  return (
    <div class="app">
      <h1>createKeyLockState</h1>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" type="password" />
        <p role="status" class="warning">
          {capsLock() === true ? 'Caps Lock is on' : ''}
        </p>
      </div>

      <div class="locks">
        <div class={`lock ${capsLock() === true ? 'on' : ''}`}>
          <span class="lock-name">Caps Lock</span>
          <span>{describe(capsLock())}</span>
        </div>
        <div class={`lock ${numLock() === true ? 'on' : ''}`}>
          <span class="lock-name">Num Lock</span>
          <span>{describe(numLock())}</span>
        </div>
        <div class={`lock ${scrollLock() === true ? 'on' : ''}`}>
          <span class="lock-name">Scroll Lock</span>
          <span>{describe(scrollLock())}</span>
        </div>
      </div>

      <p class="note">
        Unknown until you press a key, click, or move the mouse. Num Lock and
        Scroll Lock stay unknown on macOS.
      </p>

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
