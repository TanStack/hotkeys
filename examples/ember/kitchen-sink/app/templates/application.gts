import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { trackedObject } from '@ember/reactive/collections'
import { registerDestructor } from '@ember/destroyable'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
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
  HotkeyOptions,
  SequenceOptions,
  HotkeyRegistrationView,
  SequenceRegistrationView,
  RecorderKeyMode,
  HotkeyCallback,
} from '@tanstack/ember-hotkeys'
import { modifier } from 'ember-modifier'
import { schedule } from '@ember/runloop'
const {
  useHotkey, useHotkeys, useHotkeySequence, useHotkeySequences,
  useHotkeyRecorder, useHotkeySequenceRecorder,
} = createHotkeysScope({ hotkey: { requireReset: true } })

const captureElement = modifier(
  (
    element: HTMLElement,
    [capture]: [(element: HTMLElement | null) => void],
  ) => {
    let active = true
    schedule('afterRender', () => {
      if (active) capture(element)
    })
    return () => {
      active = false
      capture(null)
    }
  },
)
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
  visibleState = useHotkeyHint(this, () => this.args.hotkey)
  get visible() {
    return this.visibleState.value
  }

  <template>
    {{#if
      (and
        this.visible (if (eq this.args.enabled undefined) true this.args.enabled)
      )
    }}<kbd>{{formatForDisplay this.args.hotkey}}</kbd>{{else}}{{/if}}
  </template>
}

class Layout extends Component {
  @tracked currentPath: string = window.location.pathname
  @tracked showShortcuts: boolean = false
  @tracked activity: Array<string> = []
  keysState = useHeldKeys(this)
  codesState = useHeldKeyCodes(this)
  shiftState = useKeyHold(this, () => 'Shift')
  registrationState0 = useHotkeyRegistrations(this)
  handleClick1 = (
    page:
      | {
          readonly to: '/'
          readonly label: 'Tickets'
          readonly shortcut: 'Alt+[Digit1]'
        }
      | {
          readonly to: '/editor'
          readonly label: 'Editor'
          readonly shortcut: 'Alt+[Digit2]'
        }
      | {
          readonly to: '/sequences'
          readonly label: 'Sequences'
          readonly shortcut: 'Alt+[Digit3]'
        }
      | {
          readonly to: '/recording'
          readonly label: 'Recording'
          readonly shortcut: 'Alt+[Digit4]'
        }
      | {
          readonly to: '/formatting'
          readonly label: 'Formatting'
          readonly shortcut: 'Alt+[Digit5]'
        },
    e: Event,
  ) => {
    e.preventDefault()
    this.navigate({ to: page.to })
  }
  handleClick2 = () => (this.showShortcuts = !this.showShortcuts)
  value3 = (reg: HotkeyRegistrationView | SequenceRegistrationView) =>
    ('hotkey' in reg ? [reg.hotkey] : reg.sequence)
      .map((step) => formatForDisplay(step))
      .join(' → ')
  value4 = (reg: HotkeyRegistrationView | SequenceRegistrationView) =>
    `${reg.triggerCount} fired`
  value5 = (group: string) =>
    this.registrations.filter(
      (reg) => (reg.options.meta?.group ?? 'Other') === group,
    )
  get value6() {
    return this.keys.join(' + ')
  }
  get value7() {
    return Object.values(this.codes).join(' + ')
  }
  handleClick8 = () => (this.activity = [])
  navigate = ({ to }: { to: string }) => {
    window.history.pushState({}, '', to)
    this.currentPath = to
  }
  log = (message: string) => {
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
  get hotkeyDefinitions1(): Array<HotkeyDefinition> {
    return pages.map((page) => ({
      hotkey: page.shortcut,
      callback: () => {
        void this.navigate({ to: page.to })
      },
      options: { meta: { name: `Open ${page.label}`, group: 'Navigation' } },
    }))
  }
  get options1(): HotkeyOptions {
    return { ignoreInputs: true }
  }
  onAltShiftKeyK: HotkeyCallback = () =>
    (this.showShortcuts = !this.showShortcuts)
  get optionsAltShiftKeyK(): HotkeyOptions {
    return {

      ...{
        meta: { name: 'Show shortcuts', group: 'Navigation' },
      },
    }
  }
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
    {{useHotkeys
      this.hotkeyDefinitions1

      ignoreInputs=this.options1.ignoreInputs
    }}
    {{useHotkey
      'Alt+Shift+[KeyK]'
      this.onAltShiftKeyK

      meta=this.optionsAltShiftKeyK.meta
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
            {{on 'click' (fn this.handleClick1 page)}}
          >{{page.label}} <Hint @hotkey={{page.shortcut}} /></a>{{/each}}
      </nav>
      <button {{on 'click' this.handleClick2}} aria-expanded={{this.showShortcuts}}>
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
                {{#each (this.value5 group) key='id' as |reg|}}<tr>
                    <td>
                      {{or reg.options.meta.name reg.id}}
                      <br />
                      <small>{{reg.options.meta.description}}</small>
                    </td>
                    <td>
                      {{this.value3 reg}}
                    </td>
                    <td>
                      {{if
                        (eq reg.options.enabled false)
                        'Disabled'
                        (this.value4 reg)
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
        {{or this.value6 'None'}}
        <br />
        Codes:
        {{or this.value7 'None'}}
        <br />
        Shift:
        {{if this.shift 'held' 'released'}}
      </p>
      <h2>Activity</h2>
      <button {{on 'click' this.handleClick8}}>Clear log</button>
      <ul aria-live='polite'>
        {{#each this.activity as |message i|}}<li>{{message}}</li>{{/each}}
      </ul>
    </section>
  </template>
}

class Tickets extends Component<{ Args: { log: (message: string) => void } }> {
  @tracked count: number = 0
  @tracked enabled: boolean = true
  handleInput1 = (e: Event) =>
    (this.enabled = (e.currentTarget as HTMLInputElement).checked)
  create = () => {
    this.count = this.count + 1
    this.args.log('Ticket created')
  }
  save = () => this.args.log('Pending ticket saved')
  onAltKeyC: HotkeyCallback = () => this.create()
  get optionsAltKeyC(): HotkeyOptions {
    return {

      ...{
        enabled: this.enabled,
        ignoreInputs: false,
        meta: {
          name: 'Create ticket',
          description: 'Also works while entering a ticket note',
          group: 'Tickets',
        },
      },
    }
  }
  onAltKeyS: HotkeyCallback = () => this.save()
  get optionsAltKeyS(): HotkeyOptions {
    return {

      ...{
        enabled: this.enabled,
        meta: { name: 'Save pending ticket', group: 'Tickets' },
      },
    }
  }

  <template>
    {{useHotkey
      'Alt+[KeyC]'
      this.onAltKeyC
      enabled=this.optionsAltKeyC.enabled

      ignoreInputs=this.optionsAltKeyC.ignoreInputs
      meta=this.optionsAltKeyC.meta
    }}
    {{useHotkey
      'Alt+[KeyS]'
      this.onAltKeyS
      enabled=this.optionsAltKeyS.enabled

      meta=this.optionsAltKeyS.meta
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
          {{on 'input' this.handleInput1}}
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
  target = trackedObject({ current: null as HTMLFieldSetElement | null })
  @tracked text: string = 'One shortcut, two independent editors.'
  @tracked saves: number = 0
  captureTarget = (element: HTMLElement | null) => {
    this.target.current = element as HTMLFieldSetElement | null
  }
  handleInput1 = (e: Event) =>
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
  get options0Target(): HotkeyOptions {
    return {

      ...{ target: this.target.current, ignoreInputs: false },
    }
  }

  <template>
    {{useHotkeys
      this.hotkeyDefinitions
      target=this.options0Target.target

      ignoreInputs=this.options0Target.ignoreInputs
    }}
    <fieldset {{captureElement this.captureTarget}}>
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
          {{on 'input' this.handleInput1}}
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
  scope = trackedObject({ current: null as HTMLFieldSetElement | null })
  handleInput1 = (e: Event) =>
    (this.repeat = (e.currentTarget as HTMLInputElement).checked)
  captureScope = (element: HTMLElement | null) => {
    this.scope.current = element as HTMLFieldSetElement | null
  }
  handleInput2 = (e: Event) =>
    (this.bubble = (e.currentTarget as HTMLInputElement).checked)
  handleClick3 = () => this.scope.current?.focus()
  onAltArrowRight: HotkeyCallback = () => (this.count = this.count + 1)
  get optionsAltArrowRight(): HotkeyOptions {
    return {
      requireReset: !this.repeat,
      meta: { name: 'Advance counter', group: 'Editor' },
    }
  }
  onAltKeyBScope: HotkeyCallback = () => this.args.log('Scoped B handler')
  get optionsAltKeyBScope(): HotkeyOptions {
    return {

      ...{
        target: this.scope.current,
        stopPropagation: !this.bubble,
        preventDefault: !this.bubble,
        meta: { name: 'Scoped propagation demo', group: 'Editor' },
      },
    }
  }
  onAltKeyB: HotkeyCallback = () =>
    this.args.log('Document B handler received the bubbled event')
  get optionsAltKeyB(): HotkeyOptions {
    return {

      ...{ meta: { name: 'Document propagation demo', group: 'Editor' } },
    }
  }
  onAltKeyU: HotkeyCallback = () => this.args.log('Key released: keyup handler')
  get optionsAltKeyU(): HotkeyOptions {
    return {

      ...{
        eventType: 'keyup',
        meta: { name: 'Run on release', group: 'Editor' },
      },
    }
  }

  <template>
    {{useHotkey
      'Alt+[ArrowRight]'
      this.onAltArrowRight
      requireReset=this.optionsAltArrowRight.requireReset
      meta=this.optionsAltArrowRight.meta
    }}
    {{useHotkey
      'Alt+[KeyB]'
      this.onAltKeyBScope
      target=this.optionsAltKeyBScope.target

      preventDefault=this.optionsAltKeyBScope.preventDefault
      stopPropagation=this.optionsAltKeyBScope.stopPropagation
      meta=this.optionsAltKeyBScope.meta
    }}
    {{useHotkey
      'Alt+[KeyB]'
      this.onAltKeyB

      meta=this.optionsAltKeyB.meta
    }}
    {{useHotkey
      'Alt+[KeyU]'
      this.onAltKeyU

      eventType=this.optionsAltKeyU.eventType
      meta=this.optionsAltKeyU.meta
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
          {{on 'input' this.handleInput1}}
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
      <fieldset {{captureElement this.captureScope}} tabindex={{0}}>
        <legend>Propagation</legend>
        <label>
          <input
            type='checkbox'
            checked={{this.bubble}}
            {{on 'input' this.handleInput2}}
          />
          Allow bubbling and browser defaults
        </label>
        <p>
          Focus this area and press
          <kbd>{{formatForDisplay 'Alt+[KeyB]'}}</kbd>. Activity shows whether the
          document handler also receives the event.
        </p>
        <button {{on 'click' this.handleClick3}}>Focus this area</button>
      </fieldset>
    </section>
  </template>
}

class Sequences extends Component<{
  Args: { log: (message: string) => void }
}> {
  @tracked timeout: number = 1000
  registrationState2 = useHotkeyRegistrations(this)
  handleInput1 = (e: Event) =>
    (this.timeout = Number((e.currentTarget as HTMLInputElement).value))
  value2 = (reg: SequenceRegistrationView) =>
    reg.sequence.map((step) => formatForDisplay(step)).join(' → ')
  get sequence0(): HotkeySequence {
    return ['[KeyG]', '[KeyG]']
  }
  on0: HotkeyCallback = () => this.args.log('Sequence: go to top')
  get options0(): SequenceOptions {
    return {
      timeout: this.timeout,
      meta: { name: 'Go to top', group: 'Sequences' },
    }
  }
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
  get options1(): SequenceOptions {
    return { timeout: this.timeout }
  }
  get sequences() {
    return this.registrationState2.sequences
  }

  <template>
    {{useHotkeySequence
      this.sequence0
      this.on0
      timeout=this.options0.timeout
      meta=this.options0.meta
    }}
    {{useHotkeySequences this.sequenceDefinitions1 timeout=this.options1.timeout}}
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
          {{on 'input' this.handleInput1}}
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
                {{this.value2 reg}}
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
  handleInput1 = (e: Event) =>
    (this.mode = (e.currentTarget as HTMLInputElement).value as RecorderKeyMode)
  handleClick2 = () => {
    this.problem = ''
    this.recorder.startRecording()
  }
  handleClick3 = () => {
    this.recorder.stopRecording()
    this.hotkey = this.initial
    this.problem = ''
  }
  get value4() {
    return (
      this.sequenceRecorder.isRecording
        ? this.sequenceRecorder.steps
        : this.sequence
    )
      .map((step) => formatForDisplay(step))
      .join(' → ')
  }
  handleInput5 = (e: Event) =>
    (this.idle = (e.currentTarget as HTMLInputElement).checked)
  handleInput6 = (e: Event) =>
    (this.commitOnEnter = (e.currentTarget as HTMLInputElement).checked)
  handleClick7 = () => {
    this.sequenceProblem = ''
    this.sequenceRecorder.startRecording()
  }
  get initial(): Hotkey {
    return 'Alt+[KeyR]'
  }
  get hotkey0(): RegisterableHotkey {
    return this.hotkey
  }
  on0: HotkeyCallback = () => this.args.log('Your recorded shortcut fired')
  get options0(): HotkeyOptions {
    return {

      ...{
        meta: { name: 'Recorded action', group: 'Recording' },
      },
    }
  }
  get sequence1(): HotkeySequence {
    return this.sequence
  }
  on1: HotkeyCallback = () => this.args.log('Your recorded sequence fired')
  get options1(): SequenceOptions {
    return {
      meta: { name: 'Recorded sequence', group: 'Recording' },
    }
  }

  <template>
    {{useHotkey
      this.hotkey0
      this.on0

      meta=this.options0.meta
    }}
    {{useHotkeySequence this.sequence1 this.on1 meta=this.options1.meta}}
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
          {{on 'input' this.handleInput1}}
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
        {{on 'click' this.handleClick2}}
      >
        {{if this.recorder.isRecording 'Listening…' 'Record shortcut'}}
      </button>
      <button {{on 'click' this.handleClick3}}>
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
        {{or this.value4 'Waiting for the first chord…'}}
      </p>
      <label>
        <input
          type='checkbox'
          checked={{this.idle}}
          {{on 'input' this.handleInput5}}
        />
        Commit after 1.5 seconds idle
      </label>
      <label>
        <input
          type='checkbox'
          checked={{this.commitOnEnter}}
          {{on 'input' this.handleInput6}}
        />
        Enter commits the sequence
      </label>
      <p>
        <button
          disabled={{or
            this.recorder.isRecording
            this.sequenceRecorder.isRecording
          }}
          {{on 'click' this.handleClick7}}
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
  handleInput1 = (e: Event) =>
    (this.platform = (e.currentTarget as HTMLInputElement)
      .value as typeof this.platform)
  handleInput2 = (e: Event) =>
    (this.modifierSymbols = (e.currentTarget as HTMLInputElement).checked)
  handleInput3 = (e: Event) =>
    (this.keySymbols = (e.currentTarget as HTMLInputElement).checked)
  get value4() {
    return { ...this.options, parts: true }
  }
  get value5() {
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
        <select value={{this.platform}} {{on 'input' this.handleInput1}}>
          <option value='mac'>macOS</option>
          <option value='windows'>Windows</option>
          <option value='linux'>Linux</option>
        </select>
      </label>
      <label>
        <input
          type='checkbox'
          checked={{this.modifierSymbols}}
          {{on 'input' this.handleInput2}}
        />
        Modifier symbols
      </label>
      <label>
        <input
          type='checkbox'
          checked={{this.keySymbols}}
          {{on 'input' this.handleInput3}}
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
          {{#each this.value5 as |hotkey|}}<tr>
              <td>
                <code>{{hotkey}}</code>
              </td>
              <td>{{formatForDisplay hotkey this.options}}</td>
              <td>
                {{#each (formatForDisplay hotkey this.value4) as |part i|}}<kbd
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
