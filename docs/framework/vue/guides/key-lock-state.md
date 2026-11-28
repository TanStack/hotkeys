---
title: Read Lock Key State in Vue
id: key-lock-state
description: Show whether Caps Lock, Num Lock, or Scroll Lock is on in Vue, handle the unknown state, and test UI that depends on it.
---

`useKeyLockState` reports whether a lock key is on. Use it for a Caps Lock warning on a password field, or a Num Lock hint on a form that takes numpad input.

## Read a lock's state

`useKeyLockState(key)` takes `'CapsLock'`, `'NumLock'`, or `'ScrollLock'` and returns a read-only ref that holds one of these values:

- `true` when the lock is on.
- `false` when the lock is off.
- `null` when the browser hasn't reported the lock.

```vue
<script setup lang="ts">
import { useKeyLockState } from '@tanstack/vue-hotkeys'

const capsLock = useKeyLockState('CapsLock')
</script>

<template>
  <span v-if="capsLock !== null">Caps Lock {{ capsLock ? 'on' : 'off' }}</span>
</template>
```

The ref changes only when the lock's value changes, and templates unwrap it for you. The key can also be a ref or a getter, such as `useKeyLockState(() => props.lock)`.

Lock keys toggle instead of being held. `useKeyHold('CapsLock')` answers a different question: its `value` is `true` only while the key is physically down, and it goes back to `false` when the user lets go, even though Caps Lock stays on. On macOS, Chrome and Safari send a keydown when Caps Lock turns on and a keyup when it turns off, so there `useKeyHold('CapsLock')` can look like lock state. Don't rely on that. Use `useKeyLockState` to read whether a lock is on. For keys the user holds, see [Track held keys and modifier state](./held-key-state-helpers).

## Why the value starts as `null`

Browsers have no API that reports lock state when the page loads. The state comes only with input events, through `event.getModifierState()`. The key state tracker reads it from keydown, keyup, mousedown, and mousemove events, so every lock is `null` until the user presses a key, clicks, or moves the mouse over the page. From then on, the value follows the user's input.

The tracker reads only trusted events, the ones the browser creates from real input. It ignores events dispatched by page code, such as `element.dispatchEvent(new KeyboardEvent('keydown'))`, because those report every lock as off.

Treat `null` as unknown, not as off. For a warning, show nothing until the value is `true`. The first key press in the field reports Caps Lock, so the warning appears as the user starts typing.

Num Lock and Scroll Lock stay `null` on macOS and iOS. See [Browser and platform support](#browser-and-platform-support).

## Why it resets when the window loses focus

Every lock goes back to `null` when the window loses focus or the page is hidden, such as when the user switches to another tab or app. The user can toggle a lock in another app, so the last value the page saw may no longer be true. The next key press, click, or mouse move over the page reports the lock again.

Held keys reset at the same moments. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus).

## Browser and platform support

From the Chromium, Firefox, and WebKit source code, these browsers report each lock through `getModifierState()`:

| Lock        | Chromium (Chrome, Edge, Electron) | Firefox              | Safari |
| ----------- | --------------------------------- | -------------------- | ------ |
| Caps Lock   | Yes                               | Yes                  | Yes    |
| Num Lock    | Yes                               | Yes, except on macOS | No     |
| Scroll Lock | Yes                               | Yes                  | No     |

Mac keyboards have no Num Lock or Scroll Lock key. On macOS, Firefox sets its Num Lock flag for keys on the numpad, which isn't lock state. For these reasons, `NumLock` and `ScrollLock` are always `null` on macOS and iOS, in every browser. Caps Lock works on every platform.

The [UI Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier) also names `FnLock` and `SymbolLock`, but no browser engine reports them. Chromium doesn't map them, Firefox accepts the names but no platform backend sets them, and WebKit doesn't support them. Electron is no different: its renderer is Chromium, and its main-process [`before-input-event`](https://www.electronjs.org/docs/latest/api/web-contents#event-before-input-event) reports only `capslock` and `numlock`. The keyboard firmware handles Fn Lock, so a page has nothing to read.

## Example: warn about Caps Lock on a password field

```vue
<script setup lang="ts">
import { useKeyLockState } from '@tanstack/vue-hotkeys'

const capsLock = useKeyLockState('CapsLock')
</script>

<template>
  <label>
    Password
    <input type="password" autocomplete="current-password" />
    <span role="status">{{ capsLock ? 'Caps Lock is on' : '' }}</span>
  </label>
</template>
```

The status element stays in the page and only its text changes, so screen readers can announce the warning when it appears. A `null` value hides the warning, the same as `false`.

## Example: show Num Lock state on a numpad entry form

A form for typing numbers on the numpad can tell the user when Num Lock is off. Check for `null` separately here: on macOS the value is always `null`, and "Num Lock is off" would be wrong for a keyboard that has no Num Lock key.

```vue
<script setup lang="ts">
import { useKeyLockState } from '@tanstack/vue-hotkeys'

const numLock = useKeyLockState('NumLock')
</script>

<template>
  <form>
    <label>
      Quantity
      <input inputmode="numeric" />
    </label>
    <p v-if="numLock === false">Num Lock is off. Turn it on to type numbers on the numpad.</p>
    <p v-else-if="numLock === true">Num Lock is on</p>
  </form>
</template>
```

## Read lock state in an event handler

To check a lock once inside a key or mouse handler, call `event.getModifierState()`. It creates no reactive dependency, so nothing updates:

```vue
<script setup lang="ts">
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    logSignInAttempt({ capsLock: event.getModifierState('CapsLock') })
  }
}
</script>

<template>
  <input type="password" @keydown="onKeydown" />
</template>
```

`getModifierState()` returns what the browser reports, without the tracker's rules. Events dispatched by page code report every lock as off. On macOS, Num Lock and Scroll Lock values aren't lock state: Chrome reports them off, and Firefox reports Num Lock for numpad keys.

When the handler has no key or mouse event, such as a timer or a form's submit handler, read the shared tracker instead. `getKeyStateTracker().getKeyLockState('CapsLock')` returns the same `true`, `false`, or `null` as `useKeyLockState`.

## Test lock state

happy-dom ignores `modifierCapsLock` and the other lock fields in a `KeyboardEvent` init, and its `MouseEvent` has no `getModifierState`. The tracker also reads only trusted events. Before you dispatch a test event, define `isTrusted` and an own `getModifierState` on it:

```ts
import { afterEach, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { KeyStateTracker } from '@tanstack/vue-hotkeys'
import type { LockKey } from '@tanstack/vue-hotkeys'
import PasswordField from './PasswordField.vue'

afterEach(() => {
  KeyStateTracker.resetInstance()
})

function withLocks<TEvent extends Event>(
  event: TEvent,
  locks: Partial<Record<LockKey, boolean>>,
): TEvent {
  Object.defineProperty(event, 'isTrusted', { value: true })
  Object.defineProperty(event, 'getModifierState', {
    value: (key: string) => locks[key as LockKey] === true,
  })
  return event
}

it('warns when Caps Lock is on', async () => {
  const wrapper = mount(PasswordField)

  document.dispatchEvent(
    withLocks(
      new KeyboardEvent('keydown', { key: 'A', code: 'KeyA', bubbles: true }),
      { CapsLock: true },
    ),
  )
  await nextTick()

  expect(wrapper.get('[role="status"]').text()).toBe('Caps Lock is on')
  wrapper.unmount()
})
```

Reset `KeyStateTracker` after each test so lock values don't carry over to the next one. A real browser doesn't let you redefine `isTrusted`, so this works only in a simulated DOM such as happy-dom. See [Testing](./testing) for the rest of the test setup.

See the [useKeyLockState example](../examples/useKeyLockState) for a Caps Lock warning on a password field and an indicator for each lock.
