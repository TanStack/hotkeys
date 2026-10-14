import { module, test } from 'qunit'
import { render, settled, clearRender } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import {
  HotkeyManager,
  defineAppHotkeys,
  getHotkeyManager,
  provideAppHotkeys,
  useAppHotkeyList,
  useCustomHotkeys,
  useHotkey,
  useHotkeys,
} from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Control+S', meta: { name: 'Save' } },
  'palette.open': { hotkey: null },
  'nav.home': { hotkey: ['G', 'H'], options: { timeout: 400 } },
})

let instance: AppExample

class AppExample extends Component {
  @tracked count = 0
  list = useAppHotkeyList(this)
  custom = useCustomHotkeys(this)
  save = () => {
    this.count++
  }
  saveHotkey = appHotkeys['doc.save']
  get definitions(): Array<EmberHotkeyDefinition> {
    return [
      { hotkey: appHotkeys['nav.home'], callback: () => {} },
      { hotkey: appHotkeys['palette.open'], callback: () => {} },
    ]
  }
  get statuses() {
    return this.list.value.map((item) => item.status).join(',')
  }
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    instance = this
  }
  <template>
    {{useHotkey this.saveHotkey this.save}}
    {{useHotkeys this.definitions}}
    <output id="count">{{this.count}}</output>
    <output id="statuses">{{this.statuses}}</output>
  </template>
}

async function key(key: string, options: KeyboardEventInit = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
  document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, ...options }))
  await settled()
}

module('App hotkeys', (hooks) => {
  setupRenderingTest(hooks)
  let dispose: () => void
  const changes: Array<unknown> = []
  hooks.beforeEach(() => {
    changes.length = 0
    dispose = provideAppHotkeys(appHotkeys, {
      customHotkeys: { 'nav.home': ['G', 'G'] },
      onCustomHotkeysChange: (custom) => changes.push(custom),
    }).dispose
  })
  hooks.afterEach(async () => {
    await clearRender()
    dispose()
    HotkeyManager.resetInstance()
  })

  test('registers app hotkeys, lists status, and follows custom hotkeys', async (assert) => {
    await render(<template><AppExample /></template>)
    assert.dom('#statuses').hasText('active,unbound,active')
    assert.deepEqual(
      [...getHotkeyManager().registrations.state.values()].map((r) => r.hotkey),
      ['Control+S', ['G', 'G']],
    )
    await key('s', { ctrlKey: true })
    assert.dom('#count').hasText('1')

    instance.custom.setCustomHotkey('doc.save', ['G', 'S'])
    instance.custom.setCustomHotkey('palette.open', 'Control+K')
    await settled()
    assert.dom('#statuses').hasText('active,active,active')
    assert.deepEqual(changes.at(-1), {
      'nav.home': ['G', 'G'],
      'doc.save': ['G', 'S'],
      'palette.open': 'Control+K',
    })
    await key('g')
    await key('s')
    assert.dom('#count').hasText('2')
  })
})
