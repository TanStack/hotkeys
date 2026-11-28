---
title: Read Lock Key State in Alpine
id: key-lock-state
description: Show whether Caps Lock, Num Lock, or Scroll Lock is on in Alpine, handle the unknown state, and test UI that depends on it.
---

`createKeyLockState` reports whether a lock key is on. Use it for a Caps Lock warning on a password field, or a Num Lock hint on a form that takes numpad input.

## Read a lock's state

`createKeyLockState(key)` on an owner from `createHotkeysScope` takes `'CapsLock'`, `'NumLock'`, or `'ScrollLock'`. It returns an object whose reactive `value` holds one of these values:

- `true` when the lock is on.
- `false` when the lock is off.
- `null` when the browser hasn't reported the lock.

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('capsLockBadge', () => {
  const hotkeys = createHotkeysScope()
  const capsLock = hotkeys.createKeyLockState('CapsLock')

  return {
    get label() {
      if (capsLock.value === null) return ''
      return `Caps Lock ${capsLock.value ? 'on' : 'off'}`
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<span x-data="capsLockBadge" x-show="label" x-text="label"></span>
```

Call it in `Alpine.data`, `x-init`, or `init()`, not in a reactive expression such as `x-text`, which would add a new subscription on every evaluation. An effect that reads `value` runs again whenever the key state changes, including key presses that don't change the lock. To track a key that changes, pass a getter instead of a key name.

Lock keys toggle instead of being held. `createKeyHold('CapsLock')` answers a different question: its `value` is `true` only while the key is physically down, and it goes back to `false` when the user lets go, even though Caps Lock stays on. On macOS, Chrome and Safari send a keydown when Caps Lock turns on and a keyup when it turns off, so there `createKeyHold('CapsLock')` can look like lock state. Don't rely on that. Use `createKeyLockState` to read whether a lock is on. For keys the user holds, see [Track held keys and modifier state](./held-key-state-helpers).

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

```ts
Alpine.data('passwordField', () => {
  const hotkeys = createHotkeysScope()
  const capsLock = hotkeys.createKeyLockState('CapsLock')

  return {
    get warning() {
      return capsLock.value ? 'Caps Lock is on' : ''
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<label x-data="passwordField">
  Password
  <input type="password" autocomplete="current-password" />
  <span role="status" x-text="warning"></span>
</label>
```

The status element stays in the page and only its text changes, so screen readers can announce the warning when it appears. A `null` value hides the warning, the same as `false`.

## Example: show Num Lock state on a numpad entry form

A form for typing numbers on the numpad can tell the user when Num Lock is off. Check for `null` separately here: on macOS the value is always `null`, and "Num Lock is off" would be wrong for a keyboard that has no Num Lock key.

```ts
Alpine.data('quantityForm', () => {
  const hotkeys = createHotkeysScope()
  const numLock = hotkeys.createKeyLockState('NumLock')

  return {
    get numLockOff() {
      return numLock.value === false
    },
    get numLockOn() {
      return numLock.value === true
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<form x-data="quantityForm">
  <label>
    Quantity
    <input inputmode="numeric" />
  </label>
  <p x-show="numLockOff">Num Lock is off. Turn it on to type numbers on the numpad.</p>
  <p x-show="numLockOn">Num Lock is on</p>
</form>
```

## Read lock state in an event handler

To check a lock once inside a key or mouse handler, call `event.getModifierState()`. It reads no reactive state, so nothing updates:

```ts
Alpine.data('passwordInput', () => ({
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      logSignInAttempt({ capsLock: event.getModifierState('CapsLock') })
    }
  },
}))
```

```html
<input x-data="passwordInput" type="password" @keydown="onKeydown($event)" />
```

`getModifierState()` returns what the browser reports, without the tracker's rules. Events dispatched by page code report every lock as off. On macOS, Num Lock and Scroll Lock values aren't lock state: Chrome reports them off, and Firefox reports Num Lock for numpad keys.

When the handler has no key or mouse event, such as a timer or a form's submit handler, read the shared tracker instead. `getKeyStateTracker().getKeyLockState('CapsLock')` returns the same `true`, `false`, or `null` as `createKeyLockState`.

## Test lock state

happy-dom ignores `modifierCapsLock` and the other lock fields in a `KeyboardEvent` init, and its `MouseEvent` has no `getModifierState`. The tracker also reads only trusted events. Before you dispatch a test event, define `isTrusted` and an own `getModifierState` on it:

```ts
import Alpine from 'alpinejs'
import { afterEach, expect, it } from 'vitest'
import {
  KeyStateTracker,
  createHotkeysScope,
  hotkeysPlugin,
} from '@tanstack/alpine-hotkeys'
import type { LockKey } from '@tanstack/alpine-hotkeys'

Alpine.plugin(hotkeysPlugin)

const scopes: Array<ReturnType<typeof createHotkeysScope>> = []

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.destroy())
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

it('reports Caps Lock from a trusted event', () => {
  const hotkeys = createHotkeysScope()
  scopes.push(hotkeys)
  const capsLock = hotkeys.createKeyLockState('CapsLock')
  expect(capsLock.value).toBe(null)

  document.dispatchEvent(
    withLocks(
      new KeyboardEvent('keydown', { key: 'A', code: 'KeyA', bubbles: true }),
      { CapsLock: true },
    ),
  )

  expect(capsLock.value).toBe(true)
})
```

Reset `KeyStateTracker` after each test so lock values don't carry over to the next one. A real browser doesn't let you redefine `isTrusted`, so this works only in a simulated DOM such as happy-dom. See [Testing](./testing) for the rest of the test setup.

See the [createKeyLockState example](../examples/createKeyLockState) for a Caps Lock warning on a password field and an indicator for each lock.
