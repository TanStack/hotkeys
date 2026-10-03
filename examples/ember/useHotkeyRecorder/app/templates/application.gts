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
import type { Hotkey, HotkeyDefinition } from '@tanstack/ember-hotkeys'
const eq = (a: unknown, b: unknown) => a === b
const neq = (a: unknown, b: unknown) => a !== b
const gt = (a: number, b: number) => a > b
const or = <T, U>(a: T, b: U) => a || b
interface Shortcut {
  id: string
  name: string
  description: string
  hotkey: Hotkey | ''
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
    hotkey: 'Mod+[KeyK]',
  },
  {
    id: createId(),
    name: 'Open',
    description: 'Open a file from disk',
    hotkey: 'Mod+E',
  },
  {
    id: createId(),
    name: 'New',
    description: 'Create a new document',
    hotkey: 'Mod+G',
  },
  {
    id: createId(),
    name: 'Close',
    description: 'Close the current tab',
    hotkey: 'Mod+Shift+K',
  },
  {
    id: createId(),
    name: 'Undo',
    description: 'Undo the last action',
    hotkey: 'Mod+Shift+E',
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
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
}

class App extends Component {
  usage0 =
    'recorder = useHotkeyRecorder(this, {\n  onRecord: (value) => this.updateShortcut(value),\n  onCancel: () => this.cancelEditing(),\n  onClear: () => this.clearShortcut(),\n})\nregistrations = useHotkeyRegistrations(this)\n\n<template>\n  {{useHotkeys this.definitions enabled=(not this.recorder.isRecording)}}\n  <button type="button" {{on "click" this.recorder.startRecording}}>Record</button>\n</template>'
  @tracked shortcuts: Array<Shortcut> = INITIAL_SHORTCUTS
  @tracked editingId: string | null = null
  @tracked draftName: string = ''
  @tracked draftDescription: string = ''
  recorder = useHotkeyRecorder(this, () => ({
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
          if (shortcut && shortcut.hotkey === '') {
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
                hotkey: '',
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
  get hotkeyDefinitions(): Array<HotkeyDefinition> {
    return this.shortcuts
      .filter((s) => s.hotkey !== '')
      .map((s) => ({
        hotkey: s.hotkey as Hotkey,
        callback: () => {
          console.log(`${s.name} triggered:`, s.hotkey)
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
      hotkey: '',
    }
    this.shortcuts = [...this.shortcuts, newShortcut]
    this.editingId = newShortcut.id
    this.draftName = ''
    this.draftDescription = ''
    this.recorder.startRecording()
  }

  <template>
    {{useHotkeys this.hotkeyDefinitions}}
    <div class='app'>
      <header>
        <h1>Keyboard Shortcuts Settings</h1>
        <p>
          Customize your keyboard shortcuts. Click "Edit" to record a new shortcut,
          or press Escape to cancel.
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
            <strong>Recording shortcut...</strong>
            The physical key position will be saved. Press any key combination or
            Escape to cancel. Press Backspace/Delete to clear the shortcut.
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
  get hotkeys() {
    return this.registrationState0.hotkeys
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
              <td colspan={{5}} class='empty-row'>
                No hotkeys registered
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
              {{#if (gt this.heldKeys.length 0)}}<div class='held-hotkeys'>
                  {{#each this.heldKeys as |key index|}}
                    {{#if (gt index 0)}}<span class='plus'>+</span>{{/if}}
                    <kbd>{{key}}</kbd>
                  {{/each}}
                </div>{{else}}<span class='recording-text'>
                  Press any key combination...
                </span>{{/if}}
            </div>{{else if this.args.shortcut.hotkey}}<kbd>{{formatForDisplay
                this.args.shortcut.hotkey
              }}</kbd>{{else}}<span class='no-shortcut'>No shortcut</span>{{/if}}
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
