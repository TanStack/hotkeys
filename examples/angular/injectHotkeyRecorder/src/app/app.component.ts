import { Component, signal } from '@angular/core'
import {
  formatForDisplay,
  injectHeldKeys,
  injectHotkeyRecorder,
  injectHotkeyRegistrations,
  injectHotkeys,
} from '@tanstack/angular-hotkeys'
import type { Hotkey, InjectHotkeyDefinition } from '@tanstack/angular-hotkeys'

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
    hotkey: 'Mod+K',
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

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  shortcuts = signal<Array<Shortcut>>(INITIAL_SHORTCUTS)
  editingId = signal<string | null>(null)
  draftName = signal('')
  draftDescription = signal('')

  formatForDisplay = formatForDisplay
  heldKeys = injectHeldKeys()

  private readonly recorder = injectHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      const id = this.editingId()
      if (id) {
        this.shortcuts.update((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  hotkey,
                  name: this.draftName(),
                  description: this.draftDescription(),
                }
              : s,
          ),
        )
        this.editingId.set(null)
      }
    },
    onCancel: () => {
      const id = this.editingId()
      if (id) {
        this.shortcuts.update((prev) => {
          const shortcut = prev.find((s) => s.id === id)
          if (shortcut && shortcut.hotkey === '') {
            return prev.filter((s) => s.id !== id)
          }
          return prev
        })
      }
      this.editingId.set(null)
    },
    onClear: () => {
      const id = this.editingId()
      if (id) {
        this.shortcuts.update((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  hotkey: '' as Hotkey | '',
                  name: this.draftName(),
                  description: this.draftDescription(),
                }
              : s,
          ),
        )
        this.editingId.set(null)
      }
    },
  })

  readonly isRecording = this.recorder.isRecording

  readonly registrations = injectHotkeyRegistrations()

  constructor() {
    // Register all shortcuts dynamically with meta
    injectHotkeys(() =>
      this.shortcuts()
        .filter((s) => s.hotkey !== '')
        .map(
          (s): InjectHotkeyDefinition => ({
            hotkey: s.hotkey as Hotkey,
            callback: () => {
              console.log(`${s.name} triggered:`, s.hotkey)
            },
            options: {
              enabled: !this.recorder.isRecording(),
              meta: {
                name: s.name,
                description: s.description,
              },
            },
          }),
        ),
    )
  }

  handleEdit(id: string): void {
    const shortcut = this.shortcuts().find((s) => s.id === id)
    if (!shortcut) return
    this.editingId.set(id)
    this.draftName.set(shortcut.name)
    this.draftDescription.set(shortcut.description)
    this.recorder.startRecording()
  }

  handleSaveEditing(): void {
    const id = this.editingId()
    if (id) {
      this.shortcuts.update((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: this.draftName(),
                description: this.draftDescription(),
              }
            : s,
        ),
      )
      this.recorder.stopRecording()
      this.editingId.set(null)
    }
  }

  handleCancel(): void {
    this.recorder.cancelRecording()
  }

  handleDelete(id: string): void {
    this.shortcuts.update((prev) => prev.filter((s) => s.id !== id))
  }

  handleCreateNew(): void {
    const newShortcut: Shortcut = {
      id: createId(),
      name: '',
      description: '',
      hotkey: '',
    }
    this.shortcuts.update((prev) => [...prev, newShortcut])
    this.editingId.set(newShortcut.id)
    this.draftName.set('')
    this.draftDescription.set('')
    this.recorder.startRecording()
  }

  onDraftNameInput(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value)
  }

  onDraftDescriptionInput(event: Event): void {
    this.draftDescription.set((event.target as HTMLInputElement).value)
  }
}
