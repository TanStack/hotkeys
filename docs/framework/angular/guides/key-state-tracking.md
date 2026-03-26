---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides three Angular APIs for tracking live keyboard state: `injectHeldKeys`, `injectHeldKeyCodes`, and `injectKeyHold`.

## `injectHeldKeys`

```ts
import { Component } from '@angular/core'
import { injectHeldKeys } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <div>
      {{ heldKeys().length > 0 ? heldKeys().join(' + ') : 'No keys held' }}
    </div>
  `,
})
export class KeyDisplayComponent {
  readonly heldKeys = injectHeldKeys()
}
```

## `injectHeldKeyCodes`

```ts
import { injectHeldKeyCodes } from '@tanstack/angular-hotkeys'

readonly heldCodes = injectHeldKeyCodes()
```

## `injectKeyHold`

```ts
import { injectKeyHold } from '@tanstack/angular-hotkeys'

readonly isShiftHeld = injectKeyHold('Shift')
```

## Common Patterns

### Hold-to-Reveal UI

```ts
import { Component } from '@angular/core'
import { injectKeyHold } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    @if (isShiftHeld()) {
      <button>Permanently Delete</button>
    } @else {
      <button>Move to Trash</button>
    }
  `,
})
export class FileActionsComponent {
  readonly isShiftHeld = injectKeyHold('Shift')
}
```

### Debugging Key Display

```ts
import { Component } from '@angular/core'
import {
  formatForDisplay,
  injectHeldKeyCodes,
  injectHeldKeys,
  type RegisterableHotkey,
} from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class KeyDebuggerComponent {
  readonly heldKeys = injectHeldKeys()
  readonly heldCodes = injectHeldKeyCodes()
  readonly formatKey = (k: string) =>
    formatForDisplay(k as RegisterableHotkey, { useSymbols: true })
}
```

## Under the Hood

All three APIs subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/angular-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```
