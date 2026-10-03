import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import './index.css'
import type {
  Hotkey,
  HotkeySequence,
  RecorderKeyMode,
  RegisterableHotkey,
} from '@tanstack/alpine-hotkeys'

const pages = [
  { to: '/', label: 'Tickets', shortcut: 'Alt+[Digit1]' },
  { to: '/editor', label: 'Editor', shortcut: 'Alt+[Digit2]' },
  { to: '/sequences', label: 'Sequences', shortcut: 'Alt+[Digit3]' },
  { to: '/recording', label: 'Recording', shortcut: 'Alt+[Digit4]' },
  { to: '/formatting', label: 'Formatting', shortcut: 'Alt+[Digit5]' },
] as const

class Hint {
  private hotkeysScope = createHotkeysScope({ hotkey: { requireReset: true } })

  formatForDisplay = formatForDisplay
  visibleState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeyHint']
  >
  get visible() {
    return this.visibleState.value
  }
  constructor(
    public props: () => {
      hotkey: RegisterableHotkey
      enabled?: boolean
    },
  ) {}
  init() {
    this.visibleState = this.hotkeysScope.createHotkeyHint(
      () => this.props().hotkey,
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class Layout {
  private hotkeysScope = createHotkeysScope({ hotkey: { requireReset: true } })
  private cleanups: Array<() => void> = []
  formatForDisplay = formatForDisplay
  pages = pages
  currentPath: string = window.location.pathname
  showShortcuts = false
  activity: Array<string> = []
  keysState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHeldKeys']
  >
  codesState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHeldKeyCodes']
  >
  shiftState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createKeyHold']
  >
  registrationState0!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeyRegistrations']
  >
  navigate({ to }: { to: string }) {
    window.history.pushState({}, '', to)
    this.currentPath = to
  }
  log(message: string) {
    this.activity = [message, ...this.activity].slice(0, 6)
  }
  get keys() {
    return this.keysState.value
  }
  get codes() {
    return this.codesState.value
  }
  get shift() {
    return this.shiftState.value
  }
  get hotkeys() {
    return this.registrationState0.hotkeys
  }
  get sequences() {
    return this.registrationState0.sequences
  }
  get registrations() {
    return [...this.hotkeys, ...this.sequences]
  }
  get groups() {
    return [
      ...new Set(
        this.registrations.map((reg) => reg.options.meta?.group ?? 'Other'),
      ),
    ]
  }

  init() {
    this.navigate = this.navigate.bind(this)
    this.log = this.log.bind(this)
    this.keysState = this.hotkeysScope.createHeldKeys()
    this.codesState = this.hotkeysScope.createHeldKeyCodes()
    this.shiftState = this.hotkeysScope.createKeyHold(() => 'Shift')
    this.registrationState0 = this.hotkeysScope.createHotkeyRegistrations()
    this.hotkeysScope.createHotkeys(
      () =>
        pages.map((page) => ({
          hotkey: page.shortcut,
          callback: () => {
            void this.navigate({ to: page.to })
          },
          options: {
            meta: { name: `Open ${page.label}`, group: 'Navigation' },
          },
        })),
      () => ({ ignoreInputs: true }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+Shift+[KeyK]',
      () => (this.showShortcuts = !this.showShortcuts),
      () => ({
        ...{
          meta: { name: 'Show shortcuts', group: 'Navigation' },
        },
      }),
    )
    const onPopState = () => {
      this.currentPath = window.location.pathname
    }
    window.addEventListener('popstate', onPopState)
    this.cleanups.push(() => window.removeEventListener('popstate', onPopState))
  }
  destroy() {
    for (const cleanup of this.cleanups) cleanup()
    this.hotkeysScope.destroy()
  }
}

class Tickets {
  private hotkeysScope = createHotkeysScope({ hotkey: { requireReset: true } })

  count = 0
  enabled = true
  create() {
    this.count = this.count + 1
    this.props().log('Ticket created')
  }
  save() {
    return this.props().log('Pending ticket saved')
  }
  constructor(public props: () => { log: (message: string) => void }) {}
  init() {
    this.create = this.create.bind(this)
    this.save = this.save.bind(this)
    this.hotkeysScope.createHotkey(
      () => 'Alt+[KeyC]',
      this.create,
      () => ({
        ...{
          enabled: this.enabled,
          ignoreInputs: false,
          meta: {
            name: 'Create ticket',
            description: 'Also works while entering a ticket note',
            group: 'Tickets',
          },
        },
      }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+[KeyS]',
      this.save,
      () => ({
        ...{
          enabled: this.enabled,
          meta: { name: 'Save pending ticket', group: 'Tickets' },
        },
      }),
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class EditorPane {
  private hotkeysScope = createHotkeysScope({ hotkey: { requireReset: true } })

  formatForDisplay = formatForDisplay
  target = { current: null as HTMLFieldSetElement | null }
  text = 'One shortcut, two independent editors.'
  saves = 0

  constructor(
    public props: () => { name: string; log: (message: string) => void },
  ) {}
  init() {
    this.hotkeysScope.createHotkeys(
      () => [
        {
          hotkey: 'Mod+[KeyS]',
          callback: () => {
            this.saves = this.saves + 1
            this.props().log(`${this.props().name} saved`)
          },
          options: {
            meta: {
              name: `Save ${this.props().name}`,
              group: 'Editor',
              description: 'Scoped to this editor',
            },
          },
        },
        {
          hotkey: 'Alt+[Backspace]',
          callback: () => {
            this.text = ''
            this.props().log(`${this.props().name} cleared`)
          },
          options: {
            meta: { name: `Clear ${this.props().name}`, group: 'Editor' },
          },
        },
      ],
      () => ({
        ...{ target: this.target.current, ignoreInputs: false },
      }),
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class Editor {
  private hotkeysScope = createHotkeysScope({ hotkey: { requireReset: true } })

  formatForDisplay = formatForDisplay
  repeat = false
  count = 0
  bubble = false
  scope = { current: null as HTMLFieldSetElement | null }

  constructor(public props: () => { log: (message: string) => void }) {}
  init() {
    this.hotkeysScope.createHotkey(
      () => 'Alt+[ArrowRight]',
      () => (this.count = this.count + 1),
      () => ({
        requireReset: !this.repeat,
        meta: { name: 'Advance counter', group: 'Editor' },
      }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+[KeyB]',
      () => this.props().log('Scoped B handler'),
      () => ({
        ...{
          target: this.scope.current,
          stopPropagation: !this.bubble,
          preventDefault: !this.bubble,
          meta: { name: 'Scoped propagation demo', group: 'Editor' },
        },
      }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+[KeyB]',
      () => this.props().log('Document B handler received the bubbled event'),
      () => ({
        ...{ meta: { name: 'Document propagation demo', group: 'Editor' } },
      }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+[KeyU]',
      () => this.props().log('Key released: keyup handler'),
      () => ({
        ...{
          eventType: 'keyup',
          meta: { name: 'Run on release', group: 'Editor' },
        },
      }),
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class Sequences {
  private hotkeysScope = createHotkeysScope({ hotkey: { requireReset: true } })

  formatForDisplay = formatForDisplay
  timeout = 1000
  registrationState2!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeyRegistrations']
  >
  get sequences() {
    return this.registrationState2.sequences
  }
  constructor(public props: () => { log: (message: string) => void }) {}
  init() {
    this.hotkeysScope.createHotkeySequence(
      () => ['[KeyG]', '[KeyG]'],
      () => this.props().log('Sequence: go to top'),
      () => ({
        timeout: this.timeout,
        meta: { name: 'Go to top', group: 'Sequences' },
      }),
    )
    this.hotkeysScope.createHotkeySequences(
      () => [
        {
          sequence: ['[KeyG]', '[KeyI]'],
          callback: () => this.props().log('Sequence: inbox'),
          options: { meta: { name: 'Open inbox', group: 'Sequences' } },
        },
        {
          sequence: ['Shift+[KeyR]', 'Shift+[KeyT]'],
          callback: () => this.props().log('Sequence: shifted chord chain'),
          options: { meta: { name: 'Shifted chain', group: 'Sequences' } },
        },
      ],
      () => ({ timeout: this.timeout }),
    )
    this.registrationState2 = this.hotkeysScope.createHotkeyRegistrations()
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class Recording {
  private hotkeysScope = createHotkeysScope({ hotkey: { requireReset: true } })

  formatForDisplay = formatForDisplay
  hotkey: Hotkey = this.initial
  mode: RecorderKeyMode = 'code'
  problem = ''
  sequence: HotkeySequence = ['[KeyX]', '[KeyY]']
  sequenceProblem = ''
  idle = false
  commitOnEnter = true
  recorder!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeyRecorder']
  >
  sequenceRecorder!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHotkeySequenceRecorder']
  >
  get initial(): Hotkey {
    return 'Alt+[KeyR]'
  }
  constructor(public props: () => { log: (message: string) => void }) {}
  init() {
    this.hotkeysScope.createHotkey(
      () => this.hotkey,
      () => this.props().log('Your recorded shortcut fired'),
      () => ({
        ...{
          meta: { name: 'Recorded action', group: 'Recording' },
        },
      }),
    )
    this.hotkeysScope.createHotkeySequence(
      () => this.sequence,
      () => this.props().log('Your recorded sequence fired'),
      () => ({
        meta: { name: 'Recorded sequence', group: 'Recording' },
      }),
    )
    this.recorder = this.hotkeysScope.createHotkeyRecorder(() => ({
      recordBy: this.mode,
      ignoreInputs: false,
      detectConflicts: {
        exclude: (reg) => reg.options.meta?.name === 'Recorded action',
      },
      validate: (_, { parsedHotkey }) =>
        parsedHotkey.modifiers.length > 0 ||
        'Include a modifier for this action.',
      onReject: ({ message }) => (this.problem = message),
      onRecord: (value) => {
        this.hotkey = value
        this.problem = ''
        this.props().log(`Recorded ${value}`)
      },
      onClear: () => {
        this.hotkey = this.initial
        this.problem = ''
        this.props().log('Restored default shortcut')
      },
      onCancel: () =>
        (this.problem = 'Recording cancelled. Binding unchanged.'),
    }))
    this.sequenceRecorder = this.hotkeysScope.createHotkeySequenceRecorder(
      () => ({
        recordBy: this.mode,
        ignoreInputs: false,
        idleTimeoutMs: this.idle ? 1500 : undefined,
        commitKeys: this.commitOnEnter ? 'enter' : 'none',
        detectConflicts: {
          exclude: (reg) => reg.options.meta?.name === 'Recorded sequence',
        },
        validate: (steps) => steps.length >= 2 || 'Record at least two chords.',
        onRecord: (value) => {
          this.sequence = value
          this.sequenceProblem = ''
          this.props().log(`Recorded sequence ${value.join(' → ')}`)
        },
        onReject: (reason) => (this.sequenceProblem = reason.message),
        onClear: () => {
          this.sequence = ['[KeyX]', '[KeyY]']
          this.sequenceProblem = 'Restored default sequence.'
        },
        onCancel: () => (this.sequenceProblem = 'Recording cancelled.'),
      }),
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class Formatting {
  formatForDisplay = formatForDisplay
  platform: 'mac' | 'windows' | 'linux' = 'mac'
  modifierSymbols = false
  keySymbols = true
  get options() {
    return {
      platform: this.platform,
      useSymbols: { modifiers: this.modifierSymbols, keys: this.keySymbols },
    }
  }
}
Alpine.data(
  'hint',
  (
    props: () => {
      hotkey: RegisterableHotkey
      enabled?: boolean
    },
  ) => new Hint(props),
)
Alpine.data('layout', () => new Layout())
Alpine.data(
  'tickets',
  (props: () => { log: (message: string) => void }) => new Tickets(props),
)
Alpine.data(
  'editorPane',
  (props: () => { name: string; log: (message: string) => void }) =>
    new EditorPane(props),
)
Alpine.data(
  'editor',
  (props: () => { log: (message: string) => void }) => new Editor(props),
)
Alpine.data(
  'sequences',
  (props: () => { log: (message: string) => void }) => new Sequences(props),
)
Alpine.data(
  'recording',
  (props: () => { log: (message: string) => void }) => new Recording(props),
)
Alpine.data('formatting', () => new Formatting())
Alpine.start()
