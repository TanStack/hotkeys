import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { clearRender, render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import { module, test } from 'qunit'
import {
  createHotkeysScope, onHotkey, onHotkeys, useHotkeyRegistrations,
  HotkeyManager, KeyStateTracker, getHotkeyManager,
} from '@tanstack/ember-hotkeys'
import type { Hotkey, HotkeyDefinition } from '@tanstack/ember-hotkeys'

let instance: ScopedShortcuts
class ScopedShortcuts extends Component {
  @tracked binding: Hotkey = 'Control+S'
  @tracked enabled = true
  @tracked visible = true
  @tracked bubble = false
  @tracked message = 'first'
  @tracked count = 0
  @tracked lastMessage = ''
  @tracked definitions: Array<HotkeyDefinition> = [{ hotkey: 'Alt+A', callback: () => this.count++ }]
  registrations = useHotkeyRegistrations(this)
  defaults = createHotkeysScope(() => ({ hotkey: { enabled: this.enabled } }))
  save = () => { this.count++; this.lastMessage = this.message }
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    instance = this
  }
  <template>
    {{#if this.visible}}
      <div id="single" {{onHotkey this.binding this.save enabled=this.enabled stopPropagation=this.bubble}}>
        <button id="inside" type="button">Inside</button>
      </div>
      <div id="plural" {{onHotkeys this.definitions}}></div>
      <div id="defaults" {{this.defaults.onHotkey "Alt+D" this.save}}></div>
      <div id="plural-defaults" {{this.defaults.onHotkeys this.definitions}}></div>
    {{/if}}
    <output id="registrations">{{this.registrations.hotkeys.length}}</output>
  </template>
}

async function key(target: EventTarget, key: string, options: KeyboardEventInit) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
  target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, ...options }))
  await settled()
}

module('Element-scoped hotkey modifiers', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(async () => {
    await clearRender()
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  test('scopes shortcuts to descendants, updates arguments, and releases removed elements', async (assert) => {
    await render(<template><ScopedShortcuts /></template>)
    const inside = document.querySelector('#inside')!
    await key(document, 's', { ctrlKey: true })
    assert.strictEqual(instance.count, 0, 'document events do not trigger a scoped binding')
    await key(inside, 's', { ctrlKey: true })
    assert.strictEqual(instance.count, 1)
    instance.binding = 'Alt+K'
    instance.message = 'updated'
    await settled()
    await key(inside, 's', { ctrlKey: true })
    assert.strictEqual(instance.count, 1, 'old binding no longer fires')
    await key(inside, 'k', { altKey: true })
    assert.strictEqual(instance.lastMessage, 'updated')
    const ids = [...getHotkeyManager().registrations.state.keys()]
    instance.enabled = false
    await settled()
    await key(inside, 'k', { altKey: true })
    await key(document.querySelector('#defaults')!, 'd', { altKey: true })
    await key(document.querySelector('#plural-defaults')!, 'a', { altKey: true })
    assert.strictEqual(instance.count, 2, 'named arguments and scoped defaults remain reactive')
    assert.deepEqual([...getHotkeyManager().registrations.state.keys()], ids, 'option updates preserve registration identity')
    instance.visible = false
    await settled()
    assert.dom('#registrations').hasText('0')
    await key(inside, 'k', { altKey: true })
    assert.strictEqual(instance.count, 2, 'detached elements no longer listen')
  })

  test('reconciles changing lists and keeps their target on the modifier element', async (assert) => {
    await render(<template><ScopedShortcuts /></template>)
    const target = document.querySelector('#plural')!
    await key(target, 'a', { altKey: true })
    assert.strictEqual(instance.count, 1)
    instance.definitions = [{ hotkey: 'Alt+B', callback: () => instance.count += 10, options: { target: document } }]
    await settled()
    await key(target, 'a', { altKey: true })
    await key(document, 'b', { altKey: true })
    assert.strictEqual(instance.count, 1)
    await key(target, 'b', { altKey: true })
    assert.strictEqual(instance.count, 11)
    instance.definitions = []
    await settled()
    await key(target, 'b', { altKey: true })
    assert.strictEqual(instance.count, 11)
  })

  test('updates propagation options without replacing the element', async (assert) => {
    await render(<template><ScopedShortcuts /></template>)
    let bubbled = 0
    const listener = () => bubbled++
    document.addEventListener('keydown', listener)
    try {
      await key(document.querySelector('#inside')!, 's', { ctrlKey: true })
      assert.strictEqual(bubbled, 1)
      instance.bubble = true
      await settled()
      await key(document.querySelector('#inside')!, 's', { ctrlKey: true })
      assert.strictEqual(bubbled, 1)
    } finally {
      document.removeEventListener('keydown', listener)
    }
  })
})
