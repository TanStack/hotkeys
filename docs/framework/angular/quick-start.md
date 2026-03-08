---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](../../installation) page for instructions.

## Your First Hotkey

The `injectHotkey` API is the primary way to register keyboard shortcuts in Angular:

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`,
})
export class AppComponent {
  constructor() {
    injectHotkey('Mod+S', () => {
      saveDocument()
    })
  }
}
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

## Common Patterns

### Multiple Hotkeys

```ts
constructor() {
  injectHotkey('Mod+S', () => save())
  injectHotkey('Mod+Z', () => undo())
  injectHotkey('Mod+Shift+Z', () => redo())
  injectHotkey('Mod+F', () => openSearch())
  injectHotkey('Escape', () => closeDialog())
}
```

### Scoped Hotkeys with `viewChild`

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <div #panel tabindex="0">
      <p>Press Escape while focused here to close</p>
    </div>
  `,
})
export class PanelComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    injectHotkey('Escape', () => closePanel(), () => ({
      target: this.panel()?.nativeElement ?? null,
    }))
  }
}
```

### Conditional Hotkeys

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class ModalComponent {
  readonly isOpen = signal(true)

  constructor() {
    injectHotkey('Escape', () => this.isOpen.set(false), () => ({
      enabled: this.isOpen(),
    }))
  }
}
```

### Multi-Key Sequences

```ts
import { injectHotkeySequence } from '@tanstack/angular-hotkeys'

constructor() {
  injectHotkeySequence(['G', 'G'], () => scrollToTop())
  injectHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
}
```

### Tracking Held Keys

```ts
import { Component } from '@angular/core'
import { injectHeldKeys, injectKeyHold } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <div class="status-bar">
      @if (isShiftHeld()) {
        <span>Shift mode active</span>
      }
      @if (heldKeys().length > 0) {
        <span>Keys: {{ heldKeys().join('+') }}</span>
      }
    </div>
  `,
})
export class StatusBarComponent {
  readonly heldKeys = injectHeldKeys()
  readonly isShiftHeld = injectKeyHold('Shift')
}
```

### Displaying Hotkeys in the UI

```ts
import { Component } from '@angular/core'
import { formatForDisplay, injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `<button>Save <kbd>{{ saveLabel }}</kbd></button>`,
})
export class SaveButtonComponent {
  readonly saveLabel = formatForDisplay('Mod+S')

  constructor() {
    injectHotkey('Mod+S', () => save())
  }
}
```

## Default Options Provider

Use `provideHotkeys` to configure default options for your Angular app:

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkey: { preventDefault: true },
      hotkeySequence: { timeout: 1500 },
      hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
    }),
  ],
}
```

## Next Steps

- [Hotkeys Guide](./guides/hotkeys)
- [Sequences Guide](./guides/sequences)
- [Hotkey Recording Guide](./guides/hotkey-recording)
- [Key State Tracking Guide](./guides/key-state-tracking)
- [Formatting & Display Guide](./guides/formatting-display)
