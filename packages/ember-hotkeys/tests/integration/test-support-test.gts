import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { HotkeyManager } from '@tanstack/hotkeys';
import { triggerKeyPress, triggerKeyRelease } from '@tanstack/ember-hotkeys/test-support';
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

module('Integration | Test Support | triggerKeyPress', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    HotkeyManager.resetInstance();
  });

  hooks.afterEach(function () {
    HotkeyManager.resetInstance();
  });

  test('triggerKeyPress dispatches a matching keydown event', async function (assert) {
    assert.expect(1);

    const callback = () => assert.ok(true, 'callback was called');

    await render(
      <template>
        {{onHotkey "Mod+S" callback}}
      </template>,
    );

    triggerKeyPress('Mod+S');
  });

  test('triggerKeyPress works with simple keys', async function (assert) {
    assert.expect(1);

    const callback = () => assert.ok(true, 'escape callback was called');

    await render(
      <template>
        {{onHotkey "Escape" callback}}
      </template>,
    );

    triggerKeyPress('Escape');
  });

  test('triggerKeyRelease dispatches a keyup event', async function (assert) {
    assert.expect(1);

    const callback = () => assert.ok(true, 'keyup callback was called');

    await render(
      <template>
        {{onHotkey "Escape" callback eventType="keyup"}}
      </template>,
    );

    triggerKeyRelease('Escape');
  });
});
