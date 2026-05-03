---
title: Formatting & Display Guide
id: formatting-display
---

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic and are re-exported from `@tanstack/ember-hotkeys`.

## `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/ember-hotkeys';

formatForDisplay('Mod+S');
// Mac: "⌘S"  |  Windows: "Ctrl+S"

formatForDisplay('Mod+Shift+Z');
// Mac: "⌘⇧Z"  |  Windows: "Ctrl+Shift+Z"
```

## `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/ember-hotkeys';

formatWithLabels('Mod+S');
formatWithLabels('Mod+Shift+Z');
```

## Using in Templates

### Keyboard Shortcut Badges

```gts
import { formatForDisplay } from '@tanstack/ember-hotkeys';
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

<template>
  {{onHotkey "Mod+S" @onSave}}
  <button type="button">
    Save <kbd>{{formatForDisplay "Mod+S"}}</kbd>
  </button>
</template>
```

### Menu Items with Hotkeys

```gts
import { formatForDisplay } from '@tanstack/ember-hotkeys';
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

<template>
  {{onHotkey @hotkey @onAction}}
  <div class="menu-item">
    <span>{{@label}}</span>
    <span class="menu-shortcut">{{formatForDisplay @hotkey}}</span>
  </div>
</template>
```

## Validation

```ts
import { validateHotkey } from '@tanstack/ember-hotkeys';

const result = validateHotkey('Alt+A');
```
