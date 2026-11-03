import Component from '@glimmer/component'
import { render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import { module, test } from 'qunit'
import {
  createHotkeysScope, onHotkey, useHotkey,
  HotkeyManager, KeyStateTracker,
} from '@tanstack/ember-hotkeys'

/** Presses Ctrl+S on an element and reports what happened to the event. */
function pressCtrlS(target: Element = document.body) {
  let reachedWindow = false
  const listener = () => (reachedWindow = true)
  window.addEventListener('keydown', listener)
  const event = new KeyboardEvent('keydown', {
    key: 's', ctrlKey: true, bubbles: true, cancelable: true,
  })
  target.dispatchEvent(event)
  window.removeEventListener('keydown', listener)
  return { defaultPrevented: event.defaultPrevented, reachedWindow }
}

const DEFAULT = { defaultPrevented: true, reachedWindow: false }

interface ShortcutSignature {
  Args: { preventDefault?: boolean; stopPropagation?: boolean }
}

/** Forwards optional args, the way a wrapper component would. */
class Shortcut extends Component<ShortcutSignature> {
  run = () => {}
  <template>
    {{useHotkey "Control+S" this.run preventDefault=@preventDefault stopPropagation=@stopPropagation}}
  </template>
}

interface ModifierShortcutSignature {
  Args: { stop?: boolean }
}

class ModifierShortcut extends Component<ModifierShortcutSignature> {
  run = () => {}
  <template>
    <div id="modifier-target" {{onHotkey "Control+S" this.run stopPropagation=@stop}}></div>
  </template>
}

class ScopeShortcut extends Component {
  hotkeys = createHotkeysScope({
    hotkey: { preventDefault: undefined, stopPropagation: undefined },
  })
  run = () => {}
  <template>
    {{this.hotkeys.useHotkey "Control+S" this.run}}
  </template>
}

module('Unset options', (hooks) => {
  setupRenderingTest(hooks)
  hooks.afterEach(() => {
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  test('helper args forwarded unset keep their defaults', async (assert) => {
    await render(<template><Shortcut /></template>)
    await settled()
    assert.deepEqual(pressCtrlS(), DEFAULT)
  })

  test('modifier args forwarded unset keep their defaults', async (assert) => {
    await render(<template><ModifierShortcut /></template>)
    await settled()
    assert.deepEqual(
      pressCtrlS(document.querySelector('#modifier-target')!),
      DEFAULT,
    )
  })

  test('createHotkeysScope defaults set to undefined keep the core defaults', async (assert) => {
    await render(<template><ScopeShortcut /></template>)
    await settled()
    assert.deepEqual(pressCtrlS(), DEFAULT)
  })
})
