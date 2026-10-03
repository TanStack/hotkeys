import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import './index.css'
import type { Hotkey } from '@tanstack/alpine-hotkeys'

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

class App {
  private hotkeysScope = createHotkeysScope()

  usage0 =
    'const recorder = scope.createHotkeyRecorder({\n  onRecord: (value) => this.updateShortcut(value),\n  onCancel: () => this.cancelEditing(),\n  onClear: () => this.clearShortcut(),\n})\nscope.createHotkeys(() => this.definitions)\nconst registrations = scope.createHotkeyRegistrations()\nrecorder.startRecording()'
  shortcuts: Array<Shortcut> = INITIAL_SHORTCUTS
  editingId: string | null = null
  draftName = ''
  draftDescription = ''
  recorder!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeyRecorder']
  >
  setDraftName(value: string) {
    this.draftName = value
  }
  setDraftDescription(value: string) {
    this.draftDescription = value
  }
  get isRecording() {
    return this.recorder.isRecording
  }
  handleEdit(id: string) {
    const shortcut = this.shortcuts.find((s) => s.id === id)
    if (!shortcut) return
    this.editingId = id
    this.draftName = shortcut.name
    this.draftDescription = shortcut.description
    this.recorder.startRecording()
  }
  handleSaveEditing() {
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
  handleCancel() {
    this.recorder.cancelRecording()
  }
  handleDelete(id: string) {
    this.shortcuts = this.shortcuts.filter((s) => s.id !== id)
  }
  handleCreateNew() {
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

  init() {
    this.setDraftName = this.setDraftName.bind(this)
    this.setDraftDescription = this.setDraftDescription.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleSaveEditing = this.handleSaveEditing.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleCreateNew = this.handleCreateNew.bind(this)
    this.recorder = this.hotkeysScope.createHotkeyRecorder(() => ({
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
    this.hotkeysScope.createHotkeys(() =>
      this.shortcuts
        .filter((s) => s.hotkey !== '')
        .map((s) => ({
          hotkey: s.hotkey as Hotkey,
          callback: () => {
            console.log(`${s.name} triggered:`, s.hotkey)
          },
          options: {
            meta: {
              name: s.name,
              description: s.description,
            },
          },
        })),
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class RegistrationsViewer {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  registrationState0!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeyRegistrations']
  >
  get hotkeys() {
    return this.registrationState0.hotkeys
  }

  init() {
    this.registrationState0 = this.hotkeysScope.createHotkeyRegistrations()
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class ShortcutListItem {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  heldKeysState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHeldKeys']
  >
  get heldKeys() {
    return this.heldKeysState.value
  }
  constructor(public props: () => ShortcutListItemProps) {}
  init() {
    this.heldKeysState = this.hotkeysScope.createHeldKeys()
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.data('registrationsViewer', () => new RegistrationsViewer())
Alpine.data(
  'shortcutListItem',
  (props: () => ShortcutListItemProps) => new ShortcutListItem(props),
)
Alpine.start()
