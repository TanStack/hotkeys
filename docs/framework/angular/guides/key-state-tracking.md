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

## Common patterns

### Hold-to-reveal UI

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

### Debugging key display

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

## Under the hood

All three APIs subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/angular-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```

## Modifier-held shortcut hints

`injectHotkeyHint` answers whether held modifiers are relevant to a binding. Keep formatting and badge styling in your component:

```ts
readonly visible = injectHotkeyHint(() => this.binding()) // signal: visible()
```

For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both reveals the hint. An extra Control hides it; releasing all modifiers or blurring the window hides it. Nonmodifier keys are ignored. AltGraph does not reveal hints. Pass `{ exact: true }` to require all binding modifiers, or `{ platform: 'mac' }` to resolve Mod explicitly. Supply the same platform used by the registration when overriding detection.

Combine the boolean with the action's enabled state. The helper does not register a shortcut or determine whether its target is focused. The core equivalent is `matchesHeldModifiers(binding, heldKeys, options)`.
