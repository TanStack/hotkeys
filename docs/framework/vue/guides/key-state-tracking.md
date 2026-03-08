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

## Common Patterns

### Hold-to-Reveal UI

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

### Debugging Key Display

```vue
<script setup lang="ts">
import {
  formatKeyForDebuggingDisplay,
  useHeldKeyCodes,
  useHeldKeys,
} from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
const heldCodes = useHeldKeyCodes()
</script>
```

## Under the Hood

All three composables subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/vue-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```
