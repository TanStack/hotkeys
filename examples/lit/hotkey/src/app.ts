import { LitElement, css, html, unsafeCSS } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import { customElement, state } from 'lit/decorators.js'

import {
  formatForDisplay,
  getHotkeyManager,
  hotkey,
} from '@tanstack/lit-hotkeys'

import appStyles from './index.css?raw'
import type { Ref } from 'lit/directives/ref.js'
import type {
  Hotkey,
  HotkeyCallbackContext,
  HotkeyRegistrationHandle,
} from '@tanstack/lit-hotkeys'

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

  @state() private lastHotkey: Hotkey | null = null
  @state() private saveCount = 0
  @state() private incrementCount = 0
  @state() private enabled = true
  @state() private activeTab = 1
  @state() private navigationCount = 0
  @state() private functionKeyCount = 0
  @state() private multiModifierCount = 0
  @state() private editingKeyCount = 0

  // Scoped shortcuts state
  @state() private modalOpen = false
  @state() private editorContent = ''
  @state() private sidebarShortcutCount = 0
  @state() private modalShortcutCount = 0
  @state() private editorShortcutCount = 0

  private sidebarRef: Ref<HTMLDivElement> = createRef()
  private modalRef: Ref<HTMLDivElement> = createRef()
  private editorRef: Ref<HTMLTextAreaElement> = createRef()

  private _scopedRegistrations: Array<HotkeyRegistrationHandle> = []
  private _modalRegistrations: Array<HotkeyRegistrationHandle> = []

  override updated(changedProps: Map<PropertyKey, unknown>): void {
    super.updated(changedProps)

    if (this._scopedRegistrations.length === 0) {
      this._registerScopedHotkeys()
    }

    if (changedProps.has('modalOpen')) {
      this._unregisterModal()
      if (this.modalOpen) {
        this._registerModalHotkeys()
        this.modalRef.value?.focus()
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this._unregisterScoped()
    this._unregisterModal()
  }

  private _unregisterScoped(): void {
    for (const reg of this._scopedRegistrations) {
      if (reg.isActive) reg.unregister()
    }
    this._scopedRegistrations = []
  }

  private _unregisterModal(): void {
    for (const reg of this._modalRegistrations) {
      if (reg.isActive) reg.unregister()
    }
    this._modalRegistrations = []
  }

  private _registerScopedHotkeys(): void {
    const manager = getHotkeyManager()

    const sidebar = this.sidebarRef.value
    if (sidebar) {
      this._scopedRegistrations.push(
        manager.register(
          'Mod+B',
          () => {
            this.lastHotkey = 'Mod+B'
            this.sidebarShortcutCount++
            alert(
              'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
            )
          },
          { target: sidebar },
        ),
        manager.register(
          'Mod+N',
          () => {
            this.lastHotkey = 'Mod+N'
            this.sidebarShortcutCount++
          },
          { target: sidebar },
        ),
      )
    }

    const editor = this.editorRef.value
    if (editor) {
      this._scopedRegistrations.push(
        manager.register(
          'Mod+S',
          () => {
            this.lastHotkey = 'Mod+S'
            this.editorShortcutCount++
            alert(
              `Editor content saved: "${this.editorContent.substring(0, 50)}${this.editorContent.length > 50 ? '...' : ''}"`,
            )
          },
          { target: editor },
        ),
        manager.register(
          'Mod+/',
          () => {
            this.lastHotkey = 'Mod+/'
            this.editorShortcutCount++
            this.editorContent += '\n// Comment added via shortcut'
          },
          { target: editor },
        ),
        manager.register(
          'Mod+K',
          () => {
            this.lastHotkey = 'Mod+K'
            this.editorShortcutCount++
            this.editorContent = ''
          },
          { target: editor },
        ),
        manager.register('J', () => {
          this.lastHotkey = 'J'
          this.editorShortcutCount++
        }),
      )
    }
  }

  private _registerModalHotkeys(): void {
    const manager = getHotkeyManager()
    const modal = this.modalRef.value
    if (!modal) return

    this._modalRegistrations.push(
      manager.register(
        'Escape',
        () => {
          this.lastHotkey = 'Escape'
          this.modalShortcutCount++
          this.modalOpen = false
        },
        { target: modal },
      ),
      manager.register(
        'Mod+Enter',
        () => {
          this.lastHotkey = 'Mod+Enter'
          this.modalShortcutCount++
          alert('Modal submit shortcut!')
        },
        { target: modal },
      ),
    )
  }

  render() {
    return html` <div class="app">
      <header>
        <h1>@hotkey</h1>
        <p>
          Register keyboard shortcuts with callback context containing the
          hotkey and parsed hotkey information.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Basic Hotkey</h2>
          <p>Press <kbd>${formatForDisplay('Mod+S')}</kbd> to trigger</p>
          <div class="counter">Save triggered: ${this.saveCount}x</div>
          <pre class="code-block">
${`@hotkey('Mod+S', (_event, { hotkey, parsedHotkey }) => {
  console.log('Hotkey:', hotkey)
  console.log('Parsed:', parsedHotkey)
})`}</pre
          >
        </section>

        <section class="demo-section">
          <h2>With requireReset</h2>
          <p>
            Hold <kbd>${formatForDisplay('Mod+K')}</kbd> — only increments once
            until you release all keys
          </p>
          <div class="counter">Increment: ${this.incrementCount}</div>
          <p class="hint">
            This prevents repeated triggering while holding the keys down.
            Release all keys to allow re-triggering.
          </p>
          <pre class="code-block">
${`@hotkey('Mod+K', { requireReset: true })
private _handleIncrementing(
  _event: KeyboardEvent,
  { hotkey }: HotkeyCallbackContext,
) {
  this.incrementCount++
}`}</pre
          >
        </section>

        <section class="demo-section">
          <h2>Conditional Hotkey</h2>
          <p>
            <kbd>${formatForDisplay('Mod+E')}</kbd> is currently
            <strong>${this.enabled ? 'enabled' : 'disabled'}</strong>
          </p>
          <button @click=${() => (this.enabled = !this.enabled)}>
            ${this.enabled ? 'Disable' : 'Enable'} Hotkey
          </button>
          <pre class="code-block">
${`@property({ type: Boolean }) enabled = true

@hotkey('Mod+E')
private _handleConditional = (
  _event: KeyboardEvent,
  { hotkey }: HotkeyCallbackContext,
) => {
  if (!this.enabled) return
  alert('This hotkey can be toggled!')
}`}</pre
          >
        </section>

        <section class="demo-section">
          <h2>Number Key Combinations</h2>
          <p>
            Tab 2 uses the physical number-row position
            (<code>Mod+[Digit2]</code>), even when that key produces a different
            character. The other tabs follow logical digits.
          </p>
          <div class="hotkey-grid">
            <div><kbd>${formatForDisplay('Mod+1')}</kbd> → Tab 1</div>
            <div><kbd>${formatForDisplay('Mod+[Digit2]')}</kbd> → Tab 2</div>
            <div><kbd>${formatForDisplay('Mod+3')}</kbd> → Tab 3</div>
            <div><kbd>${formatForDisplay('Mod+4')}</kbd> → Tab 4</div>
            <div><kbd>${formatForDisplay('Mod+5')}</kbd> → Tab 5</div>
          </div>
          <div class="counter">Active Tab: ${this.activeTab}</div>
          <pre class="code-block">
${`@hotkey('Mod+1')
private _tab1 = () => { this.activeTab = 1 }

@hotkey('Mod+[Digit2]')
private _tab2 = () => { this.activeTab = 2 }`}</pre
          >
        </section>

        <section class="demo-section">
          <h2>Navigation Key Combinations</h2>
          <p>Selection and navigation shortcuts:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>${formatForDisplay('Shift+ArrowUp')}</kbd> — Select up
            </div>
            <div>
              <kbd>${formatForDisplay('Shift+ArrowDown')}</kbd> — Select down
            </div>
            <div>
              <kbd>${formatForDisplay('Alt+ArrowLeft')}</kbd> — Navigate back
            </div>
            <div>
              <kbd>${formatForDisplay('Alt+ArrowRight')}</kbd> — Navigate
              forward
            </div>
            <div><kbd>${formatForDisplay('Mod+Home')}</kbd> — Go to start</div>
            <div><kbd>${formatForDisplay('Mod+End')}</kbd> — Go to end</div>
            <div>
              <kbd>${formatForDisplay('Control+PageUp')}</kbd> — Previous page
            </div>
            <div>
              <kbd>${formatForDisplay('Control+PageDown')}</kbd> — Next page
            </div>
          </div>
          <div class="counter">
            Navigation triggered: ${this.navigationCount}x
          </div>
          <pre class="code-block">
${`@hotkey('Shift+ArrowUp', () => selectUp())
@hotkey('Alt+ArrowLeft', () => navigateBack())
@hotkey('Mod+Home', () => goToStart())
@hotkey('Control+PageUp', () => previousPage())`}</pre
          >
        </section>

        <section class="demo-section">
          <h2>Function Key Combinations</h2>
          <p>System and application shortcuts:</p>
          <div class="hotkey-grid">
            <div><kbd>${formatForDisplay('Alt+F4')}</kbd> — Close window</div>
            <div>
              <kbd>${formatForDisplay('Control+F5')}</kbd> — Hard refresh
            </div>
            <div><kbd>${formatForDisplay('Mod+F1')}</kbd> — Help</div>
            <div>
              <kbd>${formatForDisplay('Shift+F10')}</kbd> — Context menu
            </div>
            <div><kbd>${formatForDisplay('F12')}</kbd> — DevTools</div>
          </div>
          <div class="counter">
            Function keys triggered: ${this.functionKeyCount}x
          </div>
          <pre class="code-block">
${`@hotkey('Alt+F4', () => closeWindow())
@hotkey('Control+F5', () => hardRefresh())
@hotkey('Mod+F1', () => showHelp())
@hotkey('F12', () => openDevTools())`}</pre
          >
        </section>

        <section class="demo-section">
          <h2>Multi-Modifier Combinations</h2>
          <p>Complex shortcuts with multiple modifiers:</p>
          <div class="hotkey-grid">
            <div><kbd>${formatForDisplay('Mod+Shift+S')}</kbd> — Save As</div>
            <div><kbd>${formatForDisplay('Mod+Shift+Z')}</kbd> — Redo</div>
            <div>
              <kbd>${formatForDisplay('Control+Alt+A')}</kbd> — Special action
            </div>
            <div>
              <kbd>${formatForDisplay('Control+Shift+N')}</kbd> — New incognito
            </div>
            <div>
              <kbd>${formatForDisplay('Mod+Alt+T')}</kbd> — Toggle theme
            </div>
            <div>
              <kbd>${formatForDisplay('Control+Alt+Shift+X')}</kbd> — Triple
              modifier
            </div>
          </div>
          <div class="counter">
            Multi-modifier triggered: ${this.multiModifierCount}x
          </div>
          <pre class="code-block">
${`@hotkey('Mod+Shift+S', () => saveAs())
@hotkey('Mod+Shift+Z', () => redo())
@hotkey('Control+Alt+A', () => specialAction())
@hotkey('Control+Alt+Shift+X', () => complexAction())`}</pre
          >
        </section>

        <section class="demo-section">
          <h2>Editing Key Combinations</h2>
          <p>Text editing and form shortcuts:</p>
          <div class="hotkey-grid">
            <div><kbd>${formatForDisplay('Mod+Enter')}</kbd> — Submit form</div>
            <div><kbd>${formatForDisplay('Shift+Enter')}</kbd> — New line</div>
            <div>
              <kbd>${formatForDisplay('Mod+Backspace')}</kbd> — Delete word
            </div>
            <div>
              <kbd>${formatForDisplay('Mod+Delete')}</kbd> — Delete forward
            </div>
            <div><kbd>${formatForDisplay('Control+Tab')}</kbd> — Next tab</div>
            <div>
              <kbd>${formatForDisplay('Shift+Tab')}</kbd> — Previous field
            </div>
            <div><kbd>${formatForDisplay('Mod+Space')}</kbd> — Toggle</div>
          </div>
          <div class="counter">
            Editing keys triggered: ${this.editingKeyCount}x
          </div>
          <pre class="code-block">
${`@hotkey('Mod+Enter', () => submitForm())
@hotkey('Shift+Enter', () => insertNewline())
@hotkey('Mod+Backspace', () => deleteWord())
@hotkey('Control+Tab', () => nextTab())
@hotkey('Mod+Space', () => toggle())`}</pre
          >
        </section>

        ${this.lastHotkey
          ? html`
              <div class="info-box">
                <strong>Last triggered:</strong>
                ${formatForDisplay(this.lastHotkey)}
              </div>
            `
          : null}

        <p class="hint">Press <kbd>Escape</kbd> to reset all counters</p>

        <section class="demo-section scoped-section">
          <h2>Scoped Keyboard Shortcuts</h2>
          <p>
            Shortcuts can be scoped to specific DOM elements using the
            <code>target</code> option with <code>HotkeyController</code>. This
            allows different shortcuts to work in different parts of your
            application.
          </p>

          <div class="scoped-grid">
            <div class="scoped-area" tabindex="0" ${ref(this.sidebarRef)}>
              <h3>Sidebar (Scoped Area)</h3>
              <p>Click here to focus, then try:</p>
              <div class="hotkey-list">
                <div>
                  <kbd>${formatForDisplay('Mod+B')}</kbd> — Trigger sidebar
                  action
                </div>
                <div><kbd>${formatForDisplay('Mod+N')}</kbd> — New item</div>
              </div>
              <div class="counter">
                Sidebar shortcuts: ${this.sidebarShortcutCount}x
              </div>
              <p class="hint">
                These shortcuts only work when this sidebar area is focused or
                contains focus.
              </p>
            </div>

            <div class="scoped-area">
              <h3>Modal Dialog</h3>
              <button @click=${() => (this.modalOpen = true)}>
                Open Modal
              </button>

              ${this.modalOpen
                ? html`
                    <div
                      class="modal-overlay"
                      @click=${() => (this.modalOpen = false)}
                    >
                      <div
                        class="modal-content"
                        tabindex="0"
                        ${ref(this.modalRef)}
                        @click=${(e: Event) => e.stopPropagation()}
                      >
                        <h3>Modal Dialog (Scoped)</h3>
                        <p>Try these shortcuts while modal is open:</p>
                        <div class="hotkey-list">
                          <div>
                            <kbd>${formatForDisplay('Escape')}</kbd> — Close
                            modal
                          </div>
                          <div>
                            <kbd>${formatForDisplay('Mod+Enter')}</kbd> — Submit
                          </div>
                        </div>

                        <div class="counter">
                          Modal shortcuts: ${this.modalShortcutCount}x
                        </div>
                        <p class="hint">
                          These shortcuts only work when the modal is open and
                          focused.
                        </p>
                        <button @click=${() => (this.modalOpen = false)}>
                          Close
                        </button>
                      </div>
                    </div>
                  `
                : null}
            </div>

            <div class="scoped-area">
              <h3>Text Editor (Scoped)</h3>
              <p>Focus the editor below and try:</p>
              <div class="hotkey-list">
                <div>
                  <kbd>${formatForDisplay('Mod+S')}</kbd> — Save editor content
                </div>
                <div><kbd>${formatForDisplay('Mod+/')}</kbd> — Add comment</div>
                <div>
                  <kbd>${formatForDisplay('Mod+K')}</kbd> — Clear editor
                </div>
                <div><kbd>J</kbd> — Single key (test ignoreInputs)</div>
              </div>
              <textarea
                class="scoped-editor"
                rows="8"
                .value=${this.editorContent}
                @input=${(e: InputEvent) =>
                  (this.editorContent = (
                    e.target as HTMLTextAreaElement
                  ).value)}
                placeholder="Focus here and try the shortcuts above..."
                ${ref(this.editorRef)}
              ></textarea>

              <div class="counter">
                Editor shortcuts: ${this.editorShortcutCount}x
              </div>
              <p class="hint">
                These shortcuts only work when the editor is focused. Notice
                that
                <kbd>${formatForDisplay('Mod+S')}</kbd> here doesn't conflict
                with the global
                <kbd>${formatForDisplay('Mod+S')}</kbd> shortcut.
              </p>
            </div>
          </div>

          <pre class="code-block">
${`// Scoped to a ref (register after first render)
const manager = getHotkeyManager()
const sidebar = this.sidebarRef.value

manager.register(
  'Mod+B',
  () => { console.log('Sidebar shortcut!') },
  { target: sidebar }
)

// Scoped to a modal (register/unregister when opened/closed)
manager.register(
  'Escape',
  () => { this.modalOpen = false },
  { target: this.modalRef.value }
)

// Scoped to an editor
manager.register(
  'Mod+S',
  () => saveEditorContent(),
  { target: this.editorRef.value }
)`}</pre
          >
        </section>
      </main>
    </div>`
  }

  // ============================================================================
  // Basic Hotkeys
  // ============================================================================

  // Browser default: Save page (downloads the current page)
  // Basic hotkey with callback context
  @hotkey('Mod+S')
  private _handleSaving = (
    _event: KeyboardEvent,
    { hotkey, parsedHotkey }: HotkeyCallbackContext,
  ) => {
    this.lastHotkey = hotkey
    this.saveCount++
    console.log(this.saveCount)
    console.log('Hotkey triggered:', hotkey)
    console.log('Parsed hotkey:', parsedHotkey)
  }

  // requireReset prevents repeated triggering while holding keys
  @hotkey('Mod+K', { requireReset: true })
  private _handleIncrementing(
    _event: KeyboardEvent,
    { hotkey }: HotkeyCallbackContext,
  ) {
    this.lastHotkey = hotkey
    this.incrementCount++
  }

  @hotkey('Mod+E')
  private _handleConditional = (
    _event: KeyboardEvent,
    { hotkey }: HotkeyCallbackContext,
  ) => {
    if (!this.enabled) return
    this.lastHotkey = hotkey
    alert('This hotkey can be toggled!')
  }

  // Number key combinations (tab switching)
  @hotkey('Mod+1')
  private _tab1 = () => {
    this.lastHotkey = 'Mod+1'
    this.activeTab = 1
  }

  @hotkey('Mod+[Digit2]')
  private _tab2 = () => {
    this.lastHotkey = 'Mod+[Digit2]'
    this.activeTab = 2
  }

  @hotkey('Mod+3')
  private _tab3 = () => {
    this.lastHotkey = 'Mod+3'
    this.activeTab = 3
  }

  @hotkey('Mod+4')
  private _tab4 = () => {
    this.lastHotkey = 'Mod+4'
    this.activeTab = 4
  }

  @hotkey('Mod+5')
  private _tab5 = () => {
    this.lastHotkey = 'Mod+5'
    this.activeTab = 5
  }

  // Navigation
  @hotkey('Shift+ArrowUp')
  private _navUp = () => {
    this.lastHotkey = 'Shift+ArrowUp'
    this.navigationCount++
  }

  @hotkey('Shift+ArrowDown')
  private _navDown = () => {
    this.lastHotkey = 'Shift+ArrowDown'
    this.navigationCount++
  }

  @hotkey('Alt+ArrowLeft')
  private _navLeft = () => {
    this.lastHotkey = 'Alt+ArrowLeft'
    this.navigationCount++
  }

  @hotkey('Alt+ArrowRight')
  private _navRight = () => {
    this.lastHotkey = 'Alt+ArrowRight'
    this.navigationCount++
  }

  @hotkey('Mod+Home')
  private _navHome = () => {
    this.lastHotkey = 'Mod+Home'
    this.navigationCount++
  }

  @hotkey('Mod+End')
  private _navEnd = () => {
    this.lastHotkey = 'Mod+End'
    this.navigationCount++
  }

  @hotkey('Control+PageUp')
  private _pageUp = () => {
    this.lastHotkey = 'Control+PageUp'
    this.navigationCount++
  }

  @hotkey('Control+PageDown')
  private _pageDown = () => {
    this.lastHotkey = 'Control+PageDown'
    this.navigationCount++
  }

  // Function keys
  @hotkey('Meta+F4')
  private _f4 = () => {
    this.lastHotkey = 'Meta+F4'
    this.functionKeyCount++
    alert('Meta+F4 pressed (normally closes window)')
  }

  @hotkey('Control+F5')
  private _f5 = () => {
    this.lastHotkey = 'Control+F5'
    this.functionKeyCount++
  }

  @hotkey('Mod+F1')
  private _f1 = () => {
    this.lastHotkey = 'Mod+F1'
    this.functionKeyCount++
  }

  @hotkey('Shift+F10')
  private _f10 = () => {
    this.lastHotkey = 'Shift+F10'
    this.functionKeyCount++
  }

  @hotkey('F12')
  private _f12 = () => {
    this.lastHotkey = 'F12'
    this.functionKeyCount++
  }

  // Multi-modifier
  @hotkey('Mod+Shift+S')
  private _modShiftS = () => {
    this.lastHotkey = 'Mod+Shift+S'
    this.multiModifierCount++
  }

  @hotkey('Mod+Shift+Z')
  private _modShiftZ = () => {
    this.lastHotkey = 'Mod+Shift+Z'
    this.multiModifierCount++
  }

  @hotkey({ key: 'A', ctrl: true, alt: true })
  private _ctrlAltA = () => {
    this.lastHotkey = 'Control+Alt+A'
    this.multiModifierCount++
  }

  @hotkey('Control+Shift+N')
  private _ctrlShiftN = () => {
    this.lastHotkey = 'Control+Shift+N'
    this.multiModifierCount++
  }

  @hotkey('Mod+Alt+T')
  private _modAltT = () => {
    this.lastHotkey = 'Mod+Alt+T'
    this.multiModifierCount++
  }

  @hotkey('Control+Alt+Shift+X')
  private _ctrlAltShiftX = () => {
    this.lastHotkey = 'Control+Alt+Shift+X'
    this.multiModifierCount++
  }

  // Editing keys
  @hotkey('Mod+Enter')
  private _modEnter = () => {
    this.lastHotkey = 'Mod+Enter'
    this.editingKeyCount++
  }

  @hotkey('Shift+Enter')
  private _shiftEnter = () => {
    this.lastHotkey = 'Shift+Enter'
    this.editingKeyCount++
  }

  @hotkey('Mod+Backspace')
  private _modBackspace = () => {
    this.lastHotkey = 'Mod+Backspace'
    this.editingKeyCount++
  }

  @hotkey('Mod+Delete')
  private _modDelete = () => {
    this.lastHotkey = 'Mod+Delete'
    this.editingKeyCount++
  }

  @hotkey('Control+Tab')
  private _ctrlTab = () => {
    this.lastHotkey = 'Control+Tab'
    this.editingKeyCount++
  }

  @hotkey('Shift+Tab')
  private _shiftTab = () => {
    this.lastHotkey = 'Shift+Tab'
    this.editingKeyCount++
  }

  @hotkey('Mod+Space')
  private _modSpace = () => {
    this.lastHotkey = 'Mod+Space'
    this.editingKeyCount++
  }

  // Escape: reset all
  @hotkey({ key: 'Escape' })
  private _escape = () => {
    this.lastHotkey = null
    this.saveCount = 0
    this.incrementCount = 0
    this.navigationCount = 0
    this.functionKeyCount = 0
    this.multiModifierCount = 0
    this.editingKeyCount = 0
    this.sidebarShortcutCount = 0
    this.modalShortcutCount = 0
    this.editorShortcutCount = 0
    this.activeTab = 1
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-app': MyApp
  }
}
