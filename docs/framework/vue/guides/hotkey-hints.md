---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Vue
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Vue while the user holds a modifier, with useHotkeyHint.
---

Some apps hide shortcut badges until the user holds a modifier key, which keeps buttons clean while still making shortcuts discoverable on demand.

`useHotkeyHint` reports whether the user holds modifiers that belong to a hotkey that can fire. It's an optional display helper and doesn't register a shortcut itself, so pair it with `useHotkey`.

## Show a hint next to a button

```vue
<script setup lang="ts">
import {
  useFormatForDisplay,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/vue-hotkeys'

const saveHotkey = 'Mod+S'

const formatForDisplay = useFormatForDisplay()
useHotkey(saveHotkey, save)
const showHint = useHotkeyHint(saveHotkey)
</script>

<template>
  <button @click="save">
    Save <kbd v-if="showHint">{{ formatForDisplay(saveHotkey) }}</kbd>
  </button>
</template>
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
const showHint = useHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to `useHotkeyHint`, so `Mod` resolves the same way. The hotkey and the options can also be refs or getters.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```ts
const showHint = useHotkeyHint(['Mod+K', 'Mod+C']) // true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./app-hotkeys) directly so hints stay in sync when users rebind shortcuts. An app hotkey with no hotkey assigned shows no hint. A small shared component keeps every button's hint consistent:

```vue
<!-- Hint.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import {
  useAppHotkeys,
  useFormatForDisplay,
  useHotkeyHint,
} from '@tanstack/vue-hotkeys'
import type { AppHotkeyId } from '@tanstack/vue-hotkeys'

const props = defineProps<{ id: AppHotkeyId }>()
const formatForDisplay = useFormatForDisplay()
const appHotkeys = useAppHotkeys()
const appHotkey = computed(() => appHotkeys.value[props.id])
const showHint = useHotkeyHint(appHotkey)
</script>

<template>
  <kbd v-if="showHint && appHotkey.hotkey">
    {{ formatForDisplay(appHotkey.hotkey) }}
  </kbd>
</template>
```

```vue
<script setup lang="ts">
import { useAppHotkeys, useHotkey } from '@tanstack/vue-hotkeys'
import Hint from './Hint.vue'

const appHotkeys = useAppHotkeys()
useHotkey(() => appHotkeys.value['doc.save'], save)
</script>

<template>
  <button @click="save">Save <Hint id="doc.save" /></button>
</template>
```

## Check held modifiers without the composable

Outside components, such as in a canvas draw loop, combine `matchesHeldModifiers` with `getKeyStateTracker()` and `getHotkeyManager().hasActiveRegistration()`:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/vue-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the composable
```

See [Held Keys](./held-key-state-helpers) for more on `getKeyStateTracker`, and the [Kitchen Sink example](../examples/kitchen-sink) for hints on live navigation links and buttons.
