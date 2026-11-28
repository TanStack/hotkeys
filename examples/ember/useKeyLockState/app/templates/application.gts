import Component from '@glimmer/component'

import { useKeyLockState } from '@tanstack/ember-hotkeys'

const describe = (state: boolean | null) => {
  if (state === null) return 'Unknown'
  return state ? 'On' : 'Off'
}

class App extends Component {
  capsLock = useKeyLockState(this, 'CapsLock')
  numLock = useKeyLockState(this, 'NumLock')
  scrollLock = useKeyLockState(this, 'ScrollLock')

  get locks() {
    return [
      { name: 'Caps Lock', state: this.capsLock.value },
      { name: 'Num Lock', state: this.numLock.value },
      { name: 'Scroll Lock', state: this.scrollLock.value },
    ]
  }

  get isCapsLockOn() {
    return this.capsLock.value === true
  }

  <template>
    <div class='app'>
      <h1>useKeyLockState</h1>

      <div class='field'>
        <label for='password'>Password</label>
        <input id='password' type='password' />
        <p role='status' class='warning'>
          {{if this.isCapsLockOn 'Caps Lock is on'}}
        </p>
      </div>

      <div class='locks'>
        {{#each this.locks as |lock|}}
          <div class='lock {{if lock.state "on"}}'>
            <span class='lock-name'>{{lock.name}}</span>
            <span>{{describe lock.state}}</span>
          </div>
        {{/each}}
      </div>

      <p class='note'>
        Unknown until you press a key, click, or move the mouse. Num Lock and
        Scroll Lock stay unknown on macOS.
      </p>
    </div>
  </template>
}
export default App
