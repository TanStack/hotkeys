import { render, settled, clearRender, focus } from '@ember/test-helpers'
import { VERSION } from '@ember/version'
import { getHotkeyManager } from '@tanstack/ember-hotkeys'
import { hbs } from 'ember-cli-htmlbars'
import { setupRenderingTest } from 'ember-qunit'
import { module, test } from 'qunit'

function key(target, type, init) {
  target.dispatchEvent(
    new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }),
  )
}

module('tanstack ember-hotkeys probe', function (hooks) {
  setupRenderingTest(hooks)

  test('helper, modifier, readers and teardown', async function (assert) {
    assert.ok(true, `ember-source ${VERSION}`)
    await render(hbs`<Probe />`)
    await settled()
    assert.strictEqual(
      getHotkeyManager().registrations.state.size,
      2,
      'helper and modifier registered',
    )
    assert.dom('#hint').hasText('off')
    assert.dom('#label').hasAnyText()

    key(document.body, 'keydown', {
      key: 'Control',
      code: 'ControlLeft',
      ctrlKey: true,
    })
    await settled()
    assert.dom('#held').hasText('Control', 'held keys tracked')
    assert.dom('#hold').hasText('held', 'key hold tracked')
    assert.dom('#hint').hasText('on', 'hint tracked')

    key(document.body, 'keydown', { key: 's', code: 'KeyS', ctrlKey: true })
    await settled()
    assert.dom('#count').hasText('1', 'helper hotkey fired')
    key(document.body, 'keyup', { key: 's', code: 'KeyS', ctrlKey: true })
    key(document.body, 'keyup', { key: 'Control', code: 'ControlLeft' })
    await settled()
    assert.dom('#held').hasText('', 'released')
    assert.dom('#hint').hasText('off')

    await focus('#el')
    key(document.querySelector('#el'), 'keydown', { key: 'k', code: 'KeyK' })
    await settled()
    assert.dom('#count').hasText('2', 'modifier hotkey fired')

    await clearRender()
    assert.strictEqual(
      getHotkeyManager().registrations.state.size,
      0,
      'teardown',
    )
  })
})
