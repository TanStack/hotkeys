---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Preact
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Preact while the user holds a modifier, with useHotkeyHint.
---

Some apps hide shortcut badges until the user holds a modifier key, keeping buttons clean while still making shortcuts discoverable on demand.

`useHotkeyHint` returns `true` while the user holds modifiers belonging to an active hotkey. It's an optional display helper and doesn't register a shortcut itself, so pair it with `useHotkey`.

## Show a hint next to a button

```tsx
import {
  useFormatForDisplay,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/preact-hotkeys'

const saveHotkey = 'Mod+S'

function SaveButton() {
  const formatForDisplay = useFormatForDisplay()
  useHotkey(saveHotkey, save)
  const showHint = useHotkeyHint(saveHotkey)

  return (
    <button onClick={save}>
      Save {showHint && <kbd>{formatForDisplay(saveHotkey)}</kbd>}
    </button>
  )
}
```

Holding `Command` on macOS or `Control` elsewhere reveals `Save ⌘ S` or `Save Ctrl+S`. See [Formatting & Display](./formatting-display) for formatting options.

## When a hint shows

- **Any matching modifier shows the hint.** For `Alt+Shift+[KeyK]`, holding `Alt`, `Shift`, or both shows it. Pass `{ exact: true }` to require every modifier instead:

```tsx
const showHint = useHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Requires Alt AND Shift
```

- **Extra modifiers hide it.** Holding `Control` + `Alt` shows hints only for shortcuts using both.
- **Releases and blur hide it.** Releasing all modifiers or leaving the window hides hints cleanly.
- **Non-modifier and `AltGr` keys.** Other held keys are ignored, and `AltGr` never triggers hints since it types characters.
- **Modifier-only requirement.** Unmodified shortcuts such as `Escape` or `G` never show hints.
- **Only active registrations count.** The hotkey must have at least one enabled registration in an active [scope](./hotkeys-provider-and-scopes). This checks across all mounted registrations, so if two components register `Mod+S` and one is enabled, both hints appear.
- **Targets follow focus.** An element-targeted hotkey shows its hint only while focus is inside that element. `document` and `window` hotkeys show regardless of focus.
- **Custom platforms.** If the hotkey overrides `platform`, pass the same `platform` to `useHotkeyHint`.

## Hints for sequences

Sequences reveal their hint while the user holds the modifiers of their first step:

```tsx
const showHint = useHotkeyHint(['Mod+K', 'Mod+C']) // true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./app-hotkeys) directly so hints stay synchronized even when users rebind shortcuts. Unassigned app hotkeys never show a hint. A small shared `<Hint>` component keeps buttons tidy:

```tsx
import {
  useAppHotkeys,
  useFormatForDisplay,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/preact-hotkeys'
import type { AppHotkeyId } from '@tanstack/preact-hotkeys'

function Hint({ id }: { id: AppHotkeyId }) {
  const formatForDisplay = useFormatForDisplay()
  const appHotkey = useAppHotkeys()[id]
  const showHint = useHotkeyHint(appHotkey)

  return showHint && appHotkey.hotkey ? (
    <kbd>{formatForDisplay(appHotkey.hotkey)}</kbd>
  ) : null
}

function Toolbar() {
  useHotkey(useAppHotkeys()['doc.save'], save)

  return (
    <button onClick={save}>
      Save <Hint id="doc.save" />
    </button>
  )
}
```

## Check held modifiers without the hook

Outside Preact components, such as canvas draw loops, combine `matchesHeldModifiers` with `getKeyStateTracker()` and `getHotkeyManager().hasActiveRegistration()`:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/preact-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as useHotkeyHint
```

See [Held Keys](./held-key-state-helpers) for the tracker and the other held-key hooks, and the [Kitchen Sink example](../examples/kitchen-sink) for hints on live buttons.
