import { module, test } from 'qunit';
import { render, settled } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { HotkeyManager, SequenceManager } from '@tanstack/hotkeys';
import onHotkeySequence from '@tanstack/ember-hotkeys/helpers/on-hotkey-sequence';
import { array } from '@ember/helper';

module('Integration | Helper | on-hotkey-sequence', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    HotkeyManager.resetInstance();
    SequenceManager.resetInstance();
  });

  hooks.afterEach(function () {
    HotkeyManager.resetInstance();
    SequenceManager.resetInstance();
  });

  test('it registers a sequence handler', async function (assert) {
    const callback = () => {};

    await render(
      <template>
        {{onHotkeySequence (array "G" "G") callback}}
      </template>,
    );

    const manager = SequenceManager.getInstance();
    assert.strictEqual(
      manager.getRegistrationCount(),
      1,
      'sequence is registered',
    );
  });

  test('it calls callback when sequence matches', async function (assert) {
    assert.expect(1);

    const callback = () => assert.ok(true, 'sequence callback was called');

    await render(
      <template>
        {{onHotkeySequence (array "G" "G") callback}}
      </template>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'g',
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'g',
        bubbles: true,
      }),
    );
  });

  test('it does not call callback for partial sequence', async function (assert) {
    let callCount = 0;
    const callback = () => callCount++;

    await render(
      <template>
        {{onHotkeySequence (array "D" "I" "W") callback}}
      </template>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'd',
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'i',
        bubbles: true,
      }),
    );

    assert.strictEqual(callCount, 0, 'callback not called for partial sequence');
  });

  test('it unregisters on teardown', async function (assert) {
    const callback = () => {};

    await render(
      <template>
        {{onHotkeySequence (array "G" "G") callback}}
      </template>,
    );

    const manager = SequenceManager.getInstance();
    assert.strictEqual(
      manager.getRegistrationCount(),
      1,
      'sequence is registered',
    );

    await render(<template></template>);
    await settled();

    assert.strictEqual(
      manager.getRegistrationCount(),
      0,
      'sequence is unregistered after teardown',
    );
  });

  test('it supports the enabled option', async function (assert) {
    let callCount = 0;
    const callback = () => callCount++;

    await render(
      <template>
        {{onHotkeySequence (array "G" "G") callback enabled=false}}
      </template>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'g',
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'g',
        bubbles: true,
      }),
    );

    assert.strictEqual(callCount, 0, 'callback is not called when disabled');
  });

  test('it handles empty sequence as no-op', async function (assert) {
    const callback = () => {};

    await render(
      <template>
        {{onHotkeySequence (array) callback}}
      </template>,
    );

    const manager = SequenceManager.getInstance();
    assert.strictEqual(
      manager.getRegistrationCount(),
      0,
      'empty sequence is not registered',
    );
  });
});
