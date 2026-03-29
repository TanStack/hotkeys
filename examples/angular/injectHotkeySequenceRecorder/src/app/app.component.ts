import { Component, signal } from '@angular/core'
import {
  formatForDisplay,
  injectHeldKeys,
  injectHotkeyRegistrations,
  injectHotkeySequenceRecorder,
  injectHotkeySequences,
} from '@tanstack/angular-hotkeys'
import type {
  HotkeySequence,
  InjectHotkeySequenceDefinition,
} from '@tanstack/angular-hotkeys'

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

  private readonly recorder = injectHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      const id = this.editingId()
      if (id) {
        this.shortcuts.update((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  sequence,
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
          if (shortcut && shortcut.sequence.length === 0) {
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
                  sequence: [],
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
  readonly recorderSteps = this.recorder.steps

  readonly registrations = injectHotkeyRegistrations()

  constructor() {
    // Register all sequences dynamically with meta
    injectHotkeySequences(() =>
      this.shortcuts()
        .filter((s) => s.sequence.length > 0)
        .map(
          (s): InjectHotkeySequenceDefinition => ({
            sequence: s.sequence,
            callback: () => {
              console.log(`${s.name} triggered:`, s.sequence)
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
      sequence: [],
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

  formatSeq(seq: HotkeySequence): string {
    return seq.map((h) => formatForDisplay(h)).join(' ')
  }

  recordingStepsLabel(): string {
    return this.recorder
      .steps()
      .map((h) => formatForDisplay(h))
      .join(' ')
  }
}
