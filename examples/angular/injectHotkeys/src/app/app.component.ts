import { Component, signal } from '@angular/core'
import { formatForDisplay, injectHotkeys } from '@tanstack/angular-hotkeys'
import type { Hotkey, InjectHotkeyDefinition } from '@tanstack/angular-hotkeys'

interface DynamicShortcut {
  id: number
  hotkey: string
  label: string
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
    { id: this.nextId++, hotkey: 'Shift+A', label: 'Action A', count: 0 },
    { id: this.nextId++, hotkey: 'Shift+B', label: 'Action B', count: 0 },
    { id: this.nextId++, hotkey: 'Shift+C', label: 'Action C', count: 0 },
  ])
  newHotkey = signal('')
  newLabel = signal('')

  constructor() {
    // Basic multi-hotkey
    injectHotkeys([
      {
        hotkey: 'Shift+S',
        callback: (_e, { hotkey }) => {
          this.saveCount.update((c) => c + 1)
          this.log.update((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
        },
      },
      {
        hotkey: 'Shift+U',
        callback: (_e, { hotkey }) => {
          this.undoCount.update((c) => c + 1)
          this.log.update((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
        },
      },
      {
        hotkey: 'Shift+R',
        callback: (_e, { hotkey }) => {
          this.redoCount.update((c) => c + 1)
          this.log.update((l) => [`${hotkey} pressed`, ...l].slice(0, 20))
        },
      },
    ])

    // Common options with per-hotkey overrides
    injectHotkeys(
      [
        {
          hotkey: 'Alt+J',
          callback: () => this.counts.update((c) => ({ ...c, a: c.a + 1 })),
        },
        {
          hotkey: 'Alt+K',
          callback: () => this.counts.update((c) => ({ ...c, b: c.b + 1 })),
        },
        {
          hotkey: 'Alt+L',
          callback: () => this.counts.update((c) => ({ ...c, c: c.c + 1 })),
          options: { enabled: true },
        },
      ],
      () => ({ enabled: this.commonEnabled() }),
    )

    // Dynamic hotkeys
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
        count: 0,
      },
    ])
    this.newHotkey.set('')
    this.newLabel.set('')
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

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.addShortcut()
  }
}
