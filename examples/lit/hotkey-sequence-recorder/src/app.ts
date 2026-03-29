import { LitElement, css, html, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  HeldKeysController,
  HotkeyRegistrationsController,
  HotkeySequenceRecorderController,
  formatForDisplay,
  getSequenceManager,
} from '@tanstack/lit-hotkeys'
import appStyles from './index.css?raw'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceRegistrationHandle,
} from '@tanstack/lit-hotkeys'

interface Shortcut {
  id: string
  name: string
  description: string
  sequence: HotkeySequence
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
    sequence: ['Mod+S'],
  },
  {
    id: createId(),
    name: 'Open (gg)',
    description: 'Open the file browser',
    sequence: ['G', 'G'],
  },
  {
    id: createId(),
    name: 'New (dd)',
    description: 'Create a new document',
    sequence: ['D', 'D'],
  },
  {
    id: createId(),
    name: 'Close',
    description: 'Close the current tab',
    sequence: ['Mod+Shift+K'],
  },
  {
    id: createId(),
    name: 'Undo (yy)',
    description: 'Undo the last action',
    sequence: ['Y', 'Y'],
  },
  {
    id: createId(),
    name: 'Redo',
    description: 'Redo the last undone action',
    sequence: ['Mod+Shift+G'],
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

  private recorder = new HotkeySequenceRecorderController(this, {
    onRecord: (sequence: HotkeySequence) => {
      if (this._editingId) {
        this._shortcuts = this._shortcuts.map((s) =>
          s.id === this._editingId
            ? {
                ...s,
                sequence,
                name: this._draftName,
                description: this._draftDescription,
              }
            : s,
        )
        this._editingId = null
        this._reregisterSequences()
      }
    },
    onCancel: () => {
      // If this was a brand-new shortcut with no sequence yet, remove it
      if (this._editingId) {
        const shortcut = this._shortcuts.find((s) => s.id === this._editingId)
        if (shortcut && shortcut.sequence.length === 0) {
          this._shortcuts = this._shortcuts.filter(
            (s) => s.id !== this._editingId,
          )
        }
      }
      this._editingId = null
      this._reregisterSequences()
    },
    onClear: () => {
      if (this._editingId) {
        this._shortcuts = this._shortcuts.map((s) =>
          s.id === this._editingId
            ? {
                ...s,
                sequence: [],
                name: this._draftName,
                description: this._draftDescription,
              }
            : s,
        )
        this._editingId = null
        this._reregisterSequences()
      }
    },
  })

  @state() private _shortcuts: Array<Shortcut> = [...INITIAL_SHORTCUTS]
  @state() private _editingId: string | null = null
  @state() private _draftName = ''
  @state() private _draftDescription = ''

  private _sequenceRegistrations: Array<SequenceRegistrationHandle> = []

  override connectedCallback(): void {
    super.connectedCallback()
    this._reregisterSequences()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this._unregisterAll()
  }

  private _unregisterAll(): void {
    for (const reg of this._sequenceRegistrations) {
      if (reg.isActive) {
        reg.unregister()
      }
    }
    this._sequenceRegistrations = []
  }

  private _reregisterSequences(): void {
    this._unregisterAll()

    if (this.recorder.isRecording) return

    const manager = getSequenceManager()

    for (const shortcut of this._shortcuts) {
      if (shortcut.sequence.length === 0) continue

      const callback: HotkeyCallback = () => {
        console.log(`${shortcut.name} triggered:`, shortcut.sequence)
      }

      const reg = manager.register(shortcut.sequence, callback, {
        target: document,
        meta: {
          name: shortcut.name,
          description: shortcut.description,
        },
      })
      this._sequenceRegistrations.push(reg)
    }
  }

  private _handleEdit(id: string): void {
    const shortcut = this._shortcuts.find((s) => s.id === id)
    if (!shortcut) return
    this._editingId = id
    this._draftName = shortcut.name
    this._draftDescription = shortcut.description
    this._unregisterAll()
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
      this._reregisterSequences()
    }
  }

  private _handleCancel(): void {
    this.recorder.cancelRecording()
    // onCancel callback handles cleanup
  }

  private _handleDelete(id: string): void {
    this._shortcuts = this._shortcuts.filter((s) => s.id !== id)
    this._reregisterSequences()
  }

  private _handleCreateNew(): void {
    const newShortcut: Shortcut = {
      id: createId(),
      name: '',
      description: '',
      sequence: [],
    }
    this._shortcuts = [...this._shortcuts, newShortcut]
    this._editingId = newShortcut.id
    this._draftName = ''
    this._draftDescription = ''
    this._unregisterAll()
    this.recorder.startRecording()
  }

  render() {
    return html`
      <div class="app">
        <header>
          <h1>Sequence Shortcut Settings</h1>
          <p>
            Customize Vim-style sequences. Click Edit, press each chord in
            order, then press Enter to save. Escape cancels; Backspace removes
            the last chord or clears when empty.
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
                        ${isEditing
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
                              ${shortcut.name ||
                              html`<span class="unnamed">Unnamed</span>`}
                              ${shortcut.description
                                ? html`<div class="shortcut-description">
                                    ${shortcut.description}
                                  </div>`
                                : nothing}
                            `}
                      </div>
                      <div class="shortcut-hotkey">
                        ${isEditing
                          ? html`
                              <div class="recording-indicator">
                                ${this.recorder.steps.length > 0
                                  ? html`
                                      <span class="held-hotkeys">
                                        ${this.recorder.steps
                                          .map((h) => formatForDisplay(h))
                                          .join(' ')}
                                      </span>
                                    `
                                  : this.heldKeys.value.length > 0
                                    ? html`
                                        <div class="held-hotkeys">
                                          ${this.heldKeys.value.map(
                                            (key, index) => html`
                                              ${index > 0
                                                ? html`<span class="plus"
                                                    >+</span
                                                  >`
                                                : nothing}
                                              <kbd>${key}</kbd>
                                            `,
                                          )}
                                        </div>
                                      `
                                    : html`
                                        <span class="recording-text">
                                          Press chords, then Enter...
                                        </span>
                                      `}
                              </div>
                            `
                          : shortcut.sequence.length > 0
                            ? html`<kbd>
                                ${shortcut.sequence
                                  .map((h) => formatForDisplay(h))
                                  .join(' ')}
                              </kbd>`
                            : html`<span class="no-shortcut"
                                >No shortcut</span
                              >`}
                      </div>
                    </div>
                    <div class="shortcut-actions">
                      ${isEditing
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
                          `}
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

          ${this.recorder.isRecording
            ? html`
                <div class="info-box recording-notice">
                  <strong>Recording sequence...</strong> Press each chord, then
                  Enter to finish. Escape cancels. Backspace removes the last
                  chord or clears.
                  ${this.recorder.steps.length > 0
                    ? html`
                        <div>
                          Steps:
                          ${this.recorder.steps.map(
                            (h, i) => html`
                              ${i > 0 ? ' ' : ''}<kbd
                                >${formatForDisplay(h)}</kbd
                              >
                            `,
                          )}
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}

          <section class="demo-section">
            <h2>Live Registrations</h2>
            <p>
              This table is powered by
              <code>HotkeyRegistrationsController</code> — trigger counts,
              names, and descriptions update in real-time as you use your
              sequences.
            </p>
            <table class="registrations-table">
              <thead>
                <tr>
                  <th>Sequence</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Enabled</th>
                  <th>Triggers</th>
                </tr>
              </thead>
              <tbody>
                ${this.registrations.sequences.map(
                  (reg) => html`
                    <tr>
                      <td>
                        ${reg.sequence.map(
                          (s, i) => html`
                            ${i > 0 ? ' ' : ''}<kbd>${formatForDisplay(s)}</kbd>
                          `,
                        )}
                      </td>
                      <td>${reg.options.meta?.name ?? '\u2014'}</td>
                      <td class="description-cell">
                        ${reg.options.meta?.description ?? '\u2014'}
                      </td>
                      <td>
                        <span
                          class=${reg.options.enabled !== false
                            ? 'status-on'
                            : 'status-off'}
                        >
                          ${reg.options.enabled !== false ? 'yes' : 'no'}
                        </span>
                      </td>
                      <td class="trigger-count">${reg.triggerCount}</td>
                    </tr>
                  `,
                )}
                ${this.registrations.sequences.length === 0
                  ? html`
                      <tr>
                        <td colspan="5" class="empty-row">
                          No sequences registered
                        </td>
                      </tr>
                    `
                  : nothing}
              </tbody>
            </table>
          </section>

          <section class="demo-section">
            <h2>Usage</h2>
            <pre class="code-block">
${`import {
  HotkeySequenceRecorderController,
  HotkeyRegistrationsController,
  formatForDisplay,
  getSequenceManager,
} from '@tanstack/lit-hotkeys'
import type { HotkeySequence } from '@tanstack/lit-hotkeys'

class ShortcutSettings extends LitElement {
  private recorder = new HotkeySequenceRecorderController(this, {
    onRecord: (sequence) => {
      this.sequence = sequence
      this.requestUpdate()
    },
    onCancel: () => {
      console.log('Recording cancelled')
    },
  })

  private registrations = new HotkeyRegistrationsController(this)

  // Register with meta for display in registrations viewer
  const reg = manager.register(sequence, callback, {
    meta: { name: 'Save', description: 'Save the document' },
  })

  // Read all registrations reactively
  // this.registrations.sequences[0].options.meta?.name → 'Save'
  // this.registrations.sequences[0].triggerCount → 3
}`}</pre
            >
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
