---
title: Read Lock Key State in Solid
id: key-lock-state
description: Show whether Caps Lock, Num Lock, or Scroll Lock is on in Solid, handle the unknown state, and test UI that depends on it.
---

`createKeyLockState` reports whether a lock key is on. Use it for a Caps Lock warning on a password field, or a Num Lock hint on a form that takes numpad input.

## Read a lock's state

`createKeyLockState(key)` takes `'CapsLock'`, `'NumLock'`, or `'ScrollLock'` and returns an accessor. Call it to read one of these values:

- `true` when the lock is on.
- `false` when the lock is off.
- `null` when the browser hasn't reported the lock.

```tsx
import { Show } from 'solid-js'
import { createKeyLockState } from '@tanstack/solid-hotkeys'

function CapsLockBadge() {
  const capsLock = createKeyLockState('CapsLock')

  return (
    <Show when={capsLock() !== null}>
      <span>Caps Lock {capsLock() ? 'on' : 'off'}</span>
    </Show>
  )
}
```

The accessor notifies its readers only when the lock's value changes. To track a key that changes, pass an accessor, such as `createKeyLockState(() => props.lock)`.

Lock keys toggle instead of being held. `createKeyHold('CapsLock')` answers a different question: its accessor returns `true` only while the key is physically down, and goes back to `false` when the user lets go, even though Caps Lock stays on. On macOS, Chrome and Safari send a keydown when Caps Lock turns on and a keyup when it turns off, so there `createKeyHold('CapsLock')` can look like lock state. Don't rely on that. Use `createKeyLockState` to read whether a lock is on. For keys the user holds, see [Track held keys and modifier state](./held-key-state-helpers).

## Why the value starts as `null`

Browsers have no API that reports lock state when the page loads. The state comes only with input events, through `event.getModifierState()`. The key state tracker reads it from keydown, keyup, mousedown, and mousemove events, so every lock is `null` until the user presses a key, clicks, or moves the mouse over the focused page. From then on, the value follows the user's input.

The tracker reads only trusted events, the ones the browser creates from real input. It ignores events dispatched by page code, such as `element.dispatchEvent(new KeyboardEvent('keydown'))`, because those report every lock as off.

Treat `null` as unknown, not as off. For a warning, show nothing until the value is `true`. The first key press in the field reports Caps Lock, so the warning appears as the user starts typing.

Num Lock and Scroll Lock stay `null` on macOS and iOS. See [Browser and platform support](#browser-and-platform-support).

## Why it resets when the window loses focus

Every lock goes back to `null` when the window loses focus or the page is hidden, such as when the user switches to another tab or app. The user can toggle a lock in another app, so the last value the page saw may no longer be true. Once the window has focus again, the next key press, click, or mouse move over the page reports the lock again. The tracker ignores mouse events while the window doesn't have focus.

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

```tsx
import { createKeyLockState } from '@tanstack/solid-hotkeys'

export function PasswordField() {
  const capsLock = createKeyLockState('CapsLock')

  return (
    <label>
      Password
      <input type="password" autocomplete="current-password" />
      <span role="status">{capsLock() ? 'Caps Lock is on' : ''}</span>
    </label>
  )
}
```

The status element stays in the page and only its text changes, so screen readers can announce the warning when it appears. A `null` value hides the warning, the same as `false`.

## Example: show Num Lock state on a numpad entry form

A form for typing numbers on the numpad can tell the user when Num Lock is off. Check for `null` separately here: on macOS the value is always `null`, and "Num Lock is off" would be wrong for a keyboard that has no Num Lock key.

```tsx
import { Show } from 'solid-js'
import { createKeyLockState } from '@tanstack/solid-hotkeys'

function QuantityForm() {
  const numLock = createKeyLockState('NumLock')

  return (
    <form>
      <label>
        Quantity
        <input inputmode="numeric" />
      </label>
      <Show when={numLock() === false}>
        <p>Num Lock is off. Turn it on to type numbers on the numpad.</p>
      </Show>
      <Show when={numLock() === true}>
        <p>Num Lock is on</p>
      </Show>
    </form>
  )
}
```

## Read lock state in an event handler

To check a lock once inside a key or mouse handler, call `event.getModifierState()`. It reads no signal, so nothing updates:

```tsx
function PasswordInput() {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      logSignInAttempt({ capsLock: event.getModifierState('CapsLock') })
    }
  }

  return <input type="password" onKeyDown={onKeyDown} />
}
```

`getModifierState()` returns what the browser reports, without the tracker's rules. Events dispatched by page code report every lock as off. On macOS, Num Lock and Scroll Lock values aren't lock state: Chrome reports them off, and Firefox reports Num Lock for numpad keys.

When the handler has no key or mouse event, such as a timer or a form's submit handler, read the shared tracker instead. `getKeyStateTracker().getKeyLockState('CapsLock')` returns the same `true`, `false`, or `null` as `createKeyLockState`.

## Test lock state

happy-dom ignores `modifierCapsLock` and the other lock fields in a `KeyboardEvent` init, and its `MouseEvent` has no `getModifierState`. The tracker also reads only trusted events. Before you dispatch a test event, define `isTrusted` and an own `getModifierState` on it:

```tsx
import { afterEach, expect, it } from 'vitest'
import { flush } from 'solid-js'
import { cleanup, render } from '@solidjs/testing-library'
import { KeyStateTracker } from '@tanstack/solid-hotkeys'
import type { LockKey } from '@tanstack/solid-hotkeys'
import { PasswordField } from './PasswordField'

afterEach(() => {
  cleanup()
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

it('warns when Caps Lock is on', () => {
  const view = render(() => <PasswordField />)

  document.dispatchEvent(
    withLocks(
      new KeyboardEvent('keydown', { key: 'A', code: 'KeyA', bubbles: true }),
      { CapsLock: true },
    ),
  )
  flush()

  expect(view.getByRole('status').textContent).toBe('Caps Lock is on')
})
```

Reset `KeyStateTracker` after each test so lock values don't carry over to the next one. A real browser doesn't let you redefine `isTrusted`, so this works only in a simulated DOM such as happy-dom. See [Testing](./testing) for the rest of the test setup.

See the [createKeyLockState example](../examples/createKeyLockState) for a Caps Lock warning on a password field and an indicator for each lock.
