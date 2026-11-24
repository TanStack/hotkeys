---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Svelte
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Svelte while the user holds a modifier, with getHotkeyHint.
---

Some apps hide shortcut badges until the user holds a modifier key, which keeps buttons clean while still making shortcuts discoverable on demand.

`getHotkeyHint` reports whether the user holds modifiers that belong to a hotkey that can fire. It's an optional display helper and doesn't register a shortcut itself, so pair it with `createHotkey`.

## Show a hint next to a button

```svelte
<script lang="ts">
  import {
    createHotkey,
    getFormatForDisplay,
    getHotkeyHint,
  } from '@tanstack/svelte-hotkeys'

  const saveHotkey = 'Mod+S'

  const formatForDisplay = getFormatForDisplay()
  createHotkey(saveHotkey, save)
  const hint = getHotkeyHint(saveHotkey)
</script>

<button onclick={save}>
  Save
  {#if hint.visible}<kbd>{formatForDisplay(saveHotkey)}</kbd>{/if}
</button>
```

While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./formatting-display) covers labels and keycaps.

## When a hint shows

- **Any matching modifier shows the hint.** For `Alt+Shift+[KeyK]`, holding `Alt`, `Shift`, or both shows it.
- **Extra modifiers hide it.** Holding `Control` and `Alt` shows only the hints for hotkeys that use both.
- **Releases and blur hide it.** Releasing every modifier, or the window losing focus, hides the hint.
- **Other keys are ignored.** `AltGr` never shows hints, because it types characters.
- **Modifier-only requirement.** Hotkeys without modifiers, such as `Escape` or `G`, never show a hint.
- **Only active registrations count.** The hotkey needs at least one enabled registration in an active [scope](./hotkeys-provider-and-scopes). Every mounted registration counts, so if two components register `Mod+S` and one is enabled, both hints appear.
- **Targets follow focus.** An element-targeted hotkey shows its hint only while focus is inside that element. `document` and `window` hotkeys show wherever focus is.

To show a hint only while every modifier is held, pass `exact`:

```ts
const hint = getHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to `getHotkeyHint`, so `Mod` resolves the same way. The hotkey and the options can also be getters.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```ts
const hint = getHotkeyHint(['Mod+K', 'Mod+C']) // hint.visible is true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./app-hotkeys) directly so hints stay in sync when users rebind shortcuts. An app hotkey with no hotkey assigned shows no hint. A small shared component keeps every button's hint consistent:

```svelte
<!-- Hint.svelte -->
<script lang="ts">
  import {
    getAppHotkeys,
    getFormatForDisplay,
    getHotkeyHint,
  } from '@tanstack/svelte-hotkeys'
  import type { AppHotkeyId } from '@tanstack/svelte-hotkeys'

  let { id }: { id: AppHotkeyId } = $props()
  const formatForDisplay = getFormatForDisplay()
  const appHotkeys = getAppHotkeys()
  const appHotkey = $derived(appHotkeys.current[id])
  const hint = getHotkeyHint(() => appHotkey)
</script>

{#if hint.visible && appHotkey.hotkey}
  <kbd>{formatForDisplay(appHotkey.hotkey)}</kbd>
{/if}
```

```svelte
<script lang="ts">
  import { createHotkey, getAppHotkeys } from '@tanstack/svelte-hotkeys'
  import Hint from './Hint.svelte'

  const appHotkeys = getAppHotkeys()
  createHotkey(() => appHotkeys.current['doc.save'], save)
</script>

<button onclick={save}>Save <Hint id="doc.save" /></button>
```

## Check held modifiers without the helper

Outside components, such as in a canvas draw loop, combine `matchesHeldModifiers` with `getKeyStateTracker()` and `getHotkeyManager().hasActiveRegistration()`:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/svelte-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the helper
```

See [Held Keys](./held-key-state-helpers) for more on `getKeyStateTracker`, and the [Kitchen Sink example](../examples/kitchen-sink) for hints on live navigation links and buttons.
