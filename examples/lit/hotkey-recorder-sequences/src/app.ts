import { LitElement, css, html, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  HeldKeysController,
  HotkeyRecorderController,
  HotkeyRegistrationsController,
  formatForDisplay,
  getHotkeyManager,
} from '@tanstack/lit-hotkeys'
import appStyles from './index.css?raw'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyRegistrationHandle,
} from '@tanstack/lit-hotkeys'

interface Shortcut {
  id: string
  name: string
  description: string
  /** A chord or a sequence; null when unassigned */
  hotkey: Hotkey | null
}

let nextId = 0
function createId(): string {
  return `shortcut_${++nextId}`
}

const INITIAL_SHORTCUTS: Array<Shortcut> = [
  {
    id: createId(),
    name: 'Save',
    description: 'Save the current document',
    hotkey: 'Mod+S',
  },
  {
    id: createId(),
    name: 'Open (gg)',
    description: 'Open the file browser',
    hotkey: ['G', 'G'],
  },
  {
    id: createId(),
    name: 'New (dd)',
    description: 'Create a new document',
    hotkey: ['D', 'D'],
  },
  {
    id: createId(),
    name: 'Close',
    description: 'Close the current tab',
    hotkey: 'Mod+Shift+K',
  },
  {
    id: createId(),
    name: 'Undo (yy)',
    description: 'Undo the last action',
    hotkey: ['Y', 'Y'],
  },
  {
    id: createId(),
    name: 'Redo',
    description: 'Redo the last undone action',
    hotkey: 'Mod+Shift+G',
  },
]

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
  private registrations = new HotkeyRegistrationsController(this)

  private recorder = new HotkeyRecorderController(this, {
    // Record up to four chords; Enter or the fourth chord commits.
    maxSteps: 4,
    onRecord: (hotkey: Hotkey) => {
      if (this._editingId) {
        this._shortcuts = this._shortcuts.map((s) =>
          s.id === this._editingId
            ? {
                ...s,
                hotkey,
                name: this._draftName,
                description: this._draftDescription,
              }
            : s,
        )
        this._editingId = null
        this._reregisterShortcuts()
      }
    },
    onCancel: () => {
      // If this was a brand-new shortcut with no hotkey yet, remove it
      if (this._editingId) {
        const shortcut = this._shortcuts.find((s) => s.id === this._editingId)
        if (shortcut && shortcut.hotkey === null) {
          this._shortcuts = this._shortcuts.filter(
            (s) => s.id !== this._editingId,
          )
        }
      }
      this._editingId = null
      this._reregisterShortcuts()
    },
    onClear: () => {
      if (this._editingId) {
        this._shortcuts = this._shortcuts.map((s) =>
          s.id === this._editingId
            ? {
                ...s,
                hotkey: null,
                name: this._draftName,
                description: this._draftDescription,
              }
            : s,
        )
        this._editingId = null
        this._reregisterShortcuts()
      }
    },
  })

  @state() private _shortcuts: Array<Shortcut> = [...INITIAL_SHORTCUTS]
  @state() private _editingId: string | null = null
  @state() private _draftName = ''
  @state() private _draftDescription = ''

  private _registrations: Array<HotkeyRegistrationHandle> = []

  override connectedCallback(): void {
    super.connectedCallback()
    this._reregisterShortcuts()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this._unregisterAll()
  }

  private _unregisterAll(): void {
    for (const reg of this._registrations) {
      if (reg.isActive) {
        reg.unregister()
      }
    }
    this._registrations = []
  }

  private _reregisterShortcuts(): void {
    this._unregisterAll()

    const manager = getHotkeyManager()

    // Chords and sequences register the same way
    for (const shortcut of this._shortcuts) {
      if (shortcut.hotkey === null) continue

      const callback: HotkeyCallback = () => {
        console.log(`${shortcut.name} triggered:`, shortcut.hotkey)
      }

      const reg = manager.register(shortcut.hotkey, callback, {
        target: document,
        meta: {
          name: shortcut.name,
          description: shortcut.description,
        },
      })
      this._registrations.push(reg)
    }
  }

  private _handleEdit(id: string): void {
    const shortcut = this._shortcuts.find((s) => s.id === id)
    if (!shortcut) return
    this._editingId = id
    this._draftName = shortcut.name
    this._draftDescription = shortcut.description
    this.recorder.startRecording()
  }

  private _handleSaveEditing(): void {
    if (this._editingId) {
      this._shortcuts = this._shortcuts.map((s) =>
        s.id === this._editingId
          ? { ...s, name: this._draftName, description: this._draftDescription }
          : s,
      )
      this.recorder.stopRecording()
      this._editingId = null
      this._reregisterShortcuts()
    }
  }

  private _handleCancel(): void {
    this.recorder.cancelRecording()
    // onCancel callback handles cleanup
  }

  private _handleDelete(id: string): void {
    this._shortcuts = this._shortcuts.filter((s) => s.id !== id)
    this._reregisterShortcuts()
  }

  private _handleCreateNew(): void {
    const newShortcut: Shortcut = {
      id: createId(),
      name: '',
      description: '',
      hotkey: null,
    }
    this._shortcuts = [...this._shortcuts, newShortcut]
    this._editingId = newShortcut.id
    this._draftName = ''
    this._draftDescription = ''
    this.recorder.startRecording()
  }

  render() {
    return html`
      <div class="app">
        <header>
          <h1>Recording Sequences</h1>
          <p>
            <code>HotkeyRecorderController</code> with <code>maxSteps</code>
            records up to that many chords. Click Edit, press each chord in
            order, then press Enter (or reach four chords) to save. One chord
            saves as a regular hotkey. Escape cancels; Backspace removes the
            last chord or clears when empty.
          </p>
        </header>

        <main>
          <section class="demo-section">
            <h2>Shortcuts</h2>
            <div class="shortcuts-list">
              ${this._shortcuts.map((shortcut) => {
                const isEditing = this._editingId === shortcut.id
                const displayName = isEditing ? this._draftName : shortcut.name
                const displayDescription = isEditing
                  ? this._draftDescription
                  : shortcut.description

                return html`
                  <div class="shortcut-item ${isEditing ? 'recording' : ''}">
                    <div class="shortcut-item-content">
                      <div class="shortcut-action">
                        ${
                          isEditing
                            ? html`
                                <div class="editing-fields">
                                  <input
                                    type="text"
                                    class="edit-input edit-name"
                                    .value=${displayName}
                                    @input=${(e: InputEvent) =>
                                      (this._draftName = (
                                        e.target as HTMLInputElement
                                      ).value)}
                                    placeholder="Shortcut name"
                                  />
                                  <input
                                    type="text"
                                    class="edit-input edit-description"
                                    .value=${displayDescription}
                                    @input=${(e: InputEvent) =>
                                      (this._draftDescription = (
                                        e.target as HTMLInputElement
                                      ).value)}
                                    placeholder="Description (optional)"
                                  />
                                </div>
                              `
                            : html`
                                ${
                                  shortcut.name ||
                                  html`<span class="unnamed">Unnamed</span>`
                                }
                                ${
                                  shortcut.description
                                    ? html`<div class="shortcut-description">
                                        ${shortcut.description}
                                      </div>`
                                    : nothing
                                }
                              `
                        }
                      </div>
                      <div class="shortcut-hotkey">
                        ${
                          isEditing
                            ? html`
                                <div class="recording-indicator">
                                  ${
                                    this.recorder.steps.length > 0
                                      ? html`
                                          <span class="held-hotkeys">
                                            ${formatForDisplay(
                                              this.recorder.steps,
                                            )}
                                          </span>
                                        `
                                      : this.heldKeys.value.length > 0
                                        ? html`
                                            <div class="held-hotkeys">
                                              ${this.heldKeys.value.map(
                                                (key, index) => html`
                                                  ${
                                                    index > 0
                                                      ? html`<span class="plus"
                                                          >+</span
                                                        >`
                                                      : nothing
                                                  }
                                                  <kbd>${key}</kbd>
                                                `,
                                              )}
                                            </div>
                                          `
                                        : html`
                                            <span class="recording-text">
                                              Press chords, then Enter...
                                            </span>
                                          `
                                  }
                                </div>
                              `
                            : shortcut.hotkey !== null
                              ? html`<kbd>
                                  ${formatForDisplay(shortcut.hotkey)}
                                </kbd>`
                              : html`<span class="no-shortcut"
                                  >No shortcut</span
                                >`
                        }
                      </div>
                    </div>
                    <div class="shortcut-actions">
                      ${
                        isEditing
                          ? html`
                              <button
                                class="save-button"
                                @click=${() => this._handleSaveEditing()}
                              >
                                Save
                              </button>
                              <button
                                class="cancel-button"
                                @click=${() => this._handleCancel()}
                              >
                                Cancel
                              </button>
                            `
                          : html`
                              <button
                                class="edit-button"
                                @click=${() => this._handleEdit(shortcut.id)}
                              >
                                Edit
                              </button>
                              <button
                                class="delete-button"
                                @click=${() => this._handleDelete(shortcut.id)}
                              >
                                Delete
                              </button>
                            `
                      }
                    </div>
                  </div>
                `
              })}
            </div>
            <button
              class="create-button"
              @click=${() => this._handleCreateNew()}
              ?disabled=${this.recorder.isRecording}
            >
              + Create New Shortcut
            </button>
          </section>

          ${
            this.recorder.isRecording
              ? html`
                  <div class="info-box recording-notice">
                    <strong>Recording...</strong> Press up to four chords, then
                    Enter to finish. Escape cancels. Backspace removes the last
                    chord or clears.
                    ${
                      this.recorder.steps.length > 0
                        ? html`
                            <div>
                              Steps:
                              <kbd
                                >${formatForDisplay(this.recorder.steps)}</kbd
                              >
                            </div>
                          `
                        : nothing
                    }
                  </div>
                `
              : nothing
          }

          <section class="demo-section">
            <h2>Live Registrations</h2>
            <p>
              This table is powered by
              <code>HotkeyRegistrationsController</code> — trigger counts,
              names, and descriptions update in real-time as you use your
              shortcuts.
            </p>
            <table class="registrations-table">
              <thead>
                <tr>
                  <th>Hotkey</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Progress</th>
                  <th>Enabled</th>
                  <th>Triggers</th>
                </tr>
              </thead>
              <tbody>
                ${this.registrations.hotkeys.map(
                  (reg) => html`
                    <tr>
                      <td><kbd>${formatForDisplay(reg.hotkey)}</kbd></td>
                      <td>${reg.options.meta?.name ?? '\u2014'}</td>
                      <td class="description-cell">
                        ${reg.options.meta?.description ?? '\u2014'}
                      </td>
                      <td>
                        ${
                          reg.kind === 'sequence'
                            ? `${reg.matchedStepCount}/${reg.hotkey.length}`
                            : '\u2014'
                        }
                      </td>
                      <td>
                        <span
                          class=${reg.options.enabled !== false ? 'status-on' : 'status-off'}
                        >
                          ${reg.options.enabled !== false ? 'yes' : 'no'}
                        </span>
                      </td>
                      <td class="trigger-count">${reg.triggerCount}</td>
                    </tr>
                  `,
                )}
                ${
                  this.registrations.hotkeys.length === 0
                    ? html`
                        <tr>
                          <td colspan="6" class="empty-row">
                            No hotkeys registered
                          </td>
                        </tr>
                      `
                    : nothing
                }
              </tbody>
            </table>
          </section>

          <section class="demo-section">
            <h2>Usage</h2>
            <pre class="code-block">
${`import {
  HotkeyRecorderController,
  HotkeyRegistrationsController,
  getHotkeyManager,
} from '@tanstack/lit-hotkeys'

class ShortcutSettings extends LitElement {
  // Record a chord or a sequence of up to four chords
  private recorder = new HotkeyRecorderController(this, {
    maxSteps: 4,
    onRecord: (hotkey) => {
      this.hotkey = hotkey // 'Mod+S' or ['G', 'G']
      this.requestUpdate()
    },
  })

  private registrations = new HotkeyRegistrationsController(this)

  // Chords and sequences register the same way, with meta
  const reg = getHotkeyManager().register(hotkey, callback, {
    meta: { name: 'Save', description: 'Save the document' },
  })

  // Read all registrations reactively
  // this.registrations.hotkeys[0].options.meta?.name → 'Save'
  // this.registrations.hotkeys[0].triggerCount → 3
}`}</pre>
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
