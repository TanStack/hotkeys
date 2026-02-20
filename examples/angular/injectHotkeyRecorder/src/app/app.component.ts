import { Component, signal } from '@angular/core';
import {
  formatForDisplay,
  injectHotkey,
  injectHotkeyRecorder,
} from '@tanstack/angular-hotkeys';
import type { Hotkey } from '@tanstack/angular-hotkeys';
import { ShortcutListItemComponent } from './shortcut-list-item.component';

const DEFAULT_SHORTCUT_ACTIONS: Record<
  string,
  { name: string; defaultHotkey: Hotkey }
> = {
  save: { name: 'Save', defaultHotkey: 'Mod+K' },
  open: { name: 'Open', defaultHotkey: 'Mod+E' },
  new: { name: 'New', defaultHotkey: 'Mod+G' },
  close: { name: 'Close', defaultHotkey: 'Mod+Shift+K' },
  undo: { name: 'Undo', defaultHotkey: 'Mod+Shift+E' },
  redo: { name: 'Redo', defaultHotkey: 'Mod+Shift+G' },
};

const ACTION_ENTRIES = Object.entries(DEFAULT_SHORTCUT_ACTIONS);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShortcutListItemComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly recorder = injectHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      const id = this.recordingActionId();
      if (id) {
        this.shortcuts.update((prev) => ({
          ...prev,
          [id]: hotkey || ('' as Hotkey | ''),
        }));
        this.recordingActionId.set(null);
      }
    },
    onCancel: () => this.recordingActionId.set(null),
    onClear: () => {
      const id = this.recordingActionId();
      if (id) {
        this.shortcuts.update((prev) => ({ ...prev, [id]: '' as Hotkey | '' }));
        this.recordingActionId.set(null);
      }
    },
  });

  shortcuts = signal<Record<string, Hotkey | ''>>((() => {
    const defaults: Record<string, Hotkey | ''> = {};
    for (const [id, action] of Object.entries(DEFAULT_SHORTCUT_ACTIONS)) {
      defaults[id] = action.defaultHotkey;
    }
    return defaults;
  })());

  saveCount = signal(0);
  openCount = signal(0);
  newCount = signal(0);
  closeCount = signal(0);
  undoCount = signal(0);
  redoCount = signal(0);
  recordingActionId = signal<string | null>(null);

  readonly actionEntries = ACTION_ENTRIES;
  readonly defaultActions = DEFAULT_SHORTCUT_ACTIONS;
  formatForDisplay = formatForDisplay;

  constructor() {
    injectHotkey(
      () =>
        this.shortcuts()['save'] || DEFAULT_SHORTCUT_ACTIONS['save'].defaultHotkey,
      () => this.saveCount.update((c) => c + 1),
      () => ({
        enabled: !this.recorder.isRecording() && this.shortcuts()['save'] !== '',
      }),
    );
    injectHotkey(
      () =>
        this.shortcuts()['open'] || DEFAULT_SHORTCUT_ACTIONS['open'].defaultHotkey,
      () => this.openCount.update((c) => c + 1),
      () => ({
        enabled: !this.recorder.isRecording() && this.shortcuts()['open'] !== '',
      }),
    );
    injectHotkey(
      () =>
        this.shortcuts()['new'] || DEFAULT_SHORTCUT_ACTIONS['new'].defaultHotkey,
      () => this.newCount.update((c) => c + 1),
      () => ({
        enabled: !this.recorder.isRecording() && this.shortcuts()['new'] !== '',
      }),
    );
    injectHotkey(
      () =>
        this.shortcuts()['close'] || DEFAULT_SHORTCUT_ACTIONS['close'].defaultHotkey,
      () => this.closeCount.update((c) => c + 1),
      () => ({
        enabled: !this.recorder.isRecording() && this.shortcuts()['close'] !== '',
      }),
    );
    injectHotkey(
      () =>
        this.shortcuts()['undo'] || DEFAULT_SHORTCUT_ACTIONS['undo'].defaultHotkey,
      () => this.undoCount.update((c) => c + 1),
      () => ({
        enabled: !this.recorder.isRecording() && this.shortcuts()['undo'] !== '',
      }),
    );
    injectHotkey(
      () =>
        this.shortcuts()['redo'] || DEFAULT_SHORTCUT_ACTIONS['redo'].defaultHotkey,
      () => this.redoCount.update((c) => c + 1),
      () => ({
        enabled: !this.recorder.isRecording() && this.shortcuts()['redo'] !== '',
      }),
    );
  }

  /** Expose recorder's isRecording signal for template */
  readonly isRecording = this.recorder.isRecording;

  handleEdit(actionId: string): void {
    this.recordingActionId.set(actionId);
    this.recorder.startRecording();
  }

  handleCancel(): void {
    this.recorder.cancelRecording();
    this.recordingActionId.set(null);
  }

  shortcutDisplay(id: string): Hotkey {
    const hotkey = this.shortcuts()[id];
    return (hotkey || this.defaultActions[id].defaultHotkey) as Hotkey;
  }

  countFor(id: string): number {
    const counts: Record<string, () => number> = {
      save: () => this.saveCount(),
      open: () => this.openCount(),
      new: () => this.newCount(),
      close: () => this.closeCount(),
      undo: () => this.undoCount(),
      redo: () => this.redoCount(),
    };
    return counts[id]?.() ?? 0;
  }
}
