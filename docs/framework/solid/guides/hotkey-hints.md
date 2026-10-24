---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Solid
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Solid while the user holds a modifier, with createHotkeyHint.
---

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `createHotkeyHint` returns an accessor that's `true` while the user holds modifiers that belong to a hotkey that can fire. It's an optional helper, and it doesn't register anything, so use it alongside `createHotkey`.

## Show a hint next to a button

```tsx
import { Show } from 'solid-js'
import {
  createHotkey,
  createHotkeyHint,
  formatForDisplay,
} from '@tanstack/solid-hotkeys'

const saveHotkey = 'Mod+S'

function SaveButton() {
  createHotkey(saveHotkey, save)
  const showHint = createHotkeyHint(saveHotkey)

  return (
    <button onClick={save}>
      Save{' '}
      <Show when={showHint()}>
        <kbd>{formatForDisplay(saveHotkey)}</kbd>
      </Show>
    </button>
  )
}
```

While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./formatting-display) covers labels and keycaps.

## When a hint shows

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.
- The hotkey must be able to fire. A hint shows only while a registration of the hotkey is enabled and in an active [scope](./hotkeys-provider-and-scopes). A hotkey that nothing registers never shows a hint.
- Every registration of the hotkey counts, not only the one in your component. If two components register the same hotkey and only one is enabled, both show the hint.
- A hotkey bound to an element's `target` shows its hint only while focus is inside that element. A hotkey on `document` or `window` shows it wherever focus is.

To show a hint only while every modifier is held, pass `exact`:

```tsx
const showHint = createHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to `createHotkeyHint`, so `Mod` resolves the same way. The hotkey and the options can also be accessors.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```tsx
const showHint = createHotkeyHint(['Mod+K', 'Mod+C']) // true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./app-hotkeys) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small component keeps every button's hint the same:

```tsx
import { Show } from 'solid-js'
import {
  createHotkey,
  createHotkeyHint,
  formatForDisplay,
  useAppHotkeys,
} from '@tanstack/solid-hotkeys'
import type { AppHotkeyId } from '@tanstack/solid-hotkeys'

function Hint(props: { id: AppHotkeyId }) {
  const appHotkeys = useAppHotkeys()
  const appHotkey = () => appHotkeys()[props.id]
  const showHint = createHotkeyHint(appHotkey)

  return (
    <Show when={showHint() && appHotkey().hotkey}>
      {(hotkey) => <kbd>{formatForDisplay(hotkey())}</kbd>}
    </Show>
  )
}

function Toolbar() {
  const appHotkeys = useAppHotkeys()
  createHotkey(() => appHotkeys()['doc.save'], save)

  return (
    <button onClick={save}>
      Save <Hint id="doc.save" />
    </button>
  )
}
```

## Check held modifiers without the primitive

To check outside a component, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options, but it only looks at held keys. To also check that the hotkey can fire, call `hasActiveRegistration` on the hotkey manager:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/solid-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the primitive
```

[Held Key State Helpers](./held-key-state-helpers) covers the tracker and the other held-key primitives.

The [Kitchen Sink example](../examples/kitchen-sink) shows hints next to its navigation links and buttons while Alt or Option is held.
