import { KeyLockStateController } from '@tanstack/lit-hotkeys'
import { LitElement, css, html, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'
import appStyles from './index.css?raw'

function describe(state: boolean | null) {
  if (state === null) return 'Unknown'
  return state ? 'On' : 'Off'
}

@customElement('my-app')
export class MyApp extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
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

  private capsLock = new KeyLockStateController(this, 'CapsLock')
  private numLock = new KeyLockStateController(this, 'NumLock')
  private scrollLock = new KeyLockStateController(this, 'ScrollLock')

  render() {
    const locks = [
      { name: 'Caps Lock', state: this.capsLock.value },
      { name: 'Num Lock', state: this.numLock.value },
      { name: 'Scroll Lock', state: this.scrollLock.value },
    ]

    return html`
      <div class="app">
        <h1>KeyLockStateController</h1>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" />
          <p role="status" class="warning">
            ${this.capsLock.value === true ? 'Caps Lock is on' : ''}
          </p>
        </div>

        <div class="locks">
          ${locks.map(
            (lock) => html`
              <div class="lock ${lock.state === true ? 'on' : ''}">
                <span class="lock-name">${lock.name}</span>
                <span>${describe(lock.state)}</span>
              </div>
            `,
          )}
        </div>

        <p class="note">
          Unknown until you press a key, click, or move the mouse. Num Lock and
          Scroll Lock stay unknown on macOS.
        </p>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-app': MyApp
  }
}
