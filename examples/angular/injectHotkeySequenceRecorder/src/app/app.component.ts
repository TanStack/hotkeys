import { Component, signal } from '@angular/core'
import {
  formatForDisplay,
  injectHotkeySequence,
  injectHotkeySequenceRecorder,
} from '@tanstack/angular-hotkeys'
import type { HotkeySequence } from '@tanstack/angular-hotkeys'
import { ShortcutListItemComponent } from './shortcut-list-item.component'

const DEFAULT_SHORTCUT_ACTIONS: Record<
  string,
  { name: string; defaultSequence: HotkeySequence }
> = {
  save: { name: 'Save', defaultSequence: ['Mod+S'] },
  open: { name: 'Open (gg)', defaultSequence: ['G', 'G'] },
  new: { name: 'New (dd)', defaultSequence: ['D', 'D'] },
  close: { name: 'Close', defaultSequence: ['Mod+Shift+K'] },
  undo: { name: 'Undo (yy)', defaultSequence: ['Y', 'Y'] },
  redo: { name: 'Redo', defaultSequence: ['Mod+Shift+G'] },
}

const ACTION_ENTRIES = Object.entries(DEFAULT_SHORTCUT_ACTIONS)

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShortcutListItemComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly recorder = injectHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      const id = this.recordingActionId()
      if (id) {
        this.shortcuts.update((prev) => ({
          ...prev,
          [id]: sequence,
        }))
        this.recordingActionId.set(null)
      }
    },
    onCancel: () => this.recordingActionId.set(null),
    onClear: () => {
      const id = this.recordingActionId()
      if (id) {
        this.shortcuts.update((prev) => ({ ...prev, [id]: [] }))
        this.recordingActionId.set(null)
      }
    },
  })

  shortcuts = signal<Record<string, HotkeySequence | null>>(
    Object.fromEntries(
      Object.keys(DEFAULT_SHORTCUT_ACTIONS).map((id) => [id, null]),
    ) as Record<string, HotkeySequence | null>,
  )

  saveCount = signal(0)
  openCount = signal(0)
  newCount = signal(0)
  closeCount = signal(0)
  undoCount = signal(0)
  redoCount = signal(0)
  recordingActionId = signal<string | null>(null)

  readonly actionEntries = ACTION_ENTRIES
  readonly defaultActions = DEFAULT_SHORTCUT_ACTIONS
  formatForDisplay = formatForDisplay

  constructor() {
    injectHotkeySequence(
      () => this.resolveSeq('save'),
      () => this.saveCount.update((c) => c + 1),
      () => ({
        enabled:
          !this.recorder.isRecording() && this.resolveSeq('save').length > 0,
      }),
    )
    injectHotkeySequence(
      () => this.resolveSeq('open'),
      () => this.openCount.update((c) => c + 1),
      () => ({
        enabled:
          !this.recorder.isRecording() && this.resolveSeq('open').length > 0,
      }),
    )
    injectHotkeySequence(
      () => this.resolveSeq('new'),
      () => this.newCount.update((c) => c + 1),
      () => ({
        enabled:
          !this.recorder.isRecording() && this.resolveSeq('new').length > 0,
      }),
    )
    injectHotkeySequence(
      () => this.resolveSeq('close'),
      () => this.closeCount.update((c) => c + 1),
      () => ({
        enabled:
          !this.recorder.isRecording() && this.resolveSeq('close').length > 0,
      }),
    )
    injectHotkeySequence(
      () => this.resolveSeq('undo'),
      () => this.undoCount.update((c) => c + 1),
      () => ({
        enabled:
          !this.recorder.isRecording() && this.resolveSeq('undo').length > 0,
      }),
    )
    injectHotkeySequence(
      () => this.resolveSeq('redo'),
      () => this.redoCount.update((c) => c + 1),
      () => ({
        enabled:
          !this.recorder.isRecording() && this.resolveSeq('redo').length > 0,
      }),
    )
  }

  readonly isRecording = this.recorder.isRecording
  readonly recorderSteps = this.recorder.steps

  resolveSeq(id: string): HotkeySequence {
    const s = this.shortcuts()[id]
    if (s !== null) {
      return s
    }
    return this.defaultActions[id]!.defaultSequence
  }

  handleEdit(actionId: string): void {
    this.recordingActionId.set(actionId)
    this.recorder.startRecording()
  }

  handleCancel(): void {
    this.recorder.cancelRecording()
    this.recordingActionId.set(null)
  }

  sequenceStatLabel(id: string): string {
    const seq = this.resolveSeq(id)
    if (seq.length === 0) {
      return '—'
    }
    return seq.map((h) => this.formatForDisplay(h)).join(' ')
  }

  recordingStepsLabel(): string {
    return this.recorder
      .steps()
      .map((h) => this.formatForDisplay(h))
      .join(' ')
  }

  countFor(id: string): number {
    const counts: Record<string, () => number> = {
      save: () => this.saveCount(),
      open: () => this.openCount(),
      new: () => this.newCount(),
      close: () => this.closeCount(),
      undo: () => this.undoCount(),
      redo: () => this.redoCount(),
    }
    return counts[id]?.() ?? 0
  }
}
