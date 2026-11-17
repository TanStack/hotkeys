import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { useFormatForDisplay, useHotkey } from '@tanstack/ember-hotkeys'
import type { GermanKeys, Hotkey, UsKeys } from '@tanstack/ember-hotkeys'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it.
declare module '@tanstack/ember-hotkeys' {
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

interface ShortcutRowSignature {
  Args: {
    shortcut: Shortcut
    lastFired: Hotkey | null
    onFire: (hotkey: Hotkey) => void
  }
}

class ShortcutRow extends Component<ShortcutRowSignature> {
  formatForDisplay = useFormatForDisplay()
  @tracked count = 0

  fire = () => {
    this.count++
    this.args.onFire(this.args.shortcut.hotkey)
  }

  get fired() {
    return this.args.lastFired === this.args.shortcut.hotkey
  }

  <template>
    {{useHotkey @shortcut.hotkey this.fire}}
    <div class='hotkey-row {{if this.fired "fired"}}'>
      <span>
        <kbd>{{this.formatForDisplay @shortcut.hotkey}}</kbd>
        {{@shortcut.name}}
      </span>
      <span class='count'>{{this.count}}×</span>
    </div>
  </template>
}

class App extends Component {
  germanShortcuts = germanShortcuts
  everyLayoutShortcuts = everyLayoutShortcuts
  usage =
    "import type { GermanKeys, UsKeys } from '@tanstack/ember-hotkeys'\n\ndeclare module '@tanstack/ember-hotkeys' {\n  interface Register {\n    keys: UsKeys | GermanKeys\n  }\n}\n\n{{useHotkey 'Mod+Ö' this.toggleComment}} {{! OK }}\n{{useHotkey 'Mod+[' this.outdent}} {{! OK, because UsKeys is listed }}\n{{useHotkey 'Mod+Ñ' this.search}} {{! Type error: Spanish isn't registered }}"
  @tracked lastFired: Hotkey | null = null

  setLastFired = (hotkey: Hotkey) => {
    this.lastFired = hotkey
  }

  <template>
    <div class='app'>
      <header>
        <h1>Keyboard Layouts</h1>
        <p>
          Registering a layout lets hotkey strings accept the keys it types,
          such as Ö and ß. It changes types only: these hotkeys match the same
          way without it.
        </p>
      </header>

      <main>
        <section class='demo-section'>
          <h2>German keys</h2>
          <p class='note'>
            Switch your keyboard layout to German to press these.
          </p>
          <div class='hotkey-list'>
            {{#each this.germanShortcuts key='name' as |shortcut|}}
              <ShortcutRow
                @shortcut={{shortcut}}
                @lastFired={{this.lastFired}}
                @onFire={{this.setLastFired}}
              />
            {{/each}}
          </div>
        </section>

        <section class='demo-section'>
          <h2>Keys on every layout</h2>
          <div class='hotkey-list'>
            {{#each this.everyLayoutShortcuts key='name' as |shortcut|}}
              <ShortcutRow
                @shortcut={{shortcut}}
                @lastFired={{this.lastFired}}
                @onFire={{this.setLastFired}}
              />
            {{/each}}
          </div>
        </section>

        <section class='demo-section'>
          <h2>Usage</h2>
          <pre class='code-block'>{{this.usage}}</pre>
        </section>
      </main>
    </div>
  </template>
}
export default App
