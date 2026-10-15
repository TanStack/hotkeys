import { fn } from '@ember/helper'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { on } from '@ember/modifier'

import {
  formatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
  useHotkeyRegistrations,
  useHeldKeys,
} from '@tanstack/ember-hotkeys'
import type {
  EmberHotkeyDefinition,
  Hotkey,
  HotkeyRegistrationView,
  HotkeySequence,
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

const progress = (reg: HotkeyRegistrationView) =>
  reg.kind === 'sequence'
    ? `${reg.matchedStepCount}/${reg.hotkey.length}`
    : '\u2014'

class App extends Component {
  usage0 =
    'recorder = useHotkeyRecorder(this, {\n  maxSteps: 4,\n  onRecord: (value) => this.updateShortcut(value),\n  onCancel: () => this.cancelEditing(),\n  onClear: () => this.clearShortcut(),\n})\nregistrations = useHotkeyRegistrations(this)\n\n<template>\n  {{useHotkeys this.definitions}}\n  <button type="button" {{on "click" this.recorder.startRecording}}>Record</button>\n</template>'
  @tracked shortcuts: Array<Shortcut> = INITIAL_SHORTCUTS
  @tracked editingId: string | null = null
  @tracked draftName: string = ''
  @tracked draftDescription: string = ''
  recorder = useHotkeyRecorder(this, () => ({
    // Record up to four chords; Enter or the fourth chord commits.
    maxSteps: 4,
    onRecord: (hotkey: Hotkey) => {
      if (this.editingId) {
        this.shortcuts = this.shortcuts.map((s) =>
          s.id === this.editingId
            ? {
                ...s,
                hotkey,
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
          if (shortcut && shortcut.hotkey === null) {
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
                hotkey: null,
                name: this.draftName,
                description: this.draftDescription,
              }
            : s,
        )
        this.editingId = null
      }
    },
  }))
  setDraftName = (value: string) => {
    this.draftName = value
  }
  setDraftDescription = (value: string) => {
    this.draftDescription = value
  }
  get isRecording() {
    return this.recorder.isRecording
  }
  // Every assigned shortcut, chords and sequences alike, with meta
  get definitions(): Array<EmberHotkeyDefinition> {
    return this.shortcuts.flatMap((s) =>
      s.hotkey === null
        ? []
        : [
            {
              hotkey: s.hotkey,
              callback: () => {
                console.log(`${s.name} triggered:`, s.hotkey)
              },
              options: {
                meta: { name: s.name, description: s.description },
              },
            },
          ],
    )
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
      hotkey: null,
    }
    this.shortcuts = [...this.shortcuts, newShortcut]
    this.editingId = newShortcut.id
    this.draftName = ''
    this.draftDescription = ''
    this.recorder.startRecording()
  }

  <template>
    {{useHotkeys this.definitions}}
    <div class='app'>
      <header>
        <h1>Recording Sequences</h1>
        <p>
          <code>useHotkeyRecorder</code>
          with
          <code>maxSteps</code>
          records up to that many chords. Click Edit, press each chord in order,
          then press Enter (or reach four chords) to save. One chord saves as a
          regular hotkey. Escape cancels; Backspace removes the last chord or
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
                @onEdit={{fn this.handleEdit shortcut.id}}
                @onSave={{this.handleSaveEditing}}
                @onCancel={{this.handleCancel}}
                @onDelete={{fn this.handleDelete shortcut.id}}
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
            <strong>Recording...</strong>
            Press up to four chords, then Enter to finish. Escape cancels. Backspace
            removes the last chord or clears.
            {{#if (gt this.recorder.steps.length 0)}}<div>
                Steps:
                <kbd>{{formatForDisplay this.recorder.steps}}</kbd>
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
  registrationsState = useHotkeyRegistrations(this)
  get hotkeys() {
    return this.registrationsState.hotkeys
  }

  <template>
    <section class='demo-section'>
      <h2>Live Registrations</h2>
      <p>
        This table is powered by
        <code>useHotkeyRegistrations()</code>
        — trigger counts, names, and descriptions update in real-time as you use
        your shortcuts.
      </p>
      <table class='registrations-table'>
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
          {{#each this.hotkeys key='id' as |reg|}}<tr>
              <td>
                <kbd>{{formatForDisplay reg.hotkey}}</kbd>
              </td>
              <td>{{or reg.options.meta.name '—'}}</td>
              <td class='description-cell'>
                {{or reg.options.meta.description '—'}}
              </td>
              <td>{{progress reg}}</td>
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
          {{#if (eq this.hotkeys.length 0)}}<tr>
              <td colspan={{6}} class='empty-row'>
                No hotkeys registered
              </td>
            </tr>{{/if}}
        </tbody>
      </table>
    </section>
  </template>
}

class ShortcutListItem extends Component<{ Args: ShortcutListItemProps }> {
  heldKeys = useHeldKeys(this)
  get itemClass() {
    return `shortcut-item ${this.args.isEditing ? 'recording' : ''}`
  }
  updateDraftName = (e: Event) =>
    this.args.onDraftNameChange((e.currentTarget as HTMLInputElement).value)
  updateDraftDescription = (e: Event) =>
    this.args.onDraftDescriptionChange(
      (e.currentTarget as HTMLInputElement).value,
    )
  get liveSequenceText() {
    return formatForDisplay(this.args.liveSteps)
  }
  get savedHotkeyText() {
    const { hotkey } = this.args.shortcut
    return hotkey === null ? '' : formatForDisplay(hotkey)
  }

  <template>
    <div class={{this.itemClass}}>
      <div class='shortcut-item-content'>
        <div class='shortcut-action'>
          {{#if this.args.isEditing}}<div class='editing-fields'>
              <input
                type='text'
                class='edit-input edit-name'
                value={{this.args.draftName}}
                {{on 'input' this.updateDraftName}}
                placeholder='Shortcut name'
              />
              <input
                type='text'
                class='edit-input edit-description'
                value={{this.args.draftDescription}}
                {{on 'input' this.updateDraftDescription}}
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
                  {{this.liveSequenceText}}
                </span>{{else if (gt this.heldKeys.value.length 0)}}<div
                  class='held-hotkeys'
                >
                  {{#each this.heldKeys.value as |key index|}}
                    {{#if (gt index 0)}}<span class='plus'>+</span>{{/if}}
                    <kbd>{{key}}</kbd>
                  {{/each}}
                </div>{{else}}<span class='recording-text'>
                  Press chords, then Enter...
                </span>{{/if}}
            </div>{{else if this.savedHotkeyText}}<kbd>
              {{this.savedHotkeyText}}
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
