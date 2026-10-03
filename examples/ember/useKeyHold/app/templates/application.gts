import Component from '@glimmer/component'

import { on } from '@ember/modifier'

import { useKeyHold } from '@tanstack/ember-hotkeys'

class App extends Component {
  usage0 =
    "import { useKeyHold } from '@tanstack/ember-hotkeys'\n\nshift = useKeyHold(this, 'Shift')\n\n<template>\n  {{if this.shift.value 'Shift is pressed!' 'Press Shift'}}\n</template>"
  isShiftHeld = useKeyHold(this, 'Shift')
  isControlHeld = useKeyHold(this, 'Control')
  isAltHeld = useKeyHold(this, 'Alt')
  isMetaHeld = useKeyHold(this, 'Meta')
  isSpaceHeld = useKeyHold(this, 'Space')

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
            <div class='modifier-indicator {{if this.isShiftHeld.value "active"}}'>
              <span class='key-name'>Shift</span>
              <span class='status'>
                {{if this.isShiftHeld.value 'HELD' 'Released'}}
              </span>
            </div>
            <div
              class='modifier-indicator {{if this.isControlHeld.value "active"}}'
            >
              <span class='key-name'>Control</span>
              <span class='status'>
                {{if this.isControlHeld.value 'HELD' 'Released'}}
              </span>
            </div>
            <div class='modifier-indicator {{if this.isAltHeld.value "active"}}'>
              <span class='key-name'>Alt / Option</span>
              <span class='status'>{{if
                  this.isAltHeld.value
                  'HELD'
                  'Released'
                }}</span>
            </div>
            <div class='modifier-indicator {{if this.isMetaHeld.value "active"}}'>
              <span class='key-name'>Meta (⌘ / ⊞)</span>
              <span class='status'>{{if
                  this.isMetaHeld.value
                  'HELD'
                  'Released'
                }}</span>
            </div>
          </div>
        </section>

        <section class='demo-section'>
          <h2>Space Bar Demo</h2>
          <div class='space-indicator {{if this.isSpaceHeld.value "active"}}'>
            {{if this.isSpaceHeld.value '🚀 SPACE HELD!' 'Hold Space Bar'}}
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
          <div class='secret-box {{if this.isShiftHeld.value "revealed"}}'>
            {{#if this.isShiftHeld.value}}<span>🎉 The secret password is:
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
