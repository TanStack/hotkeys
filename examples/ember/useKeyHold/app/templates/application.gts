import Component from '@glimmer/component'

import { on } from '@ember/modifier'

import { useKeyHold } from '@tanstack/ember-hotkeys'

class App extends Component {
  usage0 =
    "import { useKeyHold } from '@tanstack/ember-hotkeys'\n\nshift = useKeyHold(this, 'Shift')\n\n<template>\n  {{if this.shift.value 'Shift is pressed!' 'Press Shift'}}\n</template>"
  isShiftHeldState = useKeyHold(this, () => 'Shift')
  isControlHeldState = useKeyHold(this, () => 'Control')
  isAltHeldState = useKeyHold(this, () => 'Alt')
  isMetaHeldState = useKeyHold(this, () => 'Meta')
  isSpaceHeldState = useKeyHold(this, () => 'Space')
  get value1() {
    return `modifier-indicator ${this.isShiftHeld ? 'active' : ''}`
  }
  get value2() {
    return `modifier-indicator ${this.isControlHeld ? 'active' : ''}`
  }
  get value3() {
    return `modifier-indicator ${this.isAltHeld ? 'active' : ''}`
  }
  get value4() {
    return `modifier-indicator ${this.isMetaHeld ? 'active' : ''}`
  }
  get value5() {
    return `space-indicator ${this.isSpaceHeld ? 'active' : ''}`
  }
  get value6() {
    return `secret-box ${this.isShiftHeld ? 'revealed' : ''}`
  }
  get isShiftHeld() {
    return this.isShiftHeldState.value
  }
  get isControlHeld() {
    return this.isControlHeldState.value
  }
  get isAltHeld() {
    return this.isAltHeldState.value
  }
  get isMetaHeld() {
    return this.isMetaHeldState.value
  }
  get isSpaceHeld() {
    return this.isSpaceHeldState.value
  }

  <template>
    <div class='app'>
      <header>
        <h1>useKeyHold</h1>
        <p>
          Returns a boolean indicating if a specific key is currently held.
          Optimized to only re-render when that specific key changes.
        </p>
      </header>

      <main>
        <section class='demo-section'>
          <h2>Modifier Key States</h2>
          <div class='modifier-grid'>
            <div class={{this.value1}}>
              <span class='key-name'>Shift</span>
              <span class='status'>
                {{if this.isShiftHeld 'HELD' 'Released'}}
              </span>
            </div>
            <div class={{this.value2}}>
              <span class='key-name'>Control</span>
              <span class='status'>
                {{if this.isControlHeld 'HELD' 'Released'}}
              </span>
            </div>
            <div class={{this.value3}}>
              <span class='key-name'>Alt / Option</span>
              <span class='status'>{{if this.isAltHeld 'HELD' 'Released'}}</span>
            </div>
            <div class={{this.value4}}>
              <span class='key-name'>Meta (⌘ / ⊞)</span>
              <span class='status'>{{if this.isMetaHeld 'HELD' 'Released'}}</span>
            </div>
          </div>
        </section>

        <section class='demo-section'>
          <h2>Space Bar Demo</h2>
          <div class={{this.value5}}>
            {{if this.isSpaceHeld '🚀 SPACE HELD!' 'Hold Space Bar'}}
          </div>
        </section>

        <section class='demo-section'>
          <h2>Usage</h2>
          <pre class='code-block'>{{this.usage0}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Conditional UI Example</h2>
          <p>
            Hold
            <kbd>Shift</kbd>
            to reveal the secret message:
          </p>
          <div class={{this.value6}}>
            {{#if this.isShiftHeld}}<span>🎉 The secret password is:
                tanstack-hotkeys-rocks!</span>{{else}}<span
              >••••••••••••••••••••••••••</span>{{/if}}
          </div>
        </section>

        <section class='demo-section'>
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
  </template>
}
export default App
