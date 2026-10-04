import { hash, fn } from '@ember/helper'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { registerDestructor } from '@ember/destroyable'
import { on } from '@ember/modifier'
import {
  createHotkeysScope,
  formatForDisplay,
  useHotkeyHint,
  useHeldKeys,
  useHeldKeyCodes,
  useKeyHold,
  useHotkeyRegistrations,
} from '@tanstack/ember-hotkeys'
import type {
  Hotkey,
  HotkeySequence,
  HotkeyDefinition,
  HotkeySequenceDefinition,
  RegisterableHotkey,
  HotkeyRegistrationView,
  SequenceRegistrationView,
  RecorderKeyMode,
  HotkeyCallback,
} from '@tanstack/ember-hotkeys'
const {
  onHotkey,
  onHotkeys,
  useHotkey,
  useHotkeys,
  useHotkeySequence,
  useHotkeySequences,
  useHotkeyRecorder,
  useHotkeySequenceRecorder,
} = createHotkeysScope({ hotkey: { requireReset: true } })

const eq = (a: unknown, b: unknown) => a === b
const and = (a: unknown, b: unknown) => a && b
const or = <T, U>(a: T, b: U) => a || b
const not = (a: unknown) => !a
const pages = [
  { to: '/', label: 'Tickets', shortcut: 'Alt+[Digit1]' },
  { to: '/editor', label: 'Editor', shortcut: 'Alt+[Digit2]' },
  { to: '/sequences', label: 'Sequences', shortcut: 'Alt+[Digit3]' },
  { to: '/recording', label: 'Recording', shortcut: 'Alt+[Digit4]' },
  { to: '/formatting', label: 'Formatting', shortcut: 'Alt+[Digit5]' },
] as const

class Hint extends Component<{
  Args: {
    hotkey: RegisterableHotkey
    enabled?: boolean
  }
}> {
  visible = useHotkeyHint(this, () => this.args.hotkey)

  <template>
    {{#if
      (and
        this.visible.value
        (if (eq this.args.enabled undefined) true this.args.enabled)
      )
    }}<kbd>{{formatForDisplay this.args.hotkey}}</kbd>{{else}}{{/if}}
  </template>
}

class Layout extends Component {
  @tracked currentPath: string = window.location.pathname
  @tracked showShortcuts: boolean = false
  @tracked activity: Array<string> = []
  keys = useHeldKeys(this)
  codes = useHeldKeyCodes(this)
  shift = useKeyHold(this, 'Shift')
  registrationsState = useHotkeyRegistrations(this)
  navigateToPage = (page: (typeof pages)[number], e: Event) => {
    e.preventDefault()
    this.navigate({ to: page.to })
  }
  toggleShortcuts = () => (this.showShortcuts = !this.showShortcuts)
  formatRegistration = (
    reg: HotkeyRegistrationView | SequenceRegistrationView,
  ) =>
    ('hotkey' in reg ? [reg.hotkey] : reg.sequence)
      .map((step) => formatForDisplay(step))
      .join(' → ')
  triggerCountLabel = (
    reg: HotkeyRegistrationView | SequenceRegistrationView,
  ) => `${reg.triggerCount} fired`
  registrationsForGroup = (group: string) =>
    this.registrations.filter(
      (reg) => (reg.options.meta?.group ?? 'Other') === group,
    )
  get heldKeysText() {
    return this.keys.value.join(' + ')
  }
  get heldCodesText() {
    return Object.values(this.codes.value).join(' + ')
  }
  clearActivity = () => (this.activity = [])
  navigate = ({ to }: { to: string }) => {
    window.history.pushState({}, '', to)
    this.currentPath = to
  }
  log = (message: string) => {
    this.activity = [message, ...this.activity].slice(0, 6)
  }
  get hotkeys() {
    return this.registrationsState.hotkeys
  }
  get sequences() {
    return this.registrationsState.sequences
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
  get hotkeyDefinitions1(): Array<HotkeyDefinition> {
    return pages.map((page) => ({
      hotkey: page.shortcut,
      callback: () => {
        void this.navigate({ to: page.to })
      },
      options: { meta: { name: `Open ${page.label}`, group: 'Navigation' } },
    }))
  }
  onAltShiftKeyK: HotkeyCallback = () =>
    (this.showShortcuts = !this.showShortcuts)
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    const onPopState = () => {
      this.currentPath = window.location.pathname
    }
    window.addEventListener('popstate', onPopState)
    registerDestructor(this, () =>
      window.removeEventListener('popstate', onPopState),
    )
  }
  <template>
    {{useHotkeys this.hotkeyDefinitions1 ignoreInputs=true}}
    {{useHotkey
      'Alt+Shift+[KeyK]'
      this.onAltShiftKeyK
      meta=(hash name='Show shortcuts' group='Navigation')
    }}

    <header>
      <h1>TanStack Hotkeys kitchen sink</h1>
      <p>
        Hold Alt / Option to see shortcut hints. Change routes to see registrations
        mount and unmount.
      </p>
      <nav aria-label='Examples'>
        {{#each pages key='to' as |page|}}<a
            href={{page.to}}
            class={{if (eq this.currentPath page.to) 'active' ''}}
            {{on 'click' (fn this.navigateToPage page)}}
          >{{page.label}} <Hint @hotkey={{page.shortcut}} /></a>{{/each}}
      </nav>
      <button
        {{on 'click' this.toggleShortcuts}}
        aria-expanded={{this.showShortcuts}}
      >
        {{if this.showShortcuts 'Hide' 'Show'}}
        shortcuts
        <Hint @hotkey='Alt+Shift+[KeyK]' />
      </button>
    </header>
    {{#if this.showShortcuts}}<section aria-label='Registered shortcuts'>
        <h2>Registered shortcuts</h2>
        <p>
          Global and current-route registrations, including disabled handlers.
          Scoped shortcuts run inside their target.
        </p>
        {{#each this.groups as |group|}}<div>
            <h3>{{group}}</h3>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Binding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {{#each (this.registrationsForGroup group) key='id' as |reg|}}<tr>
                    <td>
                      {{or reg.options.meta.name reg.id}}
                      <br />
                      <small>{{reg.options.meta.description}}</small>
                    </td>
                    <td>
                      {{this.formatRegistration reg}}
                    </td>
                    <td>
                      {{if
                        (eq reg.options.enabled false)
                        'Disabled'
                        (this.triggerCountLabel reg)
                      }}
                    </td>
                  </tr>{{/each}}
              </tbody>
            </table>
          </div>{{/each}}
      </section>{{/if}}
    <main>
      {{#if (eq this.currentPath '/editor')}}<Editor @log={{this.log}} />{{else if
        (eq this.currentPath '/sequences')
      }}<Sequences @log={{this.log}} />{{else if
        (eq this.currentPath '/recording')
      }}<Recording @log={{this.log}} />{{else if
        (eq this.currentPath '/formatting')
      }}<Formatting />{{else}}<Tickets @log={{this.log}} />{{/if}}
    </main>
    <section>
      <h2>Key state</h2>
      <p>
        Keys:
        {{or this.heldKeysText 'None'}}
        <br />
        Codes:
        {{or this.heldCodesText 'None'}}
        <br />
        Shift:
        {{if this.shift.value 'held' 'released'}}
      </p>
      <h2>Activity</h2>
      <button {{on 'click' this.clearActivity}}>Clear log</button>
      <ul aria-live='polite'>
        {{#each this.activity as |message i|}}<li>{{message}}</li>{{/each}}
      </ul>
    </section>
  </template>
}

class Tickets extends Component<{ Args: { log: (message: string) => void } }> {
  @tracked count: number = 0
  @tracked enabled: boolean = true
  updateEnabled = (e: Event) =>
    (this.enabled = (e.currentTarget as HTMLInputElement).checked)
  create = () => {
    this.count = this.count + 1
    this.args.log('Ticket created')
  }
  save = () => this.args.log('Pending ticket saved')
  onAltKeyC: HotkeyCallback = () => this.create()
  onAltKeyS: HotkeyCallback = () => this.save()

  <template>
    {{useHotkey
      'Alt+[KeyC]'
      this.onAltKeyC
      enabled=this.enabled
      ignoreInputs=false
      meta=(hash
        name='Create ticket'
        description='Also works while entering a ticket note'
        group='Tickets'
      )
    }}
    {{useHotkey
      'Alt+[KeyS]'
      this.onAltKeyS
      enabled=this.enabled
      meta=(hash name='Save pending ticket' group='Tickets')
    }}
    <section>
      <h2>Tickets</h2>
      <p>
        Created:
        {{this.count}}. Hold Alt / Option for hints. Release and press again to
        create another ticket.
      </p>
      <label>
        <input
          type='checkbox'
          checked={{this.enabled}}
          {{on 'input' this.updateEnabled}}
        />
        Enable ticket actions
      </label>
      <p>
        <button disabled={{not this.enabled}} {{on 'click' this.create}}>
          Create ticket
          <Hint @hotkey='Alt+[KeyC]' @enabled={{this.enabled}} />
        </button>
        <button disabled={{not this.enabled}} {{on 'click' this.save}}>
          Save pending
          <Hint @hotkey='Alt+[KeyS]' @enabled={{this.enabled}} />
        </button>
      </p>
      <label>
        Ticket note
        <input placeholder='Try Alt + the physical C key while typing' />
      </label>
      <p>
        Create uses
        <code>ignoreInputs: false</code>; Save uses the default input filtering.
        This example supplies
        <code>requireReset: true</code>.
      </p>
    </section>
  </template>
}

class EditorPane extends Component<{
  Args: { name: string; log: (message: string) => void }
}> {
  @tracked text: string = 'One shortcut, two independent editors.'
  @tracked saves: number = 0
  updateText = (e: Event) =>
    (this.text = (e.currentTarget as HTMLInputElement).value)
  get hotkeyDefinitions(): Array<HotkeyDefinition> {
    return [
      {
        hotkey: 'Mod+[KeyS]',
        callback: () => {
          this.saves = this.saves + 1
          this.args.log(`${this.args.name} saved`)
        },
        options: {
          meta: {
            name: `Save ${this.args.name}`,
            group: 'Editor',
            description: 'Scoped to this editor',
          },
        },
      },
      {
        hotkey: 'Alt+[Backspace]',
        callback: () => {
          this.text = ''
          this.args.log(`${this.args.name} cleared`)
        },
        options: { meta: { name: `Clear ${this.args.name}`, group: 'Editor' } },
      },
    ]
  }

  <template>
    <fieldset {{onHotkeys this.hotkeyDefinitions ignoreInputs=false}}>
      <legend>
        {{this.args.name}}
        —
        {{this.saves}}
        saves
      </legend>
      <label>
        Editor content
        <textarea
          rows={{3}}
          value={{this.text}}
          {{on 'input' this.updateText}}
        ></textarea>
      </label>
      <p>
        <kbd>{{formatForDisplay 'Mod+[KeyS]'}}</kbd>
        Save;
        <kbd>{{formatForDisplay 'Alt+[Backspace]'}}</kbd>
        Clear
      </p>
    </fieldset>
  </template>
}

class Editor extends Component<{ Args: { log: (message: string) => void } }> {
  @tracked repeat: boolean = false
  @tracked count: number = 0
  @tracked bubble: boolean = false
  updateRepeat = (e: Event) =>
    (this.repeat = (e.currentTarget as HTMLInputElement).checked)
  updateBubbling = (e: Event) =>
    (this.bubble = (e.currentTarget as HTMLInputElement).checked)
  focusScope = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement
    button.closest('fieldset')?.focus()
  }
  onAltArrowRight: HotkeyCallback = () => (this.count = this.count + 1)
  onAltKeyBScope: HotkeyCallback = () => this.args.log('Scoped B handler')
  onAltKeyB: HotkeyCallback = () =>
    this.args.log('Document B handler received the bubbled event')
  onAltKeyU: HotkeyCallback = () => this.args.log('Key released: keyup handler')

  <template>
    {{useHotkey
      'Alt+[ArrowRight]'
      this.onAltArrowRight
      requireReset=(not this.repeat)
      meta=(hash name='Advance counter' group='Editor')
    }}
    {{useHotkey
      'Alt+[KeyB]'
      this.onAltKeyB
      meta=(hash name='Document propagation demo' group='Editor')
    }}
    {{useHotkey
      'Alt+[KeyU]'
      this.onAltKeyU
      eventType='keyup'
      meta=(hash name='Run on release' group='Editor')
    }}
    <section>
      <h2>Editor scopes</h2>
      <p>
        Save is registered in both editors. Focus a textarea to choose which handler
        receives it.
      </p>
      <EditorPane @name='Draft' @log={{this.args.log}} />
      <EditorPane @name='Notes' @log={{this.args.log}} />
      <h3>Repeat and keyup</h3>
      <label>
        <input
          type='checkbox'
          checked={{this.repeat}}
          {{on 'input' this.updateRepeat}}
        />
        Allow key repeat
      </label>
      <p>
        Hold
        <kbd>{{formatForDisplay 'Alt+[ArrowRight]'}}</kbd>
        to advance:
        {{this.count}}. Release
        <kbd>{{formatForDisplay 'Alt+[KeyU]'}}</kbd>
        to log a keyup event.
      </p>
      <fieldset
        {{onHotkey
          'Alt+[KeyB]'
          this.onAltKeyBScope
          preventDefault=(not this.bubble)
          stopPropagation=(not this.bubble)
          meta=(hash name='Scoped propagation demo' group='Editor')
        }}
        tabindex={{0}}
      >
        <legend>Propagation</legend>
        <label>
          <input
            type='checkbox'
            checked={{this.bubble}}
            {{on 'input' this.updateBubbling}}
          />
          Allow bubbling and browser defaults
        </label>
        <p>
          Focus this area and press
          <kbd>{{formatForDisplay 'Alt+[KeyB]'}}</kbd>. Activity shows whether the
          document handler also receives the event.
        </p>
        <button {{on 'click' this.focusScope}}>Focus this area</button>
      </fieldset>
    </section>
  </template>
}

class Sequences extends Component<{
  Args: { log: (message: string) => void }
}> {
  @tracked timeout: number = 1000
  registrationsState = useHotkeyRegistrations(this)
  updateTimeout = (e: Event) =>
    (this.timeout = Number((e.currentTarget as HTMLInputElement).value))
  formatSequence = (reg: SequenceRegistrationView) =>
    reg.sequence.map((step) => formatForDisplay(step)).join(' → ')
  get goToTopSequence(): HotkeySequence {
    return ['[KeyG]', '[KeyG]']
  }
  goToTop: HotkeyCallback = () => this.args.log('Sequence: go to top')
  get sequenceDefinitions1(): Array<HotkeySequenceDefinition> {
    return [
      {
        sequence: ['[KeyG]', '[KeyI]'],
        callback: () => this.args.log('Sequence: inbox'),
        options: { meta: { name: 'Open inbox', group: 'Sequences' } },
      },
      {
        sequence: ['Shift+[KeyR]', 'Shift+[KeyT]'],
        callback: () => this.args.log('Sequence: shifted chord chain'),
        options: { meta: { name: 'Shifted chain', group: 'Sequences' } },
      },
    ]
  }
  get sequences() {
    return this.registrationsState.sequences
  }

  <template>
    {{useHotkeySequence
      this.goToTopSequence
      this.goToTop
      timeout=this.timeout
      meta=(hash name='Go to top' group='Sequences')
    }}
    {{useHotkeySequences this.sequenceDefinitions1 timeout=this.timeout}}
    <section>
      <h2>Sequences</h2>
      <p>
        Try the physical G position twice, G then I, or hold Shift and press R then
        T.
      </p>
      <label>
        Time between steps:
        {{this.timeout}}
        ms
        <input
          type='range'
          min='300'
          max='2500'
          step='100'
          value={{this.timeout}}
          {{on 'input' this.updateTimeout}}
        />
      </label>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Sequence</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {{#each this.sequences key='id' as |reg|}}<tr>
              <td>{{reg.options.meta.name}}</td>
              <td>
                {{this.formatSequence reg}}
              </td>
              <td>
                {{reg.matchedStepCount}}/{{reg.sequence.length}}
                steps;
                {{reg.triggerCount}}
                fired
              </td>
            </tr>{{/each}}
        </tbody>
      </table>
      <p>
        Wrong keys and timeouts reset progress. Modifier-only presses and automatic
        repeats do not advance a sequence.
      </p>
    </section>
  </template>
}

class Recording extends Component<{
  Args: { log: (message: string) => void }
}> {
  @tracked hotkey: Hotkey = this.initial
  @tracked mode: RecorderKeyMode = 'code'
  @tracked problem: string = ''
  @tracked sequence: HotkeySequence = ['[KeyX]', '[KeyY]']
  @tracked sequenceProblem: string = ''
  @tracked idle: boolean = false
  @tracked commitOnEnter: boolean = true
  recorder = useHotkeyRecorder(this, () => ({
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
      this.args.log(`Recorded ${value}`)
    },
    onClear: () => {
      this.hotkey = this.initial
      this.problem = ''
      this.args.log('Restored default shortcut')
    },
    onCancel: () => (this.problem = 'Recording cancelled. Binding unchanged.'),
  }))
  sequenceRecorder = useHotkeySequenceRecorder(this, () => ({
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
      this.args.log(`Recorded sequence ${value.join(' → ')}`)
    },
    onReject: (reason) => (this.sequenceProblem = reason.message),
    onClear: () => {
      this.sequence = ['[KeyX]', '[KeyY]']
      this.sequenceProblem = 'Restored default sequence.'
    },
    onCancel: () => (this.sequenceProblem = 'Recording cancelled.'),
  }))
  updateMode = (e: Event) =>
    (this.mode = (e.currentTarget as HTMLInputElement).value as RecorderKeyMode)
  startRecording = () => {
    this.problem = ''
    this.recorder.startRecording()
  }
  resetShortcut = () => {
    this.recorder.stopRecording()
    this.hotkey = this.initial
    this.problem = ''
  }
  get sequenceText() {
    return (
      this.sequenceRecorder.isRecording
        ? this.sequenceRecorder.steps
        : this.sequence
    )
      .map((step) => formatForDisplay(step))
      .join(' → ')
  }
  updateIdle = (e: Event) =>
    (this.idle = (e.currentTarget as HTMLInputElement).checked)
  updateCommitOnEnter = (e: Event) =>
    (this.commitOnEnter = (e.currentTarget as HTMLInputElement).checked)
  startSequenceRecording = () => {
    this.sequenceProblem = ''
    this.sequenceRecorder.startRecording()
  }
  get initial(): Hotkey {
    return 'Alt+[KeyR]'
  }
  runShortcut: HotkeyCallback = () =>
    this.args.log('Your recorded shortcut fired')
  runSequence: HotkeyCallback = () =>
    this.args.log('Your recorded sequence fired')

  <template>
    {{useHotkey
      this.hotkey
      this.runShortcut
      meta=(hash name='Recorded action' group='Recording')
    }}
    {{useHotkeySequence
      this.sequence
      this.runSequence
      meta=(hash name='Recorded sequence' group='Recording')
    }}
    <section>
      <h2>Recording</h2>
      <p>
        Recorded bindings go directly into registrations. Changes live in this
        page's Ember state.
      </p>
      <label>
        Record by
        <select
          value={{this.mode}}
          disabled={{or
            this.recorder.isRecording
            this.sequenceRecorder.isRecording
          }}
          {{on 'input' this.updateMode}}
        >
          <option value='code'>Physical code (default)</option>
          <option value='key'>Logical character</option>
        </select>
      </label>
      <h3>Single shortcut</h3>
      <p>
        <kbd>{{formatForDisplay this.hotkey}}</kbd>
        — stored as
        <code>{{this.hotkey}}</code>
      </p>
      <button
        disabled={{or this.recorder.isRecording this.sequenceRecorder.isRecording}}
        {{on 'click' this.startRecording}}
      >
        {{if this.recorder.isRecording 'Listening…' 'Record shortcut'}}
      </button>
      <button {{on 'click' this.resetShortcut}}>
        Reset
      </button>
      {{#if this.recorder.isRecording}}<button
          {{on 'click' this.recorder.cancelRecording}}
        >Cancel</button>{{/if}}
      <p>
        Include a modifier. Try Alt + 1 for a navigation conflict. Escape cancels;
        Backspace restores the initial shortcut.
      </p>
      <p role='status'>{{this.problem}}</p>
      <h3>Sequence</h3>
      <p>
        {{or this.sequenceText 'Waiting for the first chord…'}}
      </p>
      <label>
        <input
          type='checkbox'
          checked={{this.idle}}
          {{on 'input' this.updateIdle}}
        />
        Commit after 1.5 seconds idle
      </label>
      <label>
        <input
          type='checkbox'
          checked={{this.commitOnEnter}}
          {{on 'input' this.updateCommitOnEnter}}
        />
        Enter commits the sequence
      </label>
      <p>
        <button
          disabled={{or
            this.recorder.isRecording
            this.sequenceRecorder.isRecording
          }}
          {{on 'click' this.startSequenceRecording}}
        >
          Record sequence
        </button>
        <button
          disabled={{or
            (not this.sequenceRecorder.isRecording)
            (not this.sequenceRecorder.steps.length)
          }}
          {{on 'click' this.sequenceRecorder.commitRecording}}
        >
          Commit
        </button>
        {{#if this.sequenceRecorder.isRecording}}<button
            {{on 'click' this.sequenceRecorder.cancelRecording}}
          >Cancel</button>{{/if}}
      </p>
      <p>
        Record at least two chords. Backspace removes a step; when empty it restores
        the initial sequence. Rejected steps remain editable.
      </p>
      <p role='status'>{{this.sequenceProblem}}</p>
    </section>
  </template>
}

class Formatting extends Component {
  @tracked platform: 'mac' | 'windows' | 'linux' = 'mac'
  @tracked modifierSymbols: boolean = false
  @tracked keySymbols: boolean = true
  updatePlatform = (e: Event) =>
    (this.platform = (e.currentTarget as HTMLInputElement)
      .value as typeof this.platform)
  updateModifierSymbols = (e: Event) =>
    (this.modifierSymbols = (e.currentTarget as HTMLInputElement).checked)
  updateKeySymbols = (e: Event) =>
    (this.keySymbols = (e.currentTarget as HTMLInputElement).checked)
  get partOptions() {
    return { ...this.options, parts: true }
  }
  get sampleHotkeys() {
    return [
      'Mod+Shift+ArrowUp',
      'Control++',
      'Alt+[KeyS]',
      'Mod+[NumpadAdd]',
    ] as const
  }
  get options() {
    return {
      platform: this.platform,
      useSymbols: { modifiers: this.modifierSymbols, keys: this.keySymbols },
    }
  }

  <template>
    <section>
      <h2>Formatting</h2>
      <label>
        Platform
        <select value={{this.platform}} {{on 'input' this.updatePlatform}}>
          <option value='mac'>macOS</option>
          <option value='windows'>Windows</option>
          <option value='linux'>Linux</option>
        </select>
      </label>
      <label>
        <input
          type='checkbox'
          checked={{this.modifierSymbols}}
          {{on 'input' this.updateModifierSymbols}}
        />
        Modifier symbols
      </label>
      <label>
        <input
          type='checkbox'
          checked={{this.keySymbols}}
          {{on 'input' this.updateKeySymbols}}
        />
        Key symbols
      </label>
      <table>
        <thead>
          <tr>
            <th>Stored binding</th>
            <th>String</th>
            <th>Parts</th>
          </tr>
        </thead>
        <tbody>
          {{#each this.sampleHotkeys as |hotkey|}}<tr>
              <td>
                <code>{{hotkey}}</code>
              </td>
              <td>{{formatForDisplay hotkey this.options}}</td>
              <td>
                {{#each (formatForDisplay hotkey this.partOptions) as |part i|}}<kbd
                  >{{part}}</kbd>{{/each}}
              </td>
            </tr>{{/each}}
        </tbody>
      </table>
      <p>
        Physical codes use readable fallback labels. Supply a resolved
        <code>layoutMap</code>
        or explicit
        <code>keyLabels</code>
        for layout-specific labels.
      </p>
    </section>
  </template>
}
export default Layout
