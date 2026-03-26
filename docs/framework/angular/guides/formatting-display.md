---
title: Formatting & Display Guide
id: formatting-display
---

TanStack Hotkeys includes utilities for turning hotkey strings into display-friendly labels. These utilities are framework-agnostic, but they pair naturally with Angular templates and signals.

## `formatForDisplay`

```ts
import { formatForDisplay } from '@tanstack/angular-hotkeys'

formatForDisplay('Mod+S')
formatForDisplay('Mod+Shift+Z')
```

## `formatWithLabels`

```ts
import { formatWithLabels } from '@tanstack/angular-hotkeys'

formatWithLabels('Mod+S')
formatWithLabels('Mod+Shift+Z')
```

## Using Formatted Hotkeys in Angular

### Keyboard Shortcut Badges

```ts
import { Component, input } from '@angular/core'
import { formatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  selector: 'app-shortcut-badge',
  template: `<kbd class="shortcut-badge">{{ formatForDisplay(hotkey()) }}</kbd>`,
})
export class ShortcutBadgeComponent {
  readonly hotkey = input.required<string>()
  readonly formatForDisplay = formatForDisplay
}
```

### Menu Items with Hotkeys

```ts
import { Component, input } from '@angular/core'
import { formatForDisplay, injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  selector: 'app-menu-item',
  template: `
    <div class="menu-item">
      <span>{{ label() }}</span>
      <span class="menu-shortcut">{{ formatForDisplay(hotkey()) }}</span>
    </div>
  `,
})
export class MenuItemComponent {
  readonly label = input.required<string>()
  readonly hotkey = input.required<string>()
  readonly onAction = input.required<() => void>()
  readonly formatForDisplay = formatForDisplay

  constructor() {
    injectHotkey(() => this.hotkey(), () => this.onAction()())
  }
}
```

## Validation

```ts
import { validateHotkey } from '@tanstack/angular-hotkeys'

const result = validateHotkey('Alt+A')
```
