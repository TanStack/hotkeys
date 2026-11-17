import { Component, signal } from '@angular/core'
import { injectFormatForDisplay, injectHotkey } from '@tanstack/angular-hotkeys'
import type { GermanKeys, Hotkey, UsKeys } from '@tanstack/angular-hotkeys'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it.
declare module '@tanstack/angular-hotkeys' {
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

const usage = `import type { GermanKeys, UsKeys } from '@tanstack/angular-hotkeys'

declare module '@tanstack/angular-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

injectHotkey('Mod+Ö', () => this.toggleComment()) // OK
injectHotkey('Mod+[', () => this.outdent()) // OK, because UsKeys is listed
injectHotkey('Mod+Ñ', () => this.search()) // Type error: Spanish isn't registered`

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
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
        @for (section of sections; track section.title) {
          <section class="demo-section">
            <h2>{{ section.title }}</h2>
            @if (section.note) {
              <p class="note">{{ section.note }}</p>
            }
            <div class="hotkey-list">
              @for (shortcut of section.shortcuts; track shortcut.name) {
                <div
                  class="hotkey-row"
                  [class.fired]="lastFired() === shortcut.hotkey"
                >
                  <span>
                    <kbd>{{ formatForDisplay(shortcut.hotkey) }}</kbd>
                    {{ shortcut.name }}
                  </span>
                  <span class="count">{{ counts()[shortcut.name] ?? 0 }}×</span>
                </div>
              }
            </div>
          </section>
        }

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{{ usage }}</pre>
        </section>
      </main>
    </div>
  `,
})
export class AppComponent {
  protected readonly sections = [
    {
      title: 'German keys',
      note: 'Switch your keyboard layout to German to press these.',
      shortcuts: germanShortcuts,
    },
    {
      title: 'Keys on every layout',
      note: null,
      shortcuts: everyLayoutShortcuts,
    },
  ]
  protected readonly usage = usage
  protected readonly formatForDisplay = injectFormatForDisplay()
  protected readonly lastFired = signal<Hotkey | null>(null)
  protected readonly counts = signal<Record<string, number>>({})

  constructor() {
    for (const { hotkey, name } of [
      ...germanShortcuts,
      ...everyLayoutShortcuts,
    ]) {
      injectHotkey(hotkey, () => {
        this.counts.update((counts) => ({
          ...counts,
          [name]: (counts[name] ?? 0) + 1,
        }))
        this.lastFired.set(hotkey)
      })
    }
  }
}
