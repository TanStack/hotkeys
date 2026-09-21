---
title: Hotkeys Guide
id: hotkeys
---

The `injectHotkey` API is the primary way to register keyboard shortcuts in Angular applications. It wraps the singleton `HotkeyManager` with injection-context lifecycle management and Angular signal-friendly reactive options.

## Logical keys and physical positions

Use a logical binding when the shortcut should follow the character on the active layout. Use a physical binding when it should follow a keyboard position:

| Binding | Identity checked |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | Logical `event.key`, with conservative code fallback |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | Exact `event.code` |
| `Enter` | Logical Enter, including numpad Enter |
| `[Enter]` / `[NumpadEnter]` | Separate physical Enter positions |

Every physical code uses brackets in strings, including names shared with logical keys such as `[Enter]` and `[F13]`. Supported codes are type-safe and available in autocomplete. Do not put a bracketed code in an object's `key` field; use `code`. A binding has either `key` or `code`, never both.

On a layout where the `KeyQ` position produces `a`, `A` follows that character and `[KeyQ]` follows the position. Logical ASCII letters remain layout-aware; conservative physical fallback helps with transformed output such as macOS Option keys. Exact matches take priority over weaker fallbacks among eligible registrations on the same target.

Callbacks expose the same distinction in `context.parsedHotkey`: check `parsed.code !== undefined` before reading its physical identity. Use `formatForDisplay` for labels; stored physical strings retain their brackets.

## Basic usage

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

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.

## Default options

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

## Reactive options

For reactive state, pass an accessor function as the third argument.

### `enabled`

When `enabled` is false, the hotkey stays registered (visible in devtools); only the callback is suppressed.

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

## Global defaults via provider

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

## Common options

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

## Automatic cleanup

Registrations are cleaned up automatically when the owning injection context is destroyed.

## Registering multiple hotkeys

When you need to register several hotkeys at once, or a dynamic list of variable length, use `injectHotkeys` (plural):

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

### Common options with per-hotkey overrides

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

### Dynamic hotkey lists

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

## Metadata (name, description, and group)

Every hotkey registration can carry a `meta` object with a `name`, `description`, and `group`. Metadata never affects hotkey behavior, but it flows through to registrations and devtools, so you can build shortcut palettes and help screens from it.

```ts
injectHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name`, `description`, and `group` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}

injectHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

Group is descriptive metadata, not an execution scope. A shortcuts panel can group live registration views directly. Disabled registrations remain listed; unmounted registrations disappear.

## Introspecting registrations

Use the `injectHotkeyRegistrations` API to get a live view of all hotkey and sequence registrations. Use it to build shortcut palettes, help dialogs, or devtools.

```ts
import { Component } from '@angular/core'
import { injectHotkeyRegistrations, formatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <h2>Keyboard Shortcuts</h2>
    <ul>
      @for (reg of registrations().hotkeys; track reg.id) {
        <li>
          <kbd>{{ formatForDisplay(reg.hotkey) }}</kbd>
          @if (reg.options.meta?.name) {
            <span> — {{ reg.options.meta.name }}</span>
          }
          @if (reg.options.meta?.description) {
            <p>{{ reg.options.meta.description }}</p>
          }
        </li>
      }
    </ul>
    @if (registrations().sequences.length > 0) {
      <h2>Sequences</h2>
      <ul>
        @for (reg of registrations().sequences; track reg.id) {
          <li>
            <kbd>{{ displaySequence(reg.sequence) }}</kbd>
            @if (reg.options.meta?.name) {
              <span> — {{ reg.options.meta.name }}</span>
            }
          </li>
        }
      </ul>
    }
  `,
})
export class ShortcutPaletteComponent {
  readonly formatForDisplay = formatForDisplay
  readonly displaySequence = (sequence: ReadonlyArray<Parameters<typeof formatForDisplay>[0]>) =>
    sequence.map((step) => formatForDisplay(step)).join(' → ')
  readonly registrations = injectHotkeyRegistrations()
}
```

The returned signal holds an object with two arrays. `hotkeys` contains registration objects with the hotkey string, options (including `meta`), and enabled state. `sequences` contains sequence registrations with the same structure.

## The hotkey manager

You can access the underlying manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
