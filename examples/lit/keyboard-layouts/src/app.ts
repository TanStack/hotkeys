import {
  FormatForDisplayController,
  HotkeyController,
} from '@tanstack/lit-hotkeys'
import { LitElement, css, html, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import appStyles from './index.css?raw'
import type { GermanKeys, Hotkey, UsKeys } from '@tanstack/lit-hotkeys'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it.
declare module '@tanstack/lit-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

interface Shortcut {
  hotkey: Hotkey
  name: string
}

// These type-check because German keys are registered above.
const germanShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+Ö', name: 'Toggle comment' },
  { hotkey: 'Mod+Shift+Ä', name: 'Add annotation' },
  { hotkey: 'ß', name: 'Toggle sidebar' },
  { hotkey: '§', name: 'Show sections' },
]

// A to Z, 0 to 9, named keys, and physical codes type-check under every
// registration, and fire on every layout.
const everyLayoutShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+K', name: 'Open command palette' },
  { hotkey: 'Alt+[Digit1]', name: 'Go to the first tab' },
  { hotkey: 'Escape', name: 'Clear' },
]

const usage = `import { hotkey } from '@tanstack/lit-hotkeys'
import type { GermanKeys, UsKeys } from '@tanstack/lit-hotkeys'

declare module '@tanstack/lit-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

class MyEditor extends LitElement {
  @hotkey('Mod+Ö') // OK
  toggleComment() {}

  @hotkey('Mod+[') // OK, because UsKeys is listed
  outdent() {}

  @hotkey('Mod+Ñ') // Type error: Spanish isn't registered
  search() {}
}`

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

  @state() private counts: Record<string, number> = {}
  @state() private lastFired: Hotkey | null = null

  private formatForDisplay = new FormatForDisplayController(this)

  constructor() {
    super()

    for (const { hotkey, name } of [
      ...germanShortcuts,
      ...everyLayoutShortcuts,
    ]) {
      // The controller adds itself to this element.
      new HotkeyController(this, hotkey, () => {
        this.counts = { ...this.counts, [name]: (this.counts[name] ?? 0) + 1 }
        this.lastFired = hotkey
      })
    }
  }

  private rows(shortcuts: Array<Shortcut>) {
    return html`
      <div class="hotkey-list">
        ${shortcuts.map(
          (shortcut) => html`
            <div
              class="hotkey-row ${
                this.lastFired === shortcut.hotkey ? 'fired' : ''
              }"
            >
              <span>
                <kbd>${this.formatForDisplay.format(shortcut.hotkey)}</kbd>
                ${shortcut.name}
              </span>
              <span class="count">${this.counts[shortcut.name] ?? 0}×</span>
            </div>
          `,
        )}
      </div>
    `
  }

  render() {
    return html`
      <div class="app">
        <header>
          <h1>Keyboard Layouts</h1>
          <p>
            Registering a layout lets hotkey strings accept the keys it types,
            such as Ö and ß. It changes types only: these hotkeys match the same
            way without it.
          </p>
        </header>

        <main>
          <section class="demo-section">
            <h2>German keys</h2>
            <p class="note">
              Switch your keyboard layout to German to press these.
            </p>
            ${this.rows(germanShortcuts)}
          </section>

          <section class="demo-section">
            <h2>Keys on every layout</h2>
            ${this.rows(everyLayoutShortcuts)}
          </section>

          <section class="demo-section">
            <h2>Usage</h2>
            <pre class="code-block">${usage}</pre>
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
