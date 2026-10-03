import { module, test } from 'qunit'
import { render, settled, clearRender } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import {
  useHotkeys, useHotkeySequences, HotkeyManager, SequenceManager,
  getHotkeyManager, getSequenceManager,
} from '@tanstack/ember-hotkeys'
import type { HotkeyDefinition, HotkeySequenceDefinition } from '@tanstack/ember-hotkeys'

let instance: ReactiveExample
let count = 0

class ReactiveExample extends Component {
  @tracked enabled = true

  definitions: Array<HotkeyDefinition> = [{
    hotkey: 'A',
    callback: () => count++,
    options: this.createOptions(),
  }]
  sequences: Array<HotkeySequenceDefinition> = [{
    sequence: ['B', 'C'],
    callback: () => count++,
    options: this.createOptions(),
  }]

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    instance = this
  }

  createOptions() {
    const component = this
    return { get enabled() { return component.enabled } }
  }

  <template>
    {{useHotkeys this.definitions}}
    {{useHotkeySequences this.sequences}}
  </template>
}

module('Reactive options', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance()
    SequenceManager.resetInstance()
    count = 0
  })

  for (const kind of ['hotkey', 'sequence']) {
    test(`tracks property getters in stable ${kind} definitions`, async (assert) => {
      await render(<template><ReactiveExample /></template>)
      const registrations = kind === 'hotkey'
        ? getHotkeyManager().registrations
        : getSequenceManager().registrations
      const ids = [...registrations.state.keys()]
      const press = async (key: string) => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
        await settled()
      }
      const invoke = async () => {
        if (kind === 'hotkey') await press('a')
        else { await press('b'); await press('c') }
      }

      await invoke()
      assert.strictEqual(count, 1)
      instance.enabled = false
      await settled()
      await invoke()
      assert.strictEqual(count, 1, `${kind} disabled`)
      assert.deepEqual([...registrations.state.keys()], ids, 'registration identity retained')

      instance.enabled = true
      await settled()
      await clearRender()
      await invoke()
      assert.strictEqual(count, 1, 'destroyed helpers do not fire')
      assert.strictEqual(registrations.state.size, 0)
    })
  }
})
