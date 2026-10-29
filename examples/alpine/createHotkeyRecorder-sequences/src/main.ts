import Alpine from 'alpinejs'
import {
  createHotkeysScope,
  formatForDisplay,
  hotkeysPlugin,
} from '@tanstack/alpine-hotkeys'
import type {
  AlpineHotkeyRecorder,
  AlpineHotkeyState,
  Hotkey,
  HotkeyRegistrationsResult,
  HotkeySequence,
} from '@tanstack/alpine-hotkeys'
import './index.css'

// Gives every hotkeys scope the app's Alpine instance.
Alpine.plugin(hotkeysPlugin)

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

class App {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  usage0 =
    'const recorder = scope.createHotkeyRecorder({\n  maxSteps: 4,\n  onRecord: (value) => this.updateShortcut(value),\n  onCancel: () => this.cancelEditing(),\n  onClear: () => this.clearShortcut(),\n})\nscope.createHotkeys(() => this.definitions)\nconst registrations = scope.createHotkeyRegistrations()\nrecorder.startRecording()'
  shortcuts: Array<Shortcut> = INITIAL_SHORTCUTS
  editingId: string | null = null
  draftName = ''
  draftDescription = ''
  recorder!: AlpineHotkeyRecorder
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
      hotkey: null,
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
    this.recorder = this.hotkeysScope.createHotkeyRecorder({
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
    })
    // Register every assigned shortcut, chords and sequences alike, with meta
    this.hotkeysScope.createHotkeys(() =>
      this.shortcuts.flatMap((s) =>
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
      ),
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class RegistrationsViewer {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  registrationState0!: HotkeyRegistrationsResult
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
  heldKeys!: AlpineHotkeyState<Array<string>>
  constructor(public props: () => ShortcutListItemProps) {}
  init() {
    this.heldKeys = this.hotkeysScope.createHeldKeys()
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
