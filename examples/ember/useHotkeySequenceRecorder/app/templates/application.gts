import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { on } from '@ember/modifier'

import {
  formatForDisplay,
  useHotkeySequenceRecorder,
  useHotkeySequences,
  useHotkeyRegistrations,
  useHeldKeys,
} from '@tanstack/ember-hotkeys'
import type {
  HotkeySequence,
  HotkeySequenceDefinition,
} from '@tanstack/ember-hotkeys'
const eq = (a: unknown, b: unknown) => a === b
const neq = (a: unknown, b: unknown) => a !== b
const gt = (a: number, b: number) => a > b
const and = (a: unknown, b: unknown) => a && b
const or = <T, U>(a: T, b: U) => a || b
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

interface ShortcutListItemProps {
  shortcut: Shortcut
  isEditing: boolean
  draftName: string
  draftDescription: string
  onDraftNameChange: (value: string) => void
  onDraftDescriptionChange: (value: string) => void
  liveSteps: HotkeySequence
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
}

class App extends Component {
  usage0 =
    'recorder = useHotkeySequenceRecorder(this, {\n  onRecord: (value) => this.updateShortcut(value),\n  onCancel: () => this.cancelEditing(),\n  onClear: () => this.clearShortcut(),\n})\nregistrations = useHotkeyRegistrations(this)\n\n<template>\n  {{useHotkeySequences this.definitions enabled=(not this.recorder.isRecording)}}\n  <button type="button" {{on "click" this.recorder.startRecording}}>Record</button>\n</template>'
  @tracked shortcuts: Array<Shortcut> = INITIAL_SHORTCUTS
  @tracked editingId: string | null = null
  @tracked draftName: string = ''
  @tracked draftDescription: string = ''
  recorder = useHotkeySequenceRecorder(this, () => ({
    onRecord: (sequence: HotkeySequence) => {
      if (this.editingId) {
        this.shortcuts = this.shortcuts.map((s) =>
          s.id === this.editingId
            ? {
                ...s,
                sequence,
                name: this.draftName,
                description: this.draftDescription,
              }
            : s,
        )
        this.editingId = null
      }
    },
    onCancel: () => {
      if (this.editingId) {
        this.shortcuts = (() => {
          const shortcut = this.shortcuts.find((s) => s.id === this.editingId)
          if (shortcut && shortcut.sequence.length === 0) {
            return this.shortcuts.filter((s) => s.id !== this.editingId)
          }
          return this.shortcuts
        })()
      }
      this.editingId = null
    },
    onClear: () => {
      if (this.editingId) {
        this.shortcuts = this.shortcuts.map((s) =>
          s.id === this.editingId
            ? {
                ...s,
                sequence: [],
                name: this.draftName,
                description: this.draftDescription,
              }
            : s,
        )
        this.editingId = null
      }
    },
  }))
  handler1 = (shortcut: Shortcut) => () => this.handleEdit(shortcut.id)
  handler2 = (shortcut: Shortcut) => () => this.handleDelete(shortcut.id)
  setDraftName = (value: string) => {
    this.draftName = value
  }
  setDraftDescription = (value: string) => {
    this.draftDescription = value
  }
  get isRecording() {
    return this.recorder.isRecording
  }
  get sequenceDefinitions(): Array<HotkeySequenceDefinition> {
    return this.shortcuts
      .filter((s) => s.sequence.length > 0)
      .map((s) => ({
        sequence: s.sequence,
        callback: () => {
          console.log(`${s.name} triggered:`, s.sequence)
        },
        options: {
          enabled: !this.isRecording,
          meta: {
            name: s.name,
            description: s.description,
          },
        },
      }))
  }
  handleEdit = (id: string) => {
    const shortcut = this.shortcuts.find((s) => s.id === id)
    if (!shortcut) return
    this.editingId = id
    this.draftName = shortcut.name
    this.draftDescription = shortcut.description
    this.recorder.startRecording()
  }
  handleSaveEditing = () => {
    if (this.editingId) {
      this.shortcuts = this.shortcuts.map((s) =>
        s.id === this.editingId
          ? { ...s, name: this.draftName, description: this.draftDescription }
          : s,
      )
      this.recorder.stopRecording()
      this.editingId = null
    }
  }
  handleCancel = () => {
    this.recorder.cancelRecording()
  }
  handleDelete = (id: string) => {
    this.shortcuts = this.shortcuts.filter((s) => s.id !== id)
  }
  handleCreateNew = () => {
    const newShortcut: Shortcut = {
      id: createId(),
      name: '',
      description: '',
      sequence: [],
    }
    this.shortcuts = [...this.shortcuts, newShortcut]
    this.editingId = newShortcut.id
    this.draftName = ''
    this.draftDescription = ''
    this.recorder.startRecording()
  }

  <template>
    {{useHotkeySequences this.sequenceDefinitions}}
    <div class='app'>
      <header>
        <h1>Sequence Shortcut Settings</h1>
        <p>
          Customize Vim-style sequences. Click Edit, press each chord in order, then
          press Enter to save. Escape cancels; Backspace removes the last chord or
          clears when empty.
        </p>
      </header>

      <main>
        <section class='demo-section'>
          <h2>Shortcuts</h2>
          <div class='shortcuts-list'>
            {{#each this.shortcuts key='id' as |shortcut|}}<ShortcutListItem
                @shortcut={{shortcut}}
                @isEditing={{eq this.editingId shortcut.id}}
                @draftName={{if
                  (eq this.editingId shortcut.id)
                  this.draftName
                  shortcut.name
                }}
                @draftDescription={{if
                  (eq this.editingId shortcut.id)
                  this.draftDescription
                  shortcut.description
                }}
                @onDraftNameChange={{this.setDraftName}}
                @onDraftDescriptionChange={{this.setDraftDescription}}
                @liveSteps={{this.recorder.steps}}
                @onEdit={{this.handler1 shortcut}}
                @onSave={{this.handleSaveEditing}}
                @onCancel={{this.handleCancel}}
                @onDelete={{this.handler2 shortcut}}
              />{{/each}}
          </div>
          <button
            type='button'
            class='create-button'
            {{on 'click' this.handleCreateNew}}
            disabled={{this.isRecording}}
          >
            + Create New Shortcut
          </button>
        </section>

        {{#if this.recorder.isRecording}}<div class='info-box recording-notice'>
            <strong>Recording sequence...</strong>
            Press each chord, then Enter to finish. Escape cancels. Backspace
            removes the last chord or clears.
            {{#if (gt this.recorder.steps.length 0)}}<div>
                Steps:
                {{#each this.recorder.steps as |h i|}}
                  {{and (gt i 0) ' '}}
                  <kbd>{{formatForDisplay h}}</kbd>
                {{/each}}
              </div>{{/if}}
          </div>{{/if}}

        <RegistrationsViewer />

        <section class='demo-section'>
          <h2>Usage</h2>
          <pre class='code-block'>{{this.usage0}}</pre>
        </section>
      </main>

    </div>
  </template>
}

class RegistrationsViewer extends Component {
  registrationState0 = useHotkeyRegistrations(this)
  get sequences() {
    return this.registrationState0.sequences
  }

  <template>
    <section class='demo-section'>
      <h2>Live Registrations</h2>
      <p>
        This table is powered by
        <code>useHotkeyRegistrations()</code>
        — trigger counts, names, and descriptions update in real-time as you use
        your sequences.
      </p>
      <table class='registrations-table'>
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
          {{#each this.sequences key='id' as |reg|}}<tr>
              <td>
                {{#each reg.sequence as |s i|}}
                  {{and (gt i 0) ' '}}
                  <kbd>{{formatForDisplay s}}</kbd>
                {{/each}}
              </td>
              <td>{{or reg.options.meta.name '—'}}</td>
              <td class='description-cell'>
                {{or reg.options.meta.description '—'}}
              </td>
              <td>
                <span
                  class={{if
                    (neq reg.options.enabled false)
                    'status-on'
                    'status-off'
                  }}
                >
                  {{if (neq reg.options.enabled false) 'yes' 'no'}}
                </span>
              </td>
              <td class='trigger-count'>{{reg.triggerCount}}</td>
            </tr>{{/each}}
          {{#if (eq this.sequences.length 0)}}<tr>
              <td colspan={{5}} class='empty-row'>
                No sequences registered
              </td>
            </tr>{{/if}}
        </tbody>
      </table>
    </section>
  </template>
}

class ShortcutListItem extends Component<{ Args: ShortcutListItemProps }> {
  heldKeysState = useHeldKeys(this)
  get value1() {
    return `shortcut-item ${this.args.isEditing ? 'recording' : ''}`
  }
  handleInput2 = (e: Event) =>
    this.args.onDraftNameChange((e.currentTarget as HTMLInputElement).value)
  handleInput3 = (e: Event) =>
    this.args.onDraftDescriptionChange(
      (e.currentTarget as HTMLInputElement).value,
    )
  get value4() {
    return this.args.liveSteps.map((h) => formatForDisplay(h)).join(' ')
  }
  get value5() {
    return this.args.shortcut.sequence.map((h) => formatForDisplay(h)).join(' ')
  }
  get heldKeys() {
    return this.heldKeysState.value
  }

  <template>
    <div class={{this.value1}}>
      <div class='shortcut-item-content'>
        <div class='shortcut-action'>
          {{#if this.args.isEditing}}<div class='editing-fields'>
              <input
                type='text'
                class='edit-input edit-name'
                value={{this.args.draftName}}
                {{on 'input' this.handleInput2}}
                placeholder='Shortcut name'
              />
              <input
                type='text'
                class='edit-input edit-description'
                value={{this.args.draftDescription}}
                {{on 'input' this.handleInput3}}
                placeholder='Description (optional)'
              />
            </div>{{else}}
            {{#if this.args.shortcut.name}}{{this.args.shortcut.name}}{{else}}<span
                class='unnamed'
              >Unnamed</span>{{/if}}
            {{#if this.args.shortcut.description}}<div class='shortcut-description'>
                {{this.args.shortcut.description}}
              </div>{{/if}}
          {{/if}}
        </div>
        <div class='shortcut-hotkey'>
          {{#if this.args.isEditing}}<div class='recording-indicator'>
              {{#if (gt this.args.liveSteps.length 0)}}<span class='held-hotkeys'>
                  {{this.value4}}
                </span>{{else if (gt this.heldKeys.length 0)}}<div
                  class='held-hotkeys'
                >
                  {{#each this.heldKeys as |key index|}}
                    {{#if (gt index 0)}}<span class='plus'>+</span>{{/if}}
                    <kbd>{{key}}</kbd>
                  {{/each}}
                </div>{{else}}<span class='recording-text'>
                  Press chords, then Enter...
                </span>{{/if}}
            </div>{{else if (gt this.args.shortcut.sequence.length 0)}}<kbd>
              {{this.value5}}
            </kbd>{{else}}<span class='no-shortcut'>No shortcut</span>{{/if}}
        </div>
      </div>
      <div class='shortcut-actions'>
        {{#if this.args.isEditing}}
          <button type='button' {{on 'click' this.args.onSave}} class='save-button'>
            Save
          </button>
          <button
            type='button'
            {{on 'click' this.args.onCancel}}
            class='cancel-button'
          >
            Cancel
          </button>
        {{else}}
          <button type='button' {{on 'click' this.args.onEdit}} class='edit-button'>
            Edit
          </button>
          <button
            type='button'
            {{on 'click' this.args.onDelete}}
            class='delete-button'
          >
            Delete
          </button>
        {{/if}}
      </div>
    </div>
  </template>
}
export default App
