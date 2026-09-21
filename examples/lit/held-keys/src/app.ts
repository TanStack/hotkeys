import { LitElement, css, html, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import {
  HeldKeyCodesController,
  HeldKeysController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'

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

  private heldKeys = new HeldKeysController(this)
  private heldCodes = new HeldKeyCodesController(this)

  @state() private history: Array<string> = []

  override updated(): void {
    const keys = this.heldKeys.value
    if (keys.length > 0) {
      const combo = keys
        .map((k) => formatForDisplay(k, { useSymbols: true }))
        .join(' + ')
      const last = this.history[this.history.length - 1]
      if (last !== combo) {
        this.history = [...this.history.slice(-9), combo]
      }
    }
  }

  render() {
    const keys = this.heldKeys.value
    const codes = this.heldCodes.value

    return html`
      <div class="app">
        <header>
          <h1>HeldKeysController</h1>
          <p>
            Returns an array of all currently pressed keys. Useful for
            displaying key combinations or building custom shortcut recording.
          </p>
        </header>

        <main>
          <section class="demo-section">
            <h2>Currently Held Keys</h2>
            <div class="key-display">
              ${
                keys.length > 0
                  ? keys.map((key, index) => {
                      const code = codes[key]
                      return html`
                        ${index > 0 ? html`<span class="plus">+</span>` : null}
                        <kbd class="large">
                          ${formatForDisplay(key, { useSymbols: true })}
                          ${
                            code && code !== key
                              ? html`<small class="code-label">
                                  ${code}
                                </small>`
                              : null
                          }
                        </kbd>
                      `
                    })
                  : html`<span class="placeholder">Press any keys...</span>`
              }
            </div>
            <div class="stats">Keys held: <strong>${keys.length}</strong></div>
          </section>

          <section class="demo-section">
            <h2>Usage</h2>
            <pre class="code-block">
${`import { HeldKeysController } from '@tanstack/lit-hotkeys'

class KeyDisplay extends LitElement {
  private heldKeys = new HeldKeysController(this)

  render() {
    return html\`
      <div>
        Currently pressed: \${this.heldKeys.value.join(' + ') || 'None'}
      </div>
    \`
  }
}`}</pre>
          </section>

          <section class="demo-section">
            <h2>Try These Combinations</h2>
            <ul>
              <li>Hold <kbd>Shift</kbd> + <kbd>Control</kbd> + <kbd>A</kbd></li>
              <li>Press multiple letter keys at once</li>
              <li>Hold modifiers and watch them appear</li>
              <li>Release keys one by one</li>
            </ul>
          </section>

          <section class="demo-section">
            <h2>Recent Combinations</h2>
            ${
              this.history.length > 0
                ? html`
                    <ul class="history-list">
                      ${this.history.map((combo) => html`<li>${combo}</li>`)}
                    </ul>
                  `
                : html`<p class="placeholder">
                    Press some key combinations...
                  </p>`
            }
            <button @click=${() => (this.history = [])}>Clear History</button>
          </section>

          <section class="demo-section">
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
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-app': MyApp
  }
}
