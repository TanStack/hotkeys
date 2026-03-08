---
title: Formatting & Display Guide
id: formatting-display
---

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic, but they pair naturally with Vue templates and computed UI.

## `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/vue-hotkeys'

formatForDisplay('Mod+S')
formatForDisplay('Mod+Shift+Z')
```

## `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/vue-hotkeys'

formatWithLabels('Mod+S')
formatWithLabels('Mod+Shift+Z')
```

## `formatKeyForDebuggingDisplay`

```ts
import { formatKeyForDebuggingDisplay } from '@tanstack/vue-hotkeys'

formatKeyForDebuggingDisplay('Meta')
formatKeyForDebuggingDisplay('Shift')
```

## Using Formatted Hotkeys in Vue

### Keyboard Shortcut Badges

```vue
<script setup lang="ts">
import { formatForDisplay } from '@tanstack/vue-hotkeys'

defineProps<{ hotkey: string }>()
</script>

<template>
  <kbd class="shortcut-badge">{{ formatForDisplay(hotkey) }}</kbd>
</template>
```

### Menu Items with Hotkeys

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'

const props = defineProps<{
  label: string
  hotkey: string
  onAction: () => void
}>()

useHotkey(() => props.hotkey, () => props.onAction())
</script>

<template>
  <div class="menu-item">
    <span>{{ label }}</span>
    <span class="menu-shortcut">{{ formatForDisplay(hotkey) }}</span>
  </div>
</template>
```

## Validation

```ts
import { validateHotkey } from '@tanstack/vue-hotkeys'

const result = validateHotkey('Alt+A')
```
