import { LitElement, css, html, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { hotkey, hotkeySequence } from '@tanstack/lit-hotkeys'

import appStyles from './index.css?raw'
import type { HotkeyCallbackContext } from '@tanstack/lit-hotkeys'

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

  @state() private lastSequence: string | null = null
  @state() private history: Array<string> = []

  private addToHistory(action: string) {
    this.lastSequence = action
    this.history = [...this.history.slice(-9), action]
  }

  render() {
    return html`
      <div class="app">
        <header>
          <h1>@hotkeySequence</h1>
          <p>
            Register multi-key sequences (like Vim commands). Keys must be
            pressed within the timeout window (default: 1000ms).
          </p>
        </header>

        <main>
          <section class="demo-section">
            <h2>Vim-Style Commands</h2>
            <table class="sequence-table">
              <thead>
                <tr>
                  <th>Sequence</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><kbd>g</kbd> <kbd>g</kbd></td>
                  <td>Go to top</td>
                </tr>
                <tr>
                  <td><kbd>G</kbd> (Shift+G)</td>
                  <td>Go to bottom</td>
                </tr>
                <tr>
                  <td><kbd>d</kbd> <kbd>d</kbd></td>
                  <td>Delete line</td>
                </tr>
                <tr>
                  <td><kbd>y</kbd> <kbd>y</kbd></td>
                  <td>Yank (copy) line</td>
                </tr>
                <tr>
                  <td><kbd>d</kbd> <kbd>w</kbd></td>
                  <td>Delete word</td>
                </tr>
                <tr>
                  <td><kbd>c</kbd> <kbd>i</kbd> <kbd>w</kbd></td>
                  <td>Change inner word</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="demo-section">
            <h2>Fun Sequences</h2>
            <div class="fun-sequences">
              <div class="sequence-card">
                <h3>Konami Code (Partial)</h3>
                <p><kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd></p>
                <span class="hint">Use arrow keys within 1.5 seconds</span>
              </div>
              <div class="sequence-card">
                <h3>Side to Side</h3>
                <p><kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd></p>
                <span class="hint">Arrow keys within 1.5 seconds</span>
              </div>
              <div class="sequence-card">
                <h3>Spell It Out</h3>
                <p>
                  <kbd>h</kbd> <kbd>e</kbd> <kbd>l</kbd> <kbd>l</kbd>
                  <kbd>o</kbd>
                </p>
                <span class="hint">Type "hello" quickly</span>
              </div>
            </div>
          </section>

          ${
            this.lastSequence
              ? html`
                  <div class="info-box success">
                    <strong>Triggered:</strong> ${this.lastSequence}
                  </div>
                `
              : null
          }

          <section class="demo-section">
            <h2>Input handling</h2>
            <p>
              Sequences are not detected when typing in text inputs, textareas,
              selects, or contenteditable elements. Button-type inputs (
              <code>type="button"</code>, <code>submit</code>,
              <code>reset</code>) still receive sequences. Focus the input below
              and try <kbd>g</kbd> <kbd>g</kbd> or <kbd>h</kbd><kbd>e</kbd
              ><kbd>l</kbd><kbd>l</kbd><kbd>o</kbd>
              — nothing will trigger. Click outside to try again.
            </p>
            <input
              type="text"
              class="demo-input"
              placeholder="Focus here – sequences won't trigger while typing..."
            />
          </section>

          <section class="demo-section">
            <h2>Usage</h2>
            <pre class="code-block">
${`import { hotkeySequence } from '@tanstack/lit-hotkeys'

class VimEditor extends LitElement {
  // Basic sequence
  @hotkeySequence(['G', 'G'])
  goToTop() {
    window.scrollTo(0, 0)
  }

  // With custom timeout (1.5 seconds)
  @hotkeySequence(
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    { timeout: 1500 }
  )
  activateCheatMode() {
    // ...
  }

  // Three-key sequence
  @hotkeySequence(['C', 'I', 'W'])
  changeInnerWord() {
    // ...
  }
}`}</pre>
          </section>

          ${
            this.history.length > 0
              ? html`
                  <section class="demo-section">
                    <h2>History</h2>
                    <ul class="history-list">
                      ${this.history.map((item) => html`<li>${item}</li>`)}
                    </ul>
                    <button @click=${() => (this.history = [])}>
                      Clear History
                    </button>
                  </section>
                `
              : null
          }

          <p class="hint">Press <kbd>Escape</kbd> to clear history</p>
        </main>
      </div>
    `
  }

  // ============================================================================
  // Sequences
  // ============================================================================

  @hotkeySequence(['G', 'G'])
  private _gg() {
    this.addToHistory('gg → Go to top')
  }

  @hotkeySequence(['Shift+G'])
  private _shiftG() {
    this.addToHistory('G → Go to bottom')
  }

  @hotkeySequence(['D', 'D'])
  private _dd() {
    this.addToHistory('dd → Delete line')
  }

  @hotkeySequence(['Y', 'Y'])
  private _yy() {
    this.addToHistory('yy → Yank (copy) line')
  }

  @hotkeySequence(['D', 'W'])
  private _dw() {
    this.addToHistory('dw → Delete word')
  }

  @hotkeySequence(['C', 'I', 'W'])
  private _ciw() {
    this.addToHistory('ciw → Change inner word')
  }

  @hotkeySequence(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'], {
    timeout: 1500,
  })
  private _konami() {
    this.addToHistory('↑↑↓↓ → Konami code (partial)')
  }

  @hotkeySequence(['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'], {
    timeout: 1500,
  })
  private _sideToSide() {
    this.addToHistory('←→←→ → Side to side!')
  }

  @hotkeySequence(['H', 'E', 'L', 'L', 'O'])
  private _hello() {
    this.addToHistory('hello → Hello World!')
  }

  @hotkey('Escape')
  private _escape(_event: KeyboardEvent, _ctx: HotkeyCallbackContext) {
    this.lastSequence = null
    this.history = []
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-app': MyApp
  }
}
