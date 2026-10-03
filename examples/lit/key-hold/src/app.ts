import { LitElement, css, html, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'

import { KeyHoldController } from '@tanstack/lit-hotkeys'

import appStyles from './index.css?raw'

@customElement('my-app')
export class MyApp extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        margin: 0;
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
        background: #f5f5f5;
        color: #333;
        box-sizing: border-box;
      }
      :host *,
      :host *::before,
      :host *::after {
        box-sizing: border-box;
      }
    `,
    unsafeCSS(appStyles),
  ]

  private shiftHold = new KeyHoldController(this, 'Shift')
  private controlHold = new KeyHoldController(this, 'Control')
  private altHold = new KeyHoldController(this, 'Alt')
  private metaHold = new KeyHoldController(this, 'Meta')
  private spaceHold = new KeyHoldController(this, 'Space')

  render() {
    return html`
      <div class="app">
        <header>
          <h1>KeyHoldController</h1>
          <p>
            Returns a boolean indicating if a specific key is currently held.
            Optimized to only re-render when that specific key changes.
          </p>
        </header>

        <main>
          <section class="demo-section">
            <h2>Modifier Key States</h2>
            <div class="modifier-grid">
              <div
                class="modifier-indicator ${
                  this.shiftHold.value ? 'active' : ''
                }"
              >
                <span class="key-name">Shift</span>
                <span class="status">
                  ${this.shiftHold.value ? 'HELD' : 'Released'}
                </span>
              </div>
              <div
                class="modifier-indicator ${
                  this.controlHold.value ? 'active' : ''
                }"
              >
                <span class="key-name">Control</span>
                <span class="status">
                  ${this.controlHold.value ? 'HELD' : 'Released'}
                </span>
              </div>
              <div
                class="modifier-indicator ${this.altHold.value ? 'active' : ''}"
              >
                <span class="key-name">Alt / Option</span>
                <span class="status">
                  ${this.altHold.value ? 'HELD' : 'Released'}
                </span>
              </div>
              <div
                class="modifier-indicator ${
                  this.metaHold.value ? 'active' : ''
                }"
              >
                <span class="key-name">Meta (⌘ / ⊞)</span>
                <span class="status">
                  ${this.metaHold.value ? 'HELD' : 'Released'}
                </span>
              </div>
            </div>
          </section>

          <section class="demo-section">
            <h2>Space Bar Demo</h2>
            <div
              class="space-indicator ${this.spaceHold.value ? 'active' : ''}"
            >
              ${this.spaceHold.value ? '🚀 SPACE HELD!' : 'Hold Space Bar'}
            </div>
          </section>

          <section class="demo-section">
            <h2>Usage</h2>
            <pre class="code-block">
${`import { KeyHoldController } from '@tanstack/lit-hotkeys'

class ShiftIndicator extends LitElement {
  private shiftHold = new KeyHoldController(this, 'Shift')

  render() {
    return html\`
      <div style="opacity: \${this.shiftHold.value ? 1 : 0.5}">
        \${this.shiftHold.value ? 'Shift is pressed!' : 'Press Shift'}
      </div>
    \`
  }
}`}</pre>
          </section>

          <section class="demo-section">
            <h2>Conditional UI Example</h2>
            <p>Hold <kbd>Shift</kbd> to reveal the secret message:</p>
            <div class="secret-box ${this.shiftHold.value ? 'revealed' : ''}">
              ${
                this.shiftHold.value
                  ? html`<span
                      >🎉 The secret password is: tanstack-hotkeys-rocks!</span
                    >`
                  : html`<span>••••••••••••••••••••••••••</span>`
              }
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
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-app': MyApp
  }
}
