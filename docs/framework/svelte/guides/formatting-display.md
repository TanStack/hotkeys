---
title: Formatting & Display Guide
id: formatting-display
---

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic, but they pair naturally with Svelte templates and reactive UI.

## `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/svelte-hotkeys'

formatForDisplay('Mod+S')
formatForDisplay('Mod+Shift+Z')
```

## `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/svelte-hotkeys'

formatWithLabels('Mod+S')
formatWithLabels('Mod+Shift+Z')
```

## `formatKeyForDebuggingDisplay`

```ts
import { formatKeyForDebuggingDisplay } from '@tanstack/svelte-hotkeys'

formatKeyForDebuggingDisplay('Meta')
formatKeyForDebuggingDisplay('Shift')
```

## Using Formatted Hotkeys in Svelte

### Keyboard Shortcut Badges

```svelte
<script lang="ts">
  import { formatForDisplay } from '@tanstack/svelte-hotkeys'
</script>

<kbd class="shortcut-badge">{formatForDisplay(hotkey)}</kbd>
```

### Menu Items with Hotkeys

```svelte
<script lang="ts">
  import { formatForDisplay, createHotkey } from '@tanstack/svelte-hotkeys'

  let { label, hotkey, onAction } = $props()

  createHotkey(hotkey, () => onAction())
</script>

<div class="menu-item">
  <span>{label}</span>
  <span class="menu-shortcut">{formatForDisplay(hotkey)}</span>
</div>
```

## Validation

```ts
import { validateHotkey } from '@tanstack/svelte-hotkeys'

const result = validateHotkey('Alt+A')
```
