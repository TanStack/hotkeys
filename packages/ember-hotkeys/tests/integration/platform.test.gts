import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { hash } from '@ember/helper'
import { clearRender, render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import { module, test } from 'qunit'
import {
  createHotkeysScope, useFormatForDisplay, useHotkeyRecorder,
  HotkeyManager, KeyStateTracker,
} from '@tanstack/ember-hotkeys'

async function press(modifier: 'metaKey' | 'ctrlKey') {
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 's', code: 'KeyS', [modifier]: true, bubbles: true,
  }))
  document.dispatchEvent(new KeyboardEvent('keyup', {
    key: 's', code: 'KeyS', bubbles: true,
  }))
  await settled()
}

let instance: Platform
const records: Array<unknown> = []

class Platform extends Component {
  @tracked platform: 'mac' | 'windows' = 'mac'
  @tracked saves = 0
  @tracked windowsSaves = 0
  hotkeys = createHotkeysScope(() => ({ platform: this.platform }))
  format = useFormatForDisplay(this.hotkeys)
  recorder = useHotkeyRecorder(this, { onRecord: (value) => records.push(value) }, this.hotkeys)
  save = () => { this.saves++ }
  saveWindows = () => { this.windowsSaves++ }
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    instance = this
  }
  <template>
    <kbd id="label">{{this.format "Mod+S"}}</kbd>
    <kbd id="explicit">{{this.format "Mod+S" (hash platform="windows")}}</kbd>
    {{this.hotkeys.useHotkey "Mod+S" this.save}}
    {{this.hotkeys.useHotkey "Mod+S" this.saveWindows platform="windows" conflictBehavior="allow"}}
  </template>
}

class HotkeyPlatform extends Component {
  @tracked saves = 0
  hotkeys = createHotkeysScope({ platform: 'mac', hotkey: { platform: 'windows' } })
  save = () => { this.saves++ }
  <template>
    {{this.hotkeys.useHotkey "Mod+S" this.save}}
    <output id="saves">{{this.saves}}</output>
  </template>
}

module('Scope platform', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
    records.length = 0
  })

  test('formats labels and matches Mod for the scope platform', async (assert) => {
    await render(<template><Platform /></template>)
    assert.dom('#label').hasText('⌘ S')
    assert.dom('#explicit').hasText('Ctrl+S')
    await press('metaKey')
    assert.deepEqual([instance.saves, instance.windowsSaves], [1, 0])
    await press('ctrlKey')
    assert.deepEqual([instance.saves, instance.windowsSaves], [1, 1])

    instance.platform = 'windows'
    await settled()
    assert.dom('#label').hasText('Ctrl+S')
    await press('ctrlKey')
    assert.deepEqual([instance.saves, instance.windowsSaves], [2, 2])
    await press('metaKey')
    assert.deepEqual([instance.saves, instance.windowsSaves], [2, 2])
  })

  test('hotkey.platform wins over the scope platform', async (assert) => {
    await render(<template><HotkeyPlatform /></template>)
    await press('metaKey')
    assert.dom('#saves').hasText('0')
    await press('ctrlKey')
    assert.dom('#saves').hasText('1')
  })

  test('gives recorders the scope platform', async (assert) => {
    await render(<template><Platform /></template>)
    instance.recorder.startRecording()
    await press('metaKey')
    instance.platform = 'windows'
    instance.recorder.startRecording()
    await press('metaKey')
    assert.deepEqual(records, ['Mod+[KeyS]', 'Meta+[KeyS]'])
  })
})
