---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Svelte
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Svelte while the user holds a modifier, with getHotkeyHint.
---

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `getHotkeyHint` returns an object whose `visible` getter is `true` while the user holds modifiers that belong to a hotkey. It's an optional helper, and it doesn't register anything, so use it alongside `createHotkey`.

## Show a hint next to a button

```svelte
<script lang="ts">
  import {
    createHotkey,
    formatForDisplay,
    getHotkeyHint,
  } from '@tanstack/svelte-hotkeys'

  const saveHotkey = 'Mod+S'

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

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.

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

Pass an [app hotkey](./app-hotkeys) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small component keeps every button's hint the same:

```svelte
<!-- Hint.svelte -->
<script lang="ts">
  import {
    formatForDisplay,
    getAppHotkeys,
    getHotkeyHint,
  } from '@tanstack/svelte-hotkeys'
  import type { AppHotkeyId } from '@tanstack/svelte-hotkeys'

  let { id }: { id: AppHotkeyId } = $props()
  const appHotkeys = getAppHotkeys()
  const appHotkey = $derived(appHotkeys.current[id])
  const hint = getHotkeyHint(() => appHotkey)
</script>

{#if hint.visible && appHotkey.hotkey}
  <kbd>{formatForDisplay(appHotkey.hotkey)}</kbd>
{/if}
```

```svelte
<button onclick={save}>Save <Hint id="doc.save" /></button>
```

## Hide hints for hotkeys that can't fire

`getHotkeyHint` only looks at held keys. It doesn't know whether the hotkey is enabled, its scope is active, or its target has focus. When a hotkey can be off, combine the hint with the same state:

```ts
createHotkey(saveHotkey, save, () => ({ enabled: isDirty }))
const hint = getHotkeyHint(saveHotkey)
const showHint = $derived(hint.visible && isDirty)
```

## Check held modifiers without the helper

To check outside a component, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options:

```ts
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/svelte-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held
```

[Held Key State Helpers](./held-key-state-helpers) covers the tracker and the other held-key functions.

The [Kitchen Sink example](../examples/kitchen-sink) shows hints next to its navigation links and buttons while Alt or Option is held.
