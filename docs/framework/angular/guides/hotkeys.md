---
title: Hotkeys Guide
id: hotkeys
---

The `injectHotkey` API is the primary way to register keyboard shortcuts in Angular applications. It wraps the singleton `HotkeyManager` with injection-context lifecycle management and Angular signal-friendly reactive options.

## Basic Usage

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class AppComponent {
  constructor() {
    injectHotkey('Mod+S', () => {
      saveDocument()
    })
  }
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
injectHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
})
```

## Default Options

`injectHotkey` uses the same core defaults as the framework-agnostic manager:

```ts
injectHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined,
  target: document,
  platform: undefined,
  conflictBehavior: 'warn',
})
```

## Reactive Options

For reactive state, pass an accessor function as the third argument.

### `enabled`

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class EditorComponent {
  readonly isEditing = signal(false)

  constructor() {
    injectHotkey('Mod+S', () => save(), () => ({
      enabled: this.isEditing(),
    }))
  }
}
```

### `target`

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `<div #panel tabindex="0">Panel content</div>`,
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

## Global Default Options via Provider

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkey: { preventDefault: false, ignoreInputs: false },
    }),
  ],
}
```

## Common Options

### `requireReset`

```ts
injectHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

```ts
injectHotkey('K', () => openSearch())
injectHotkey('Enter', () => submit(), { ignoreInputs: false })
```

### `conflictBehavior`

```ts
injectHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

```ts
injectHotkey('Mod+S', () => save(), { platform: 'mac' })
```

## Automatic Cleanup

Registrations are cleaned up automatically when the owning injection context is destroyed.

## The Hotkey Manager

You can access the underlying manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
