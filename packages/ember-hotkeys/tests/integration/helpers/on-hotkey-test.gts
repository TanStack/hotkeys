import { module, test } from 'qunit';
import { render, settled } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { HotkeyManager } from '@tanstack/hotkeys';
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

module('Integration | Helper | on-hotkey', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    HotkeyManager.resetInstance();
  });

  hooks.afterEach(function () {
    HotkeyManager.resetInstance();
  });

  test('it registers a hotkey handler', async function (assert) {
    const addEventListenerSpy = sinon(document, 'addEventListener');

    const callback = () => {};

    await render(
      <template>
        {{onHotkey "Mod+S" callback platform="mac"}}
      </template>,
    );

    assert.true(
      addEventListenerSpy.calls.some(
        (call: { args: Array<string> }) => call.args[0] === 'keydown',
      ),
      'addEventListener was called with keydown',
    );

    addEventListenerSpy.restore();
  });

  test('it calls callback when hotkey matches', async function (assert) {
    assert.expect(1);

    const callback = () => assert.ok(true, 'callback was called');

    await render(
      <template>
        {{onHotkey "Mod+S" callback platform="mac"}}
      </template>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    );
  });

  test('it does not call callback when hotkey does not match', async function (assert) {
    assert.expect(0);

    const callback = () => assert.ok(false, 'callback should not be called');

    await render(
      <template>
        {{onHotkey "Mod+S" callback platform="mac"}}
      </template>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        bubbles: true,
      }),
    );
  });

  test('it unregisters on teardown', async function (assert) {
    const callback = () => {};

    await render(
      <template>
        {{onHotkey "Mod+S" callback platform="mac"}}
      </template>,
    );

    const manager = HotkeyManager.getInstance();
    assert.strictEqual(
      manager.getRegistrationCount(),
      1,
      'hotkey is registered',
    );

    await render(<template></template>);
    await settled();

    assert.strictEqual(
      manager.getRegistrationCount(),
      0,
      'hotkey is unregistered after teardown',
    );
  });

  test('it supports the enabled option', async function (assert) {
    let callCount = 0;
    const callback = () => callCount++;

    await render(
      <template>
        {{onHotkey "Mod+S" callback platform="mac" enabled=false}}
      </template>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    );

    assert.strictEqual(callCount, 0, 'callback is not called when disabled');
  });

  test('it supports keyup event type', async function (assert) {
    assert.expect(1);

    const callback = () => assert.ok(true, 'callback was called on keyup');

    await render(
      <template>
        {{onHotkey "Escape" callback eventType="keyup"}}
      </template>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keyup', {
        key: 'Escape',
        bubbles: true,
      }),
    );
  });

  test('it supports preventDefault option', async function (assert) {
    let receivedEvent: KeyboardEvent | null = null;
    const callback = (event: KeyboardEvent) => {
      receivedEvent = event;
    };

    await render(
      <template>
        {{onHotkey "Mod+S" callback platform="mac" preventDefault=true}}
      </template>,
    );

    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    assert.ok(receivedEvent, 'callback received event');
    assert.true(event.defaultPrevented, 'default was prevented');
  });
});

function sinon(target: EventTarget, method: 'addEventListener') {
  const original = target[method].bind(target);
  const calls: Array<{ args: Array<unknown> }> = [];

  (target as Record<string, unknown>)[method] = function (...args: Array<unknown>) {
    calls.push({ args });
    return original(...args);
  };

  return {
    calls,
    restore() {
      (target as Record<string, unknown>)[method] = original;
    },
  };
}
