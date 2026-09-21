---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides three Vue composables for tracking live keyboard state: `useHeldKeys`, `useHeldKeyCodes`, and `useKeyHold`.

## `useHeldKeys`

```vue
<script setup lang="ts">
import { useHeldKeys } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
</script>

<template>
  <div>{{ heldKeys.length > 0 ? heldKeys.join(' + ') : 'No keys held' }}</div>
</template>
```

## `useHeldKeyCodes`

```vue
<script setup lang="ts">
import { useHeldKeyCodes } from '@tanstack/vue-hotkeys'

const heldCodes = useHeldKeyCodes()
</script>
```

## `useKeyHold`

```vue
<script setup lang="ts">
import { useKeyHold } from '@tanstack/vue-hotkeys'

const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <span :class="{ active: isShiftHeld }">Shift</span>
</template>
```

## Common patterns

### Hold-to-reveal UI

```vue
<script setup lang="ts">
import { useKeyHold } from '@tanstack/vue-hotkeys'

const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <button v-if="isShiftHeld">Permanently Delete</button>
  <button v-else>Move to Trash</button>
</template>
```

### Debugging key display

```vue
<script setup lang="ts">
import {
  formatForDisplay,
  useHeldKeyCodes,
  useHeldKeys,
} from '@tanstack/vue-hotkeys'
import type { RegisterableHotkey } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
const heldCodes = useHeldKeyCodes()
</script>

<template>
  <div v-for="key in heldKeys" :key="key">
    <strong>{{
      formatForDisplay(key as RegisterableHotkey, { useSymbols: true })
    }}</strong>
    <span>{{ heldCodes[key] }}</span>
  </div>
</template>
```

## Under the hood

All three composables subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/vue-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```

## Modifier-held shortcut hints

`useHotkeyHint` answers whether held modifiers are relevant to a binding. Keep formatting and badge styling in your component:

```ts
const visible = useHotkeyHint(() => binding.value) // computed ref: visible.value
```

For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both reveals the hint. An extra Control hides it; releasing all modifiers or blurring the window hides it. Nonmodifier keys are ignored. AltGraph does not reveal hints. Pass `{ exact: true }` to require all binding modifiers, or `{ platform: 'mac' }` to resolve Mod explicitly. Supply the same platform used by the registration when overriding detection.

Combine the boolean with the action's enabled state. The helper does not register a shortcut or determine whether its target is focused. The core equivalent is `matchesHeldModifiers(binding, heldKeys, options)`.
