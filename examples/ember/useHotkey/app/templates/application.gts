import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { on } from '@ember/modifier'

import { formatForDisplay, useHotkey, onHotkey } from '@tanstack/ember-hotkeys'
import type {
  Hotkey,
  RegisterableHotkey,
  HotkeyCallback,
} from '@tanstack/ember-hotkeys'
import { modifier } from 'ember-modifier'

const autofocus = modifier((element: HTMLElement) => element.focus())

class App extends Component {
  usage0 =
    'onSave = (_event, { hotkey, parsedHotkey }) => {\n  console.log(hotkey, parsedHotkey)\n}\n\n<template>\n  {{useHotkey "Mod+[KeyS]" this.onSave}}\n</template>'
  usage1 = '{{useHotkey "Mod+K" this.increment requireReset=true}}'
  usage2 =
    '@tracked enabled = true\n\n<template>\n  {{useHotkey "Mod+E" this.runAction enabled=this.enabled}}\n</template>'
  usage3 =
    '{{useHotkey "Mod+1" this.openFirstTab}}\n{{useHotkey "Mod+[Digit2]" this.openSecondTab}}'
  usage4 =
    '{{useHotkey "Shift+ArrowUp" this.selectUp}}\n{{useHotkey "Alt+ArrowLeft" this.navigateBack}}\n{{useHotkey "Mod+Home" this.goToStart}}\n{{useHotkey "Control+PageUp" this.previousPage}}'
  usage5 =
    '{{useHotkey "Alt+F4" this.closeWindow}}\n{{useHotkey "Control+F5" this.hardRefresh}}\n{{useHotkey "Mod+F1" this.showHelp}}\n{{useHotkey "F12" this.openDevTools}}'
  usage6 =
    '{{useHotkey "Mod+Shift+S" this.saveAs}}\n{{useHotkey "Control+Alt+Shift+X" this.runAdvancedAction}}'
  usage7 =
    '{{useHotkey "Mod+Enter" this.submitForm}}\n{{useHotkey "Mod+Backspace" this.deleteWord}}\n{{useHotkey "Mod+Space" this.openPalette}}'
  usage8 =
    '<div {{onHotkey "Mod+B" this.sidebarAction}} tabindex="0">...</div>\n{{#if this.modalOpen}}\n  <div {{onHotkey "Escape" this.closeModal}} tabindex="0">...</div>\n{{/if}}\n<textarea {{onHotkey "Mod+S" this.saveEditor}}></textarea>'
  @tracked lastHotkey: Hotkey | null = null
  @tracked saveCount: number = 0
  @tracked incrementCount: number = 0
  @tracked enabled: boolean = true
  @tracked activeTab: number = 1
  @tracked navigationCount: number = 0
  @tracked functionKeyCount: number = 0
  @tracked multiModifierCount: number = 0
  @tracked editingKeyCount: number = 0
  @tracked modalOpen: boolean = false
  @tracked editorContent: string = ''
  @tracked sidebarShortcutCount: number = 0
  @tracked modalShortcutCount: number = 0
  @tracked editorShortcutCount: number = 0
  toggleEnabled = () => (this.enabled = !this.enabled)
  openModal = () => (this.modalOpen = true)
  closeModal = () => (this.modalOpen = false)
  stopClickPropagation = (e: Event) => e.stopPropagation()
  updateEditor = (e: Event) =>
    (this.editorContent = (e.currentTarget as HTMLInputElement).value)
  onModKeyS: HotkeyCallback = (_event, { hotkey, parsedHotkey }) => {
    this.lastHotkey = hotkey
    this.saveCount = this.saveCount + 1
    console.log('Hotkey triggered:', hotkey)
    console.log('Parsed hotkey:', parsedHotkey)
  }
  onModK: HotkeyCallback = (_event, { hotkey }) => {
    this.lastHotkey = hotkey
    this.incrementCount = this.incrementCount + 1
  }
  onModE: HotkeyCallback = (_event, { hotkey }) => {
    this.lastHotkey = hotkey
    alert('This hotkey can be toggled!')
  }
  onMod1: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+1'
    this.activeTab = 1
  }
  onModDigit2: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+[Digit2]'
    this.activeTab = 2
  }
  onMod3: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+3'
    this.activeTab = 3
  }
  onMod4: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+4'
    this.activeTab = 4
  }
  onMod5: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+5'
    this.activeTab = 5
  }
  onShiftArrowUp: HotkeyCallback = () => {
    this.lastHotkey = 'Shift+ArrowUp'
    this.navigationCount = this.navigationCount + 1
  }
  onShiftArrowDown: HotkeyCallback = () => {
    this.lastHotkey = 'Shift+ArrowDown'
    this.navigationCount = this.navigationCount + 1
  }
  onAltArrowLeft: HotkeyCallback = () => {
    this.lastHotkey = 'Alt+ArrowLeft'
    this.navigationCount = this.navigationCount + 1
  }
  onAltArrowRight: HotkeyCallback = () => {
    this.lastHotkey = 'Alt+ArrowRight'
    this.navigationCount = this.navigationCount + 1
  }
  onModHome: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Home'
    this.navigationCount = this.navigationCount + 1
  }
  onModEnd: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+End'
    this.navigationCount = this.navigationCount + 1
  }
  onControlPageUp: HotkeyCallback = () => {
    this.lastHotkey = 'Control+PageUp'
    this.navigationCount = this.navigationCount + 1
  }
  onControlPageDown: HotkeyCallback = () => {
    this.lastHotkey = 'Control+PageDown'
    this.navigationCount = this.navigationCount + 1
  }
  onAltF4: HotkeyCallback = () => {
    this.lastHotkey = 'Alt+F4'
    this.functionKeyCount = this.functionKeyCount + 1
    alert('Alt+F4 pressed (normally closes window)')
  }
  onControlF5: HotkeyCallback = () => {
    this.lastHotkey = 'Control+F5'
    this.functionKeyCount = this.functionKeyCount + 1
  }
  onModF1: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+F1'
    this.functionKeyCount = this.functionKeyCount + 1
  }
  onShiftF10: HotkeyCallback = () => {
    this.lastHotkey = 'Shift+F10'
    this.functionKeyCount = this.functionKeyCount + 1
  }
  onModShiftS: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Shift+S'
    this.multiModifierCount = this.multiModifierCount + 1
  }
  onModShiftZ: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Shift+Z'
    this.multiModifierCount = this.multiModifierCount + 1
  }
  get rawSelectAll(): RegisterableHotkey {
    return { key: 'A', ctrl: true, alt: true }
  }
  selectAll: HotkeyCallback = () => {
    this.lastHotkey = 'Control+Alt+A'
    this.multiModifierCount = this.multiModifierCount + 1
  }
  onControlShiftN: HotkeyCallback = () => {
    this.lastHotkey = 'Control+Shift+N'
    this.multiModifierCount = this.multiModifierCount + 1
  }
  onModAltT: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Alt+T'
    this.multiModifierCount = this.multiModifierCount + 1
  }
  onControlAltShiftX: HotkeyCallback = () => {
    this.lastHotkey = 'Control+Alt+Shift+X'
    this.multiModifierCount = this.multiModifierCount + 1
  }
  onModEnter: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Enter'
    this.editingKeyCount = this.editingKeyCount + 1
  }
  onShiftEnter: HotkeyCallback = () => {
    this.lastHotkey = 'Shift+Enter'
    this.editingKeyCount = this.editingKeyCount + 1
  }
  onModBackspace: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Backspace'
    this.editingKeyCount = this.editingKeyCount + 1
  }
  onModDelete: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Delete'
    this.editingKeyCount = this.editingKeyCount + 1
  }
  onControlTab: HotkeyCallback = () => {
    this.lastHotkey = 'Control+Tab'
    this.editingKeyCount = this.editingKeyCount + 1
  }
  onShiftTab: HotkeyCallback = () => {
    this.lastHotkey = 'Shift+Tab'
    this.editingKeyCount = this.editingKeyCount + 1
  }
  onModSpace: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Space'
    this.editingKeyCount = this.editingKeyCount + 1
  }
  get escape(): RegisterableHotkey {
    return { key: 'Escape' }
  }
  resetCounters: HotkeyCallback = () => {
    this.lastHotkey = null
    this.saveCount = 0
    this.incrementCount = 0
    this.navigationCount = 0
    this.functionKeyCount = 0
    this.multiModifierCount = 0
    this.editingKeyCount = 0
    this.activeTab = 1
  }
  onF12: HotkeyCallback = () => {
    this.lastHotkey = 'F12'
    this.functionKeyCount = this.functionKeyCount + 1
  }
  onModBSidebar: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+B'
    this.sidebarShortcutCount = this.sidebarShortcutCount + 1
    alert(
      'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
    )
  }
  onModNSidebar: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+N'
    this.sidebarShortcutCount = this.sidebarShortcutCount + 1
  }
  onEscapeModal: HotkeyCallback = () => {
    this.lastHotkey = 'Escape'
    this.modalShortcutCount = this.modalShortcutCount + 1
    this.modalOpen = false
  }
  onModEnterModal: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+Enter'
    this.modalShortcutCount = this.modalShortcutCount + 1
    alert('Modal submit shortcut!')
  }
  onModSEditor: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+S'
    this.editorShortcutCount = this.editorShortcutCount + 1
    alert(
      `Editor content saved: "${this.editorContent.substring(0, 50)}${this.editorContent.length > 50 ? '...' : ''}"`,
    )
  }
  onModEditor: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+/'
    this.editorShortcutCount = this.editorShortcutCount + 1
    this.editorContent = this.editorContent + '\n// Comment added via shortcut'
  }
  onModKEditor: HotkeyCallback = () => {
    this.lastHotkey = 'Mod+K'
    this.editorShortcutCount = this.editorShortcutCount + 1
    this.editorContent = ''
  }
  onJ: HotkeyCallback = () => {
    this.lastHotkey = 'J'
    this.editorShortcutCount = this.editorShortcutCount + 1
  }

  <template>
    {{useHotkey 'Mod+[KeyS]' this.onModKeyS}}
    {{useHotkey 'Mod+K' this.onModK requireReset=true}}
    {{useHotkey 'Mod+E' this.onModE enabled=this.enabled}}
    {{useHotkey 'Mod+1' this.onMod1}}
    {{useHotkey 'Mod+[Digit2]' this.onModDigit2}}
    {{useHotkey 'Mod+3' this.onMod3}}
    {{useHotkey 'Mod+4' this.onMod4}}
    {{useHotkey 'Mod+5' this.onMod5}}
    {{useHotkey 'Shift+ArrowUp' this.onShiftArrowUp}}
    {{useHotkey 'Shift+ArrowDown' this.onShiftArrowDown}}
    {{useHotkey 'Alt+ArrowLeft' this.onAltArrowLeft}}
    {{useHotkey 'Alt+ArrowRight' this.onAltArrowRight}}
    {{useHotkey 'Mod+Home' this.onModHome}}
    {{useHotkey 'Mod+End' this.onModEnd}}
    {{useHotkey 'Control+PageUp' this.onControlPageUp}}
    {{useHotkey 'Control+PageDown' this.onControlPageDown}}
    {{useHotkey 'Alt+F4' this.onAltF4}}
    {{useHotkey 'Control+F5' this.onControlF5}}
    {{useHotkey 'Mod+F1' this.onModF1}}
    {{useHotkey 'Shift+F10' this.onShiftF10}}
    {{useHotkey 'Mod+Shift+S' this.onModShiftS}}
    {{useHotkey 'Mod+Shift+Z' this.onModShiftZ}}
    {{useHotkey this.rawSelectAll this.selectAll}}
    {{useHotkey 'Control+Shift+N' this.onControlShiftN}}
    {{useHotkey 'Mod+Alt+T' this.onModAltT}}
    {{useHotkey 'Control+Alt+Shift+X' this.onControlAltShiftX}}
    {{useHotkey 'Mod+Enter' this.onModEnter}}
    {{useHotkey 'Shift+Enter' this.onShiftEnter}}
    {{useHotkey 'Mod+Backspace' this.onModBackspace}}
    {{useHotkey 'Mod+Delete' this.onModDelete}}
    {{useHotkey 'Control+Tab' this.onControlTab}}
    {{useHotkey 'Shift+Tab' this.onShiftTab}}
    {{useHotkey 'Mod+Space' this.onModSpace}}
    {{useHotkey this.escape this.resetCounters}}
    {{useHotkey 'F12' this.onF12}}

    {{useHotkey 'J' this.onJ}}
    <div class='app'>
      <header>
        <h1>useHotkey</h1>
        <p>
          Register keyboard shortcuts with callback context containing the hotkey
          and parsed hotkey information.
        </p>
      </header>

      <main>
        <section class='demo-section'>
          <h2>Basic Hotkey</h2>
          <p>
            Press
            <kbd>{{formatForDisplay 'Mod+[KeyS]'}}</kbd>
            to trigger the physical S position
          </p>
          <div class='counter'>Save triggered: {{this.saveCount}}x</div>
          <pre class='code-block'>{{this.usage0}}</pre>
        </section>

        <section class='demo-section'>
          <h2>With requireReset</h2>
          <p>
            Hold
            <kbd>{{formatForDisplay 'Mod+K'}}</kbd>
            — only increments once until you release all keys
          </p>
          <div class='counter'>Increment: {{this.incrementCount}}</div>
          <p class='hint'>
            This prevents repeated triggering while holding the keys down. Release
            all keys to allow re-triggering.
          </p>
          <pre class='code-block'>{{this.usage1}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Conditional Hotkey</h2>
          <p>
            <kbd>{{formatForDisplay 'Mod+E'}}</kbd>
            is currently
            <strong>{{if this.enabled 'enabled' 'disabled'}}</strong>
          </p>
          <button {{on 'click' this.toggleEnabled}}>
            {{if this.enabled 'Disable' 'Enable'}}
            Hotkey
          </button>
          <pre class='code-block'>{{this.usage2}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Number Key Combinations</h2>
          <p>
            Tab 2 uses the physical number-row position (
            <code>Mod+[Digit2]</code>), even when that key produces a different
            character. The other tabs follow logical digits.
          </p>
          <div class='hotkey-grid'>
            <div>
              <kbd>{{formatForDisplay 'Mod+1'}}</kbd>
              → Tab 1
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+[Digit2]'}}</kbd>
              → Tab 2
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+3'}}</kbd>
              → Tab 3
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+4'}}</kbd>
              → Tab 4
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+5'}}</kbd>
              → Tab 5
            </div>
          </div>
          <div class='counter'>Active Tab: {{this.activeTab}}</div>
          <pre class='code-block'>{{this.usage3}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Navigation Key Combinations</h2>
          <p>Selection and navigation shortcuts:</p>
          <div class='hotkey-grid'>
            <div>
              <kbd>{{formatForDisplay 'Shift+ArrowUp'}}</kbd>
              — Select up
            </div>
            <div>
              <kbd>{{formatForDisplay 'Shift+ArrowDown'}}</kbd>
              — Select down
            </div>
            <div>
              <kbd>{{formatForDisplay 'Alt+ArrowLeft'}}</kbd>
              — Navigate back
            </div>
            <div>
              <kbd>{{formatForDisplay 'Alt+ArrowRight'}}</kbd>
              — Navigate forward
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+Home'}}</kbd>
              — Go to start
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+End'}}</kbd>
              — Go to end
            </div>
            <div>
              <kbd>{{formatForDisplay 'Control+PageUp'}}</kbd>
              — Previous page
            </div>
            <div>
              <kbd>{{formatForDisplay 'Control+PageDown'}}</kbd>
              — Next page
            </div>
          </div>
          <div class='counter'>
            Navigation triggered:
            {{this.navigationCount}}x
          </div>
          <pre class='code-block'>{{this.usage4}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Function Key Combinations</h2>
          <p>System and application shortcuts:</p>
          <div class='hotkey-grid'>
            <div>
              <kbd>{{formatForDisplay 'Alt+F4'}}</kbd>
              — Close window
            </div>
            <div>
              <kbd>{{formatForDisplay 'Control+F5'}}</kbd>
              — Hard refresh
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+F1'}}</kbd>
              — Help
            </div>
            <div>
              <kbd>{{formatForDisplay 'Shift+F10'}}</kbd>
              — Context menu
            </div>
            <div>
              <kbd>{{formatForDisplay 'F12'}}</kbd>
              — DevTools
            </div>
          </div>
          <div class='counter'>
            Function keys triggered:
            {{this.functionKeyCount}}x
          </div>
          <pre class='code-block'>{{this.usage5}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Multi-Modifier Combinations</h2>
          <p>Complex shortcuts with multiple modifiers:</p>
          <div class='hotkey-grid'>
            <div>
              <kbd>{{formatForDisplay 'Mod+Shift+S'}}</kbd>
              — Save As
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+Shift+Z'}}</kbd>
              — Redo
            </div>
            <div>
              <kbd>{{formatForDisplay 'Control+Alt+A'}}</kbd>
              — Special action
            </div>
            <div>
              <kbd>{{formatForDisplay 'Control+Shift+N'}}</kbd>
              — New incognito
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+Alt+T'}}</kbd>
              — Toggle theme
            </div>
            <div>
              <kbd>{{formatForDisplay 'Control+Alt+Shift+X'}}</kbd>
              — Triple modifier
            </div>
          </div>
          <div class='counter'>
            Multi-modifier triggered:
            {{this.multiModifierCount}}x
          </div>
          <pre class='code-block'>{{this.usage6}}</pre>
        </section>

        <section class='demo-section'>
          <h2>Editing Key Combinations</h2>
          <p>Text editing and form shortcuts:</p>
          <div class='hotkey-grid'>
            <div>
              <kbd>{{formatForDisplay 'Mod+Enter'}}</kbd>
              — Submit form
            </div>
            <div>
              <kbd>{{formatForDisplay 'Shift+Enter'}}</kbd>
              — New line
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+Backspace'}}</kbd>
              — Delete word
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+Delete'}}</kbd>
              — Delete forward
            </div>
            <div>
              <kbd>{{formatForDisplay 'Control+Tab'}}</kbd>
              — Next tab
            </div>
            <div>
              <kbd>{{formatForDisplay 'Shift+Tab'}}</kbd>
              — Previous field
            </div>
            <div>
              <kbd>{{formatForDisplay 'Mod+Space'}}</kbd>
              — Toggle
            </div>
          </div>
          <div class='counter'>
            Editing keys triggered:
            {{this.editingKeyCount}}x
          </div>
          <pre class='code-block'>{{this.usage7}}</pre>
        </section>

        {{#if this.lastHotkey}}<div class='info-box'>
            <strong>Last triggered:</strong>
            {{formatForDisplay this.lastHotkey}}
          </div>{{/if}}

        <p class='hint'>
          Press
          <kbd>Escape</kbd>
          to reset all counters
        </p>

        <section class='demo-section scoped-section'>
          <h2>Scoped Keyboard Shortcuts</h2>
          <p>
            Attach shortcuts to a DOM element with the
            <code>onHotkey</code>
            modifier. This allows different shortcuts to work in different parts of
            your application.
          </p>

          <div class='scoped-grid'>

            <div
              class='scoped-area'
              {{onHotkey 'Mod+B' this.onModBSidebar}}
              {{onHotkey 'Mod+N' this.onModNSidebar}}
              tabindex={{0}}
            >
              <h3>Sidebar (Scoped Area)</h3>
              <p>Click here to focus, then try:</p>
              <div class='hotkey-list'>
                <div>
                  <kbd>{{formatForDisplay 'Mod+B'}}</kbd>
                  — Trigger sidebar action
                </div>
                <div>
                  <kbd>{{formatForDisplay 'Mod+N'}}</kbd>
                  — New item
                </div>
              </div>
              <div class='counter'>
                Sidebar shortcuts:
                {{this.sidebarShortcutCount}}x
              </div>
              <p class='hint'>
                These shortcuts only work when this sidebar area is focused or
                contains focus.
              </p>
            </div>

            <div class='scoped-area'>
              <h3>Modal Dialog</h3>
              <button {{on 'click' this.openModal}}>Open Modal</button>
              {{#if this.modalOpen}}<div
                  class='modal-overlay'
                  {{on 'click' this.closeModal}}
                >
                  <div
                    class='modal-content'
                    {{onHotkey 'Escape' this.onEscapeModal}}
                    {{onHotkey 'Mod+Enter' this.onModEnterModal}}
                    {{autofocus}}
                    tabindex={{0}}
                    {{on 'click' this.stopClickPropagation}}
                  >
                    <h3>Modal Dialog (Scoped)</h3>
                    <p>Try these shortcuts while modal is open:</p>
                    <div class='hotkey-list'>
                      <div>
                        <kbd>{{formatForDisplay 'Escape'}}</kbd>
                        — Close modal
                      </div>
                      <div>
                        <kbd>{{formatForDisplay 'Mod+Enter'}}</kbd>
                        — Submit
                      </div>
                    </div>
                    <div class='counter'>
                      Modal shortcuts:
                      {{this.modalShortcutCount}}x
                    </div>
                    <p class='hint'>
                      These shortcuts only work when the modal is open and focused.
                      The Escape key here won't conflict with the global Escape
                      handler.
                    </p>
                    <button {{on 'click' this.closeModal}}>Close</button>
                  </div>
                </div>{{/if}}
            </div>

            <div class='scoped-area'>
              <h3>Text Editor (Scoped)</h3>
              <p>Focus the editor below and try:</p>
              <div class='hotkey-list'>
                <div>
                  <kbd>{{formatForDisplay 'Mod+S'}}</kbd>
                  — Save editor content
                </div>
                <div>
                  <kbd>{{formatForDisplay 'Mod+/'}}</kbd>
                  — Add comment
                </div>
                <div>
                  <kbd>{{formatForDisplay 'Mod+K'}}</kbd>
                  — Clear editor
                </div>
                <div>
                  <kbd>J</kbd>
                  — Single key (test ignoreInputs)
                </div>
              </div>
              <textarea
                {{onHotkey 'Mod+S' this.onModSEditor}}
                {{onHotkey 'Mod+/' this.onModEditor}}
                {{onHotkey 'Mod+K' this.onModKEditor}}
                class='scoped-editor'
                value={{this.editorContent}}
                {{on 'input' this.updateEditor}}
                placeholder='Focus here and try the shortcuts above...'
                rows={{8}}
              ></textarea>
              <div class='counter'>
                Editor shortcuts:
                {{this.editorShortcutCount}}x
              </div>
              <p class='hint'>
                These shortcuts only work when the editor is focused. Notice that
                <kbd>{{formatForDisplay 'Mod+S'}}</kbd>
                here doesn't conflict with the global
                <kbd>{{formatForDisplay 'Mod+S'}}</kbd>
                shortcut.
              </p>
            </div>
          </div>

          <pre class='code-block'>{{this.usage8}}</pre>
        </section>
      </main>

    </div>
  </template>
}
export default App
