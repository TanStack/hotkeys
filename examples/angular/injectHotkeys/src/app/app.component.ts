import { Component, signal } from '@angular/core'
import {
  formatForDisplay,
  injectHotkeyRegistrations,
  injectHotkeys,
} from '@tanstack/angular-hotkeys'
import type { Hotkey, InjectHotkeyDefinition } from '@tanstack/angular-hotkeys'

interface DynamicShortcut {
  id: number
  hotkey: string
  label: string
  description: string
  count: number
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  fd = (h: string) => formatForDisplay(h as Hotkey)

  // Basic demo
  log = signal<string[]>([])
  saveCount = signal(0)
  undoCount = signal(0)
  redoCount = signal(0)

  // Common options demo
  commonEnabled = signal(true)
  counts = signal({ a: 0, b: 0, c: 0 })

  // Dynamic demo
  nextId = 0
  shortcuts = signal<DynamicShortcut[]>([
    {
      id: this.nextId++,
      hotkey: 'Shift+A',
      label: 'Action A',
      description: 'First dynamic action',
      count: 0,
    },
    {
      id: this.nextId++,
      hotkey: 'Shift+B',
      label: 'Action B',
      description: 'Second dynamic action',
      count: 0,
    },
    {
      id: this.nextId++,
      hotkey: 'Shift+C',
      label: 'Action C',
      description: 'Third dynamic action',
      count: 0,
    },
  ])
  newHotkey = signal('')
  newLabel = signal('')
  newDescription = signal('')

  // Registrations viewer
  readonly registrations = injectHotkeyRegistrations()

  constructor() {
    // Basic multi-hotkey with meta
    injectHotkeys([
      {
        hotkey: 'Shift+S',
        callback: (_e, { hotkey }) => {
          this.saveCount.update((c) => c + 1)
          this.log.update((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
        },
        options: {
          meta: { name: 'Save', description: 'Save the current document' },
        },
      },
      {
        hotkey: 'Shift+U',
        callback: (_e, { hotkey }) => {
          this.undoCount.update((c) => c + 1)
          this.log.update((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
        },
        options: {
          meta: { name: 'Undo', description: 'Undo the last action' },
        },
      },
      {
        hotkey: 'Shift+R',
        callback: (_e, { hotkey }) => {
          this.redoCount.update((c) => c + 1)
          this.log.update((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
        },
        options: {
          meta: { name: 'Redo', description: 'Redo the last undone action' },
        },
      },
    ])

    // Common options with per-hotkey overrides and meta
    injectHotkeys(
      [
        {
          hotkey: 'Alt+J',
          callback: () => this.counts.update((c) => ({ ...c, a: c.a + 1 })),
          options: {
            meta: {
              name: 'Action A',
              description: 'First action (respects toggle)',
            },
          },
        },
        {
          hotkey: 'Alt+K',
          callback: () => this.counts.update((c) => ({ ...c, b: c.b + 1 })),
          options: {
            meta: {
              name: 'Action B',
              description: 'Second action (respects toggle)',
            },
          },
        },
        {
          hotkey: 'Alt+L',
          callback: () => this.counts.update((c) => ({ ...c, c: c.c + 1 })),
          options: {
            enabled: true,
            meta: {
              name: 'Action C',
              description: 'Always-on action (overrides toggle)',
            },
          },
        },
      ],
      () => ({ enabled: this.commonEnabled() }),
    )

    // Dynamic hotkeys with meta
    injectHotkeys(() =>
      this.shortcuts().map(
        (s): InjectHotkeyDefinition => ({
          hotkey: s.hotkey as Hotkey,
          callback: () => {
            this.shortcuts.update((prev) =>
              prev.map((item) =>
                item.id === s.id ? { ...item, count: item.count + 1 } : item,
              ),
            )
          },
          options: {
            meta: { name: s.label, description: s.description },
          },
        }),
      ),
    )
  }

  toggleCommon() {
    this.commonEnabled.update((e) => !e)
  }

  addShortcut() {
    const trimmed = this.newHotkey().trim()
    if (!trimmed || !this.newLabel().trim()) return
    this.shortcuts.update((prev) => [
      ...prev,
      {
        id: this.nextId++,
        hotkey: trimmed,
        label: this.newLabel().trim(),
        description: this.newDescription().trim(),
        count: 0,
      },
    ])
    this.newHotkey.set('')
    this.newLabel.set('')
    this.newDescription.set('')
  }

  removeShortcut(id: number) {
    this.shortcuts.update((prev) => prev.filter((s) => s.id !== id))
  }

  onNewHotkeyInput(event: Event) {
    this.newHotkey.set((event.target as HTMLInputElement).value)
  }

  onNewLabelInput(event: Event) {
    this.newLabel.set((event.target as HTMLInputElement).value)
  }

  onNewDescriptionInput(event: Event) {
    this.newDescription.set((event.target as HTMLInputElement).value)
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.addShortcut()
  }

  formatSeq(seq: Array<string>): string {
    return seq.map((h) => formatForDisplay(h as Hotkey)).join(' ')
  }
}
