import { module, test } from 'qunit'
import { render, settled, clearRender, click } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { array } from '@ember/helper'
import {
  createHotkeysScope, useHotkey, useHotkeys, onHotkey, onHotkeys,
  useHeldKeys, useHeldKeyCodes, useKeyHold, useHotkeyHint,
  useHotkeyRecorder, useHotkeyRegistrations, useHotkeyScopesState,
  HotkeyManager, KeyStateTracker, getHotkeyManager,
} from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition, Hotkey } from '@tanstack/ember-hotkeys'

let instance: Example
const records: Array<unknown> = []

class Example extends Component {
  @tracked binding: Hotkey = 'Control+S'
  @tracked enabled = true
  @tracked count = 0
  @tracked other = 0
  held = useHeldKeys(this)
  codes = useHeldKeyCodes(this)
  hold = useKeyHold(this, 'Control')
  hint = useHotkeyHint(this, () => this.binding)
  registrations = useHotkeyRegistrations(this)
  scopes = useHotkeyScopesState(this)
  recorder = useHotkeyRecorder(this, { recordBy: 'key', platform: 'mac', onRecord: (value) => records.push(value) })
  sequenceRecorder = useHotkeyRecorder(this, { maxSteps: Infinity, recordBy: 'key', platform: 'mac', onRecord: (value) => records.push(value) })
  save = () => { this.count++ }
  runOther = () => { this.other++ }
  changeBinding = () => { this.binding = 'Alt+S' }
  toggle = () => { this.enabled = !this.enabled }

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    instance = this
  }

  get definitions(): Array<EmberHotkeyDefinition> {
    return this.enabled ? [{ hotkey: 'B', callback: this.runOther }] : []
  }
  get sequences(): Array<EmberHotkeyDefinition> {
    return this.enabled ? [{ hotkey: ['D', 'D'], callback: this.runOther }] : []
  }
  get chordCount() { return this.registrations.hotkeys.filter((reg) => reg.kind === 'chord').length }
  get sequenceCount() { return this.registrations.hotkeys.filter((reg) => reg.kind === 'sequence').length }
  get heldText() { return this.held.value.join(',') }
  get codeText() { return JSON.stringify(this.codes.value) }
  get scopesText() { return `${this.scopes.value.exclusive ?? 'none'}:${this.scopes.value.suspended.join(',')}` }

  <template>
    {{useHotkey this.binding this.save enabled=this.enabled}}
    {{useHotkeys this.definitions}}
    {{useHotkey (array "G" "G") this.save}}
    {{useHotkeys this.sequences}}
    <button id="binding" type="button" {{on "click" this.changeBinding}}>Change binding</button>
    <button id="enabled" type="button" {{on "click" this.toggle}}>Toggle</button>
    <output id="count">{{this.count}}</output>
    <output id="other">{{this.other}}</output>
    <output id="held">{{this.heldText}}</output>
    <output id="codes">{{this.codeText}}</output>
    <output id="hint">{{if this.hint.value "yes" "no"}}</output>
    <output id="hold">{{if this.hold.value "yes" "no"}}</output>
    <output id="registrations">{{this.chordCount}}:{{this.sequenceCount}}</output>
    <output id="scopes">{{this.scopesText}}</output>
    <output id="recording">{{if this.recorder.isRecording "yes" "no"}}</output>
  </template>
}

async function key(key: string, type = 'keydown', options: KeyboardEventInit = {}) {
  document.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, ...options }))
  await settled()
}

module('Ember hotkeys', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
    records.length = 0
  })

  test('updates callbacks, bindings, and enabled options without replacing stable handles', async (assert) => {
    await render(<template><Example /></template>)
    const id = [...getHotkeyManager().registrations.state.values()].find((registration) => registration.kind === 'chord' && registration.parsedChord.ctrl)!.id
    await key('s', 'keydown', { ctrlKey: true })
    await key('s', 'keyup', { ctrlKey: true })
    await key('s', 'keydown', { ctrlKey: true })
    assert.dom('#count').hasText('2')
    await click('#enabled')
    assert.dom('#registrations').hasText('1:1')
    await key('s', 'keydown', { ctrlKey: true })
    assert.dom('#count').hasText('2')
    assert.true(getHotkeyManager().registrations.state.has(id))
    await click('#enabled')
    await click('#binding')
    await key('s', 'keydown', { altKey: true })
    assert.dom('#count').hasText('3')
  })

  test('tracks keys, codes, holds, and binding-only hint changes', async (assert) => {
    await render(<template><Example /></template>)
    await key('Control', 'keydown', { ctrlKey: true, code: 'ControlLeft' })
    assert.dom('#held').hasText('Control')
    assert.dom('#codes').includesText('ControlLeft')
    assert.dom('#hint').hasText('yes')
    assert.dom('#hold').hasText('yes')
    await click('#enabled')
    assert.dom('#hint').hasText('no')
    await click('#enabled')
    assert.dom('#hint').hasText('yes')
    await click('#binding')
    assert.dom('#hint').hasText('no')
    await key('Control', 'keyup')
    assert.dom('#held').hasText('')
  })

  test('renders the scopes state when an exclusive scope activates', async (assert) => {
    await render(<template><Example /></template>)
    assert.dom('#scopes').hasText('none:')
    const release = getHotkeyManager().activateScope('dialog', { exclusive: true })
    await settled()
    assert.dom('#scopes').hasText('dialog:global')
    release()
    await settled()
    assert.dom('#scopes').hasText('none:')
  })

  test('runs single and plural sequences', async (assert) => {
    await render(<template><Example /></template>)
    await key('g'); await key('g', 'keyup'); await key('g')
    await key('d'); await key('d', 'keyup'); await key('d')
    assert.dom('#count').hasText('1')
    assert.dom('#other').hasText('1')
  })

  test('records shortcuts and sequences and stops active recording on destruction', async (assert) => {
    await render(<template><Example /></template>)
    instance.recorder.startRecording()
    await settled()
    assert.dom('#recording').hasText('yes')
    await key('s', 'keydown', { ctrlKey: true })
    assert.deepEqual(records, ['Control+S'])
    assert.dom('#count').hasText('0')
    instance.sequenceRecorder.startRecording()
    await key('g'); await key('g', 'keyup')
    assert.deepEqual(instance.sequenceRecorder.steps, ['G'])
    instance.sequenceRecorder.commitRecording()
    assert.deepEqual(records, ['Control+S', 'G'])
    instance.recorder.startRecording()
    await clearRender()
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
    await key('k')
    assert.strictEqual(records.length, 2)
  })

  test('unmounts pending sequence progress and subscriptions', async (assert) => {
    await render(<template><Example /></template>)
    await key('g')
    await clearRender()
    await key('g')
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
  })
})

let scoped: ScopedExample
class ScopedExample extends Component {
  @tracked enabled = false
  @tracked recordBy: 'key' | 'code' = 'key'
  @tracked accept = false
  @tracked count = 0
  hotkeys = createHotkeysScope(() => ({
    hotkey: { enabled: this.enabled, timeout: 321 },
    hotkeyRecorder: { recordBy: this.recordBy },
  }))
  recorder = useHotkeyRecorder(this, () => ({
    onRecord: (value) => records.push(value), validate: () => this.accept,
  }), this.hotkeys)
  sequenceRecorder = useHotkeyRecorder(this, () => ({
    maxSteps: Infinity, onRecord: (value) => records.push(value), validate: () => this.accept,
  }), this.hotkeys)
  run = () => { this.count++ }
  get definitions(): Array<EmberHotkeyDefinition> { return [{ hotkey: 'B', callback: this.run, options: { enabled: true } }] }
  get sequences(): Array<EmberHotkeyDefinition> { return [{ hotkey: ['X', 'X'], callback: this.run, options: { enabled: true } }] }
  constructor(...args: ConstructorParameters<typeof Component>) { super(...args); scoped = this }
  <template>
    {{this.hotkeys.useHotkey "A" this.run}}
    {{this.hotkeys.useHotkeys this.definitions}}
    {{this.hotkeys.useHotkey (array "G" "G") this.run}}
    {{this.hotkeys.useHotkeys this.sequences}}
    <output id="scoped-count">{{this.count}}</output>
  </template>
}

module('Ember scoped defaults and recorder parity', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance(); KeyStateTracker.resetInstance()
    records.length = 0
  })
  test('scoped defaults update helpers and preserve overrides and registration identity', async (assert) => {
    await render(<template><ScopedExample /></template>)
    await key('a'); await key('b')
    assert.dom('#scoped-count').hasText('1')
    const ids = [...getHotkeyManager().registrations.state.keys()]
    scoped.enabled = true
    await settled()
    await key('a')
    assert.dom('#scoped-count').hasText('2')
    assert.deepEqual([...getHotkeyManager().registrations.state.keys()], ids)
    assert.true([...getHotkeyManager().registrations.state.values()].filter(r => r.kind === 'sequence').every(r => r.options.timeout === 321))
    await clearRender()
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
  })
  test('active recorders read current options and validation', async (assert) => {
    await render(<template><ScopedExample /></template>)
    scoped.recorder.startRecording()
    await key('a', 'keydown', { code: 'KeyA' })
    assert.true(scoped.recorder.isRecording)
    scoped.recordBy = 'code'; scoped.accept = true
    await key('ß', 'keydown', { code: 'KeyS' })
    assert.deepEqual(records, ['[KeyS]'])
    scoped.accept = false
    scoped.sequenceRecorder.startRecording()
    await key('g', 'keydown', { code: 'KeyG' }); await key('g', 'keyup', { code: 'KeyG' })
    scoped.sequenceRecorder.commitRecording()
    assert.true(scoped.sequenceRecorder.isRecording)
    scoped.accept = true
    scoped.sequenceRecorder.commitRecording()
    assert.deepEqual(records, ['[KeyS]', '[KeyG]'])
  })
})

let optional: Optional

class Optional extends Component {
  @tracked shortcut: Hotkey | null | undefined = undefined
  @tracked count = 0
  hint = useHotkeyHint(this, () => this.shortcut)
  run = () => { this.count++ }

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    optional = this
  }

  get definitions(): Array<EmberHotkeyDefinition> {
    return [{ hotkey: this.shortcut, callback: this.run }]
  }

  <template>
    {{useHotkey this.shortcut this.run}}
    {{useHotkeys this.definitions}}
    <div id="optional-element" tabindex="0" {{onHotkey this.shortcut this.run}} {{onHotkeys this.definitions}}></div>
    <output id="optional-count">{{this.count}}</output>
    <output id="optional-hint">{{if this.hint.value "yes" "no"}}</output>
  </template>
}

module('Ember hotkeys: optional hotkeys', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  test('an unset hotkey renders, registers nothing, and has no hint', async (assert) => {
    await render(<template><Optional /></template>)
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
    await key('Control', 'keydown', { ctrlKey: true })
    assert.dom('#optional-hint').hasText('no')
  })

  test('a hotkey that becomes unset unregisters, and registers again when set', async (assert) => {
    await render(<template><Optional /></template>)
    optional.shortcut = 'Control+K'
    await settled()
    assert.strictEqual(getHotkeyManager().registrations.state.size, 4)
    optional.shortcut = null
    await settled()
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
    await key('k', 'keydown', { ctrlKey: true })
    assert.dom('#optional-count').hasText('0')
    optional.shortcut = 'Control+K'
    await settled()
    assert.strictEqual(getHotkeyManager().registrations.state.size, 4)
    await key('k', 'keydown', { ctrlKey: true })
    assert.dom('#optional-count').hasText('2')
  })
})

let renderCost: RenderCost
let holdReads = 0
let hintReads = 0

class RenderCost extends Component {
  @tracked holdKey: 'Shift' | 'Alt' = 'Shift'
  hold = useKeyHold(this, () => this.holdKey)
  hint = useHotkeyHint(this, 'Mod+S')

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    renderCost = this
  }

  get holdText() { holdReads++; return this.hold.value ? 'yes' : 'no' }
  get hintText() { hintReads++; return this.hint.value ? 'yes' : 'no' }

  <template>
    {{useHotkey "Mod+S" this.noop}}
    <output id="cost-hold">{{this.holdText}}</output>
    <output id="cost-hint">{{this.hintText}}</output>
  </template>

  noop = () => {}
}

module('Ember hotkeys: display helper render cost', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  test('hold and hint consumers re-render only when their value changes', async (assert) => {
    await render(<template><RenderCost /></template>)
    holdReads = 0
    hintReads = 0
    for (const unrelated of 'qwertyuiop') {
      await key(unrelated)
      await key(unrelated, 'keyup')
    }
    assert.strictEqual(holdReads, 0)
    assert.strictEqual(hintReads, 0)
    await key('Shift', 'keydown', { shiftKey: true })
    assert.dom('#cost-hold').hasText('yes')
    // A getter key switches without a key event.
    renderCost.holdKey = 'Alt'
    await settled()
    assert.dom('#cost-hold').hasText('no')
    await key('Shift', 'keyup')
    await key('Alt', 'keydown', { altKey: true })
    assert.dom('#cost-hold').hasText('yes')
  })
})
