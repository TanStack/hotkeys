import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import './index.css'
import type { Hotkey, HotkeyDefinition } from '@tanstack/alpine-hotkeys'

interface DynamicShortcut {
  id: number
  hotkey: string
  label: string
  description: string
  count: number
}

let nextId = 0

const DEFAULT_SHORTCUTS: Array<DynamicShortcut> = [
  {
    id: nextId++,
    hotkey: 'Shift+A',
    label: 'Action A',
    description: 'First dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+B',
    label: 'Action B',
    description: 'Second dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+C',
    label: 'Action C',
    description: 'Third dynamic action',
    count: 0,
  },
]

class App {}

class BasicMultiHotkeys {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  usage0 =
    "scope.createHotkeys([\n  { hotkey: 'Shift+S', callback: save,\n    options: { meta: { name: 'Save', description: 'Save the document' } } },\n  { hotkey: 'Shift+U', callback: undo,\n    options: { meta: { name: 'Undo' } } },\n])"
  log: Array<string> = []
  saveCount = 0
  undoCount = 0
  redoCount = 0

  init() {
    this.hotkeysScope.createHotkeys(() => [
      {
        hotkey: 'Shift+S',
        callback: (_e, { hotkey }) => {
          this.saveCount = this.saveCount + 1
          this.log = [`${hotkey} pressed`, ...this.log].slice(0, 20)
        },
        options: {
          meta: { name: 'Save', description: 'Save the current document' },
        },
      },
      {
        hotkey: 'Shift+U',
        callback: (_e, { hotkey }) => {
          this.undoCount = this.undoCount + 1
          this.log = [`${hotkey} pressed`, ...this.log].slice(0, 20)
        },
        options: {
          meta: { name: 'Undo', description: 'Undo the last action' },
        },
      },
      {
        hotkey: 'Shift+R',
        callback: (_e, { hotkey }) => {
          this.redoCount = this.redoCount + 1
          this.log = [`${hotkey} pressed`, ...this.log].slice(0, 20)
        },
        options: {
          meta: { name: 'Redo', description: 'Redo the last undone action' },
        },
      },
    ])
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class CommonOptionsDemo {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  usage0 =
    "scope.createHotkeys(\n  [\n    { hotkey: 'Alt+J', callback: actionA },\n    { hotkey: 'Alt+L', callback: actionC, options: { enabled: true } },\n  ],\n  () => ({ enabled: this.enabled }),\n)"
  enabled = true
  counts: { a: number; b: number; c: number } = { a: 0, b: 0, c: 0 }

  init() {
    this.hotkeysScope.createHotkeys(
      () => [
        {
          hotkey: 'Alt+J',
          callback: () =>
            (this.counts = { ...this.counts, a: this.counts.a + 1 }),
          options: {
            meta: {
              name: 'Action A',
              description: 'First action (respects toggle)',
            },
          },
        },
        {
          hotkey: 'Alt+K',
          callback: () =>
            (this.counts = { ...this.counts, b: this.counts.b + 1 }),
          options: {
            meta: {
              name: 'Action B',
              description: 'Second action (respects toggle)',
            },
          },
        },
        {
          hotkey: 'Alt+L',
          callback: () =>
            (this.counts = { ...this.counts, c: this.counts.c + 1 }),
          options: {
            enabled: true,
            meta: {
              name: 'Action C',
              description: 'Always-on action (overrides toggle)',
            },
          },
        },
      ],
      () => ({ enabled: this.enabled }),
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class DynamicHotkeysDemo {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  usage0 =
    'scope.createHotkeys(() => this.shortcuts.map((shortcut) => ({\n  hotkey: shortcut.hotkey,\n  callback: () => this.runShortcut(shortcut.id),\n  options: { meta: { name: shortcut.label, description: shortcut.description } },\n})))'
  shortcuts: Array<DynamicShortcut> = DEFAULT_SHORTCUTS
  newHotkey = ''
  newLabel = ''
  newDescription = ''
  get definitions(): Array<HotkeyDefinition> {
    return this.shortcuts.map((s) => ({
      hotkey: s.hotkey as Hotkey,
      callback: () => {
        this.shortcuts = this.shortcuts.map((item) =>
          item.id === s.id ? { ...item, count: item.count + 1 } : item,
        )
      },
      options: {
        meta: { name: s.label, description: s.description },
      },
    }))
  }
  addShortcut() {
    const trimmed = this.newHotkey.trim()
    if (!trimmed || !this.newLabel.trim()) return
    this.shortcuts = [
      ...this.shortcuts,
      {
        id: nextId++,
        hotkey: trimmed,
        label: this.newLabel.trim(),
        description: this.newDescription.trim(),
        count: 0,
      },
    ]
    this.newHotkey = ''
    this.newLabel = ''
    this.newDescription = ''
  }
  removeShortcut(id: number) {
    this.shortcuts = this.shortcuts.filter((s) => s.id !== id)
  }

  init() {
    this.addShortcut = this.addShortcut.bind(this)
    this.removeShortcut = this.removeShortcut.bind(this)
    this.hotkeysScope.createHotkeys(() => this.definitions)
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class RegistrationsViewer {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  usage0 =
    'const registrations = scope.createHotkeyRegistrations()\n\n// Alpine reads registrations.hotkeys and registrations.sequences reactively.\n// <template x-for="reg in registrations.hotkeys" :key="reg.id">\n//   <p x-text="reg.options.meta?.name + \': \' + reg.triggerCount"></p>\n// </template>'
  registrationState0!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeyRegistrations']
  >
  get hotkeys() {
    return this.registrationState0.hotkeys
  }
  get sequences() {
    return this.registrationState0.sequences
  }

  init() {
    this.registrationState0 = this.hotkeysScope.createHotkeyRegistrations()
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.data('basicMultiHotkeys', () => new BasicMultiHotkeys())
Alpine.data('commonOptionsDemo', () => new CommonOptionsDemo())
Alpine.data('dynamicHotkeysDemo', () => new DynamicHotkeysDemo())
Alpine.data('registrationsViewer', () => new RegistrationsViewer())
Alpine.start()
