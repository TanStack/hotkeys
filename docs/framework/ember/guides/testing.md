---
title: Testing Hotkeys in Ember
id: testing
description: Write reliable rendering tests for Ember hotkeys by resetting singleton managers and pinning the target platform.
---

TanStack Hotkeys keeps page-level singletons for the [hotkey manager](./hotkey-manager) and the held-key tracker. Two practices keep rendering tests deterministic across operating systems and test files. Reset those singletons after each test, and pin `platform`.

## Reset singletons between tests

Removing a helper or modifier from the template unregisters its hotkeys. Hotkeys registered with `manager.register`, scopes from `activateScope`, and registrations left behind by a failed test stay in the singletons.

Clear the rendered template and reset `HotkeyManager` in `afterEach`. Reset `KeyStateTracker` too in tests that read held keys:

```gts
import { module, test } from 'qunit'
import { clearRender, render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import {
  HotkeyManager,
  KeyStateTracker,
  useHotkey,
} from '@tanstack/ember-hotkeys'

module('Integration | editor hotkeys', function (hooks) {
  setupRenderingTest(hooks)

  hooks.afterEach(async function () {
    await clearRender()
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  test('saves with Mod+S', async function (assert) {
    let saves = 0
    const save = () => saves++

    await render(<template>{{useHotkey 'Mod+S' save platform='mac'}}</template>)
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
    )
    await settled()

    assert.strictEqual(saves, 1)
  })
})
```

`resetInstance()` removes every listener and registration, and the next `getHotkeyManager()` call creates a fresh manager.

## Pin the platform

Simulated DOMs don't always match your development or CI operating system. A test that runs in a real browser still depends on the machine's platform, which changes what `Mod` means. Pass `platform='mac'`, `'windows'`, or `'linux'` as a named argument on the helper or modifier, or set it once for a group of hotkeys with `createHotkeysScope`:

```gts
import Component from '@glimmer/component'
import { createHotkeysScope } from '@tanstack/ember-hotkeys'

class Editor extends Component {
  hotkeys = createHotkeysScope({ platform: 'mac' })
  save = () => saveDocument()

  <template>
    {{this.hotkeys.useHotkey 'Mod+S' this.save}}
  </template>
}
```

The scope's `platform` is the default for the helpers, modifiers, recorders, and labels that use it. Pass the scope to `useFormatForDisplay(scope)` so labels in the same test use the same platform. A `platform` on a single helper wins over the scope's.

## Dispatching keyboard events

- **Include `bubbles: true` and `cancelable: true`.** Listeners sit on `document` or target elements, and checking `event.defaultPrevented` requires `cancelable: true`.
- **Include `code` for physical bindings.** Bindings like `[KeyS]` match `event.code`, not `event.key`:

```ts
const event = new KeyboardEvent('keydown', {
  key: 's',
  code: 'KeyS',
  metaKey: true,
  bubbles: true,
  cancelable: true,
})
document.dispatchEvent(event)
assert.true(event.defaultPrevented)
```

- **Dispatch `keydown` before `keyup`.** Hotkeys with `eventType: 'keyup'` fire only for the release of a matching press they observed.
- **Simulate key repeat.** Pass `repeat: true` to test `requireReset=true` chords. Repeats don't advance sequences. A non-repeat `keydown` counts as a fresh press even without an intervening `keyup`.
- **Await `settled()` after each event.** Tracked options and arguments update after rendering, so wait before the next key press.

## Testing sequences and timeouts

Dispatch each step in order. QUnit has no fake timers, so use a library such as `sinon` to verify the sequence `timeout` (`1000` ms by default). Fake the clock only around the key presses, and restore it before awaiting `settled()`:

```ts
import sinon from 'sinon'

const clock = sinon.useFakeTimers()
try {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
  clock.tick(500)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
} finally {
  clock.restore()
}

assert.strictEqual(goHomeCount, 1)
```

## Testing element targets and inputs

For a hotkey from the `onHotkey` or `onHotkeys` modifier, or to verify `ignoreInputs` inside an `<input>` or `<textarea>`, focus the element first and dispatch the event on it with `bubbles: true`:

```ts
import { find, settled } from '@ember/test-helpers'

const input = find('input')!
input.focus()
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
await settled()

assert.strictEqual(shortcutCount, 0)
```

A modifier registers its hotkey when the element renders, so `await render(...)` before dispatching an event on the element.
