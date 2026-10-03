import { module, test } from 'qunit'
import { render, settled, clearRender, click } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { array } from '@ember/helper'
import {
  createHotkeysScope, useHotkey, useHotkeys, useHotkeySequence, useHotkeySequences,
  useHeldKeys, useHeldKeyCodes, useKeyHold, useHotkeyHint,
  useHotkeyRecorder, useHotkeySequenceRecorder, useHotkeyRegistrations,
  HotkeyManager, SequenceManager, KeyStateTracker, getHotkeyManager, getSequenceManager,
} from '@tanstack/ember-hotkeys'
import type { Hotkey, HotkeyDefinition, HotkeySequenceDefinition } from '@tanstack/ember-hotkeys'

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
  recorder = useHotkeyRecorder(this, { recordBy: 'key', platform: 'mac', onRecord: (value) => records.push(value) })
  sequenceRecorder = useHotkeySequenceRecorder(this, { recordBy: 'key', platform: 'mac', onRecord: (value) => records.push(value) })
  save = () => { this.count++ }
  runOther = () => { this.other++ }
  changeBinding = () => { this.binding = 'Alt+S' }
  toggle = () => { this.enabled = !this.enabled }

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    instance = this
  }

  get definitions(): Array<HotkeyDefinition> {
    return this.enabled ? [{ hotkey: 'B', callback: this.runOther }] : []
  }
  get sequences(): Array<HotkeySequenceDefinition> {
    return this.enabled ? [{ sequence: ['D', 'D'], callback: this.runOther }] : []
  }
  get heldText() { return this.held.value.join(',') }
  get codeText() { return JSON.stringify(this.codes.value) }

  <template>
    {{useHotkey this.binding this.save enabled=this.enabled}}
    {{useHotkeys this.definitions}}
    {{useHotkeySequence (array "G" "G") this.save}}
    {{useHotkeySequences this.sequences}}
    <button id="binding" type="button" {{on "click" this.changeBinding}}>Change binding</button>
    <button id="enabled" type="button" {{on "click" this.toggle}}>Toggle</button>
    <output id="count">{{this.count}}</output>
    <output id="other">{{this.other}}</output>
    <output id="held">{{this.heldText}}</output>
    <output id="codes">{{this.codeText}}</output>
    <output id="hint">{{if this.hint.value "yes" "no"}}</output>
    <output id="hold">{{if this.hold.value "yes" "no"}}</output>
    <output id="registrations">{{this.registrations.hotkeys.length}}:{{this.registrations.sequences.length}}</output>
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
    SequenceManager.resetInstance()
    KeyStateTracker.resetInstance()
    records.length = 0
  })

  test('updates callbacks, bindings, and enabled options without replacing stable handles', async (assert) => {
    await render(<template><Example /></template>)
    const id = [...getHotkeyManager().registrations.state.values()].find((registration) => registration.parsedHotkey.ctrl)!.id
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
    await click('#binding')
    assert.dom('#hint').hasText('no')
    await key('Control', 'keyup')
    assert.dom('#held').hasText('')
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
    assert.deepEqual(records, ['Control+S', ['G']])
    instance.recorder.startRecording()
    await clearRender()
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
    assert.strictEqual(getSequenceManager().registrations.state.size, 0)
    await key('k')
    assert.strictEqual(records.length, 2)
  })

  test('unmounts pending sequence progress and subscriptions', async (assert) => {
    await render(<template><Example /></template>)
    await key('g')
    await clearRender()
    await key('g')
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
    assert.strictEqual(getSequenceManager().registrations.state.size, 0)
  })
})

let scoped: ScopedExample
class ScopedExample extends Component {
  @tracked enabled = false
  @tracked recordBy: 'key' | 'code' = 'key'
  @tracked accept = false
  @tracked count = 0
  hotkeys = createHotkeysScope(() => ({
    hotkey: { enabled: this.enabled },
    hotkeySequence: { enabled: this.enabled, timeout: 321 },
    hotkeyRecorder: { recordBy: this.recordBy },
    hotkeySequenceRecorder: { recordBy: this.recordBy },
  }))
  recorder = this.hotkeys.useHotkeyRecorder(this, () => ({
    onRecord: (value) => records.push(value), validate: () => this.accept,
  }))
  sequenceRecorder = this.hotkeys.useHotkeySequenceRecorder(this, () => ({
    onRecord: (value) => records.push(value), validate: () => this.accept,
  }))
  run = () => { this.count++ }
  get definitions(): Array<HotkeyDefinition> { return [{ hotkey: 'B', callback: this.run, options: { enabled: true } }] }
  get sequences(): Array<HotkeySequenceDefinition> { return [{ sequence: ['X', 'X'], callback: this.run, options: { enabled: true } }] }
  constructor(...args: ConstructorParameters<typeof Component>) { super(...args); scoped = this }
  <template>
    {{this.hotkeys.useHotkey "A" this.run}}
    {{this.hotkeys.useHotkeys this.definitions}}
    {{this.hotkeys.useHotkeySequence (array "G" "G") this.run}}
    {{this.hotkeys.useHotkeySequences this.sequences}}
    <output id="scoped-count">{{this.count}}</output>
  </template>
}

module('Ember scoped defaults and recorder parity', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance(); SequenceManager.resetInstance(); KeyStateTracker.resetInstance()
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
    assert.true([...getSequenceManager().registrations.state.values()].every(r => r.options.timeout === 321))
    await clearRender()
    assert.strictEqual(getHotkeyManager().registrations.state.size, 0)
    assert.strictEqual(getSequenceManager().registrations.state.size, 0)
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
    assert.deepEqual(records, ['[KeyS]', ['[KeyG]']])
  })
})
