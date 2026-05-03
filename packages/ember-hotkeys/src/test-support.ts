import { parseHotkey } from '@tanstack/hotkeys';
import type { Hotkey } from '@tanstack/hotkeys';

/**
 * Simulates a hotkey press by dispatching a `KeyboardEvent` on `document`.
 *
 * Useful in integration and acceptance tests to trigger hotkeys registered
 * via the `{{onHotkey}}` helper.
 *
 * @param combo - The hotkey combo string (e.g., 'Mod+S', 'Escape')
 *
 * @example
 * ```ts
 * import { triggerKeyPress } from '@tanstack/ember-hotkeys/test-support';
 * import { settled } from '@ember/test-helpers';
 *
 * test('onSave is called when Mod+S is pressed', async function (assert) {
 *   assert.expect(1);
 *   const onSave = () => assert.ok(true, 'onSave called');
 *   await render(
 *     <template>
 *       <MyComponent @onSave={{onSave}} />
 *     </template>
 *   );
 *   triggerKeyPress('Mod+S');
 *   await settled();
 * });
 * ```
 */
export function triggerKeyPress(combo: Hotkey): void {
  const parsed = parseHotkey(combo);
  const event = new KeyboardEvent('keydown', {
    key: parsed.key,
    altKey: parsed.alt,
    ctrlKey: parsed.ctrl,
    metaKey: parsed.meta,
    shiftKey: parsed.shift,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

/**
 * Simulates a keyup event for a hotkey on `document`.
 *
 * Useful when testing hotkeys registered with `eventType: 'keyup'`
 * or when testing key hold functionality.
 *
 * @param combo - The hotkey combo string (e.g., 'Mod+S', 'Escape')
 *
 * @example
 * ```ts
 * import { triggerKeyPress, triggerKeyRelease } from '@tanstack/ember-hotkeys/test-support';
 * import { settled } from '@ember/test-helpers';
 *
 * test('key hold detection', async function (assert) {
 *   triggerKeyPress('Shift');
 *   await settled();
 *   // ... assert held state ...
 *   triggerKeyRelease('Shift');
 *   await settled();
 * });
 * ```
 */
export function triggerKeyRelease(combo: Hotkey): void {
  const parsed = parseHotkey(combo);
  const event = new KeyboardEvent('keyup', {
    key: parsed.key,
    altKey: parsed.alt,
    ctrlKey: parsed.ctrl,
    metaKey: parsed.meta,
    shiftKey: parsed.shift,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}
