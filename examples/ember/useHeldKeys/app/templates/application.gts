import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { registerDestructor } from '@ember/destroyable'
import { on } from '@ember/modifier'
import { hash } from '@ember/helper'
import {
  formatForDisplay,
  useHeldKeys,
  useHeldKeyCodes,
  getKeyStateTracker,
} from '@tanstack/ember-hotkeys'

const neq = (a: unknown, b: unknown) => a !== b
const gt = (a: number, b: number) => a > b
const and = (a: unknown, b: unknown) => a && b

class App extends Component {
  usage0 =
    "import { useHeldKeys, useHeldKeyCodes } from '@tanstack/ember-hotkeys'\n\n// The containing component owns both subscriptions.\nheldKeys = useHeldKeys(this)\nheldCodes = useHeldKeyCodes(this)\n\n<template>\n  {{#each this.heldKeys.value as |key|}}\n    <kbd>{{key}}</kbd>\n  {{/each}}\n</template>"
  heldKeysState = useHeldKeys(this)
  heldCodesState = useHeldKeyCodes(this)
  @tracked history: Array<string> = []
  value1 = (key: string) => this.heldCodes[key]
  handleClick2 = () => (this.history = [])
  get heldKeys() {
    return this.heldKeysState.value
  }
  get heldCodes() {
    return this.heldCodesState.value
  }
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    const subscription = getKeyStateTracker().store.subscribe(() => {
      if (this.heldKeys.length > 0) {
        const combo = this.heldKeys
          .map((k) => formatForDisplay(k, { useSymbols: true }))
          .join(' + ')
        this.history = (() => {
          if (this.history[this.history.length - 1] !== combo) {
            return [...this.history.slice(-9), combo]
          }
          return this.history
        })()
      }
    })
    registerDestructor(this, () => subscription.unsubscribe())
  }
  <template>
    <div class='app'>
      <header>
        <h1>useHeldKeys</h1>
        <p>
          Returns an array of all currently pressed keys. Useful for displaying key
          combinations or building custom shortcut recording.
        </p>
      </header>

      <main>
        <section class='demo-section'>
          <h2>Currently Held Keys</h2>
          <div class='key-display'>
            {{#if (gt this.heldKeys.length 0)}}{{#each
                this.heldKeys
                as |key index|
              }}{{#let (this.value1 key) as |code|}}
                  {{#if (gt index 0)}}<span class='plus'>+</span>{{/if}}
                  <kbd class='large'>
                    {{formatForDisplay key (hash useSymbols=true)}}
                    {{#if (and code (neq code key))}}<small
                        class='code-label'
                      >{{code}}</small>{{/if}}
                  </kbd>
                {{/let}}{{/each}}{{else}}<span class='placeholder'>Press any keys...</span>{{/if}}
          </div>
          <div class='stats'>
            Keys held:
            <strong>{{this.heldKeys.length}}</strong>
          </div>
        </section>

        <section class='demo-section'>
          <h2>Usage</h2>
          <pre class='code-block'>{{this.usage0}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Try These Combinations</h2>
          <ul>
            <li>
              Hold
              <kbd>Shift</kbd>
              +
              <kbd>Control</kbd>
              +
              <kbd>A</kbd>
            </li>
            <li>Press multiple letter keys at once</li>
            <li>Hold modifiers and watch them appear</li>
            <li>Release keys one by one</li>
          </ul>
        </section>

        <section class='demo-section'>
          <h2>Recent Combinations</h2>
          {{#if (gt this.history.length 0)}}<ul class='history-list'>
              {{#each this.history as |combo i|}}<li>{{combo}}</li>{{/each}}
            </ul>{{else}}<p class='placeholder'>Press some key combinations...</p>{{/if}}
          <button {{on 'click' this.handleClick2}}>Clear History</button>
        </section>

        <section class='demo-section'>
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
  </template>
}
export default App
