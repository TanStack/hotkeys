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

When `enabled` is false, the hotkey **stays registered** (visible in devtools); only the callback is suppressed.

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

## Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use `injectHotkeys` (plural):

```ts
import { Component } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class EditorComponent {
  constructor() {
    injectHotkeys([
      { hotkey: 'Mod+S', callback: () => this.save() },
      { hotkey: 'Mod+Z', callback: () => this.undo() },
      { hotkey: 'Escape', callback: () => this.close() },
    ])
  }
}
```

### Common Options with Per-Hotkey Overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```ts
injectHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => this.save() },
    { hotkey: 'Mod+Z', callback: () => this.undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

### Dynamic Hotkey Lists

Pass a getter for reactive arrays driven by Angular signals:

```ts
shortcuts = signal([...])

constructor() {
  injectHotkeys(
    () => this.shortcuts().map((s) => ({
      hotkey: s.key,
      callback: s.action,
    })),
  )
}
```

The function tracks signal dependencies and diffs registrations automatically.

## Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```ts
injectHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name` and `description` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
    group?: string
  }
}

injectHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

## Introspecting Registrations

Use the `injectHotkeyRegistrations` API to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```ts
import { Component } from '@angular/core'
import { injectHotkeyRegistrations } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <h2>Keyboard Shortcuts</h2>
    <ul>
      @for (reg of registrations().hotkeys; track reg.hotkey) {
        <li>
          <kbd>{{ reg.hotkey }}</kbd>
          @if (reg.meta?.name) {
            <span> — {{ reg.meta.name }}</span>
          }
          @if (reg.meta?.description) {
            <p>{{ reg.meta.description }}</p>
          }
        </li>
      }
    </ul>
    @if (registrations().sequences.length > 0) {
      <h2>Sequences</h2>
      <ul>
        @for (reg of registrations().sequences; track reg.sequence.join(' ')) {
          <li>
            <kbd>{{ reg.sequence.join(' → ') }}</kbd>
            @if (reg.meta?.name) {
              <span> — {{ reg.meta.name }}</span>
            }
          </li>
        }
      </ul>
    }
  `,
})
export class ShortcutPaletteComponent {
  readonly registrations = injectHotkeyRegistrations()
}
```

The returned signal provides an object with a `hotkeys` array containing registration objects with the hotkey string, options (including `meta`), and enabled state, and a `sequences` array containing sequence registrations with the same structure.

## The Hotkey Manager

You can access the underlying manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
