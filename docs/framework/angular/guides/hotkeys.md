---
title: Hotkeys Guide
id: hotkeys
---

The `injectHotkey` API is the primary way to register keyboard shortcuts in Angular applications. It wraps the singleton `HotkeyManager` with injection-context lifecycle management and Angular signal-friendly reactive options.

## Chords and sequences

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both, and a one-step array such as `['Mod+S']` is the chord `'Mod+S'`.

```ts
injectHotkey('Mod+S', () => this.save()) // chord
injectHotkey(['G', 'G'], () => this.scrollToTop(), { timeout: 500 }) // sequence
injectHotkey('Escape', () => this.close(), { requireReset: true }) // chord-only option
```

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences, and TypeScript rejects options that don't match the hotkey. When the kind isn't known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted. Defaults apply only to the kinds that support them. See the [Sequences Guide](./sequences) for timing and matching, and the [App Hotkeys Guide](./app-hotkeys) to declare hotkeys up front and let users customize them.

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

## Property getters

Property getters and functions returning an options object are both supported. Read reactive state inside the getter. A plain value such as `{ enabled: currentValue }` captures the value when that object is created.

The adapter reads option properties inside its reactive computation and updates registrations automatically. Callbacks such as `onRecord` and `onCancel` remain functions; the adapter does not call them to resolve options. Tracking is shallow; callback bodies and nested objects are not evaluated to discover dependencies. Keep getters free of side effects. Ordinary option changes preserve registration identity. Changing the target moves the registration to that target.

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ selector: 'save-shortcut', template: '' })
export class SaveShortcut {
	enabled = signal(true)

	constructor() {
		const component = this
		injectHotkey('Mod+S', () => console.log('Save'), {
			get enabled() {
				return component.enabled()
			},
		})
	}
}
```

You can also pass `() => ({ enabled: this.enabled() })` from the component. Signals read by option getters update registrations when Angular runs the effect. Use the same forms for common options, per-definition options, sequences, and recorders. Getter properties in provided defaults are tracked too.

## Default options

`injectHotkey` uses the same core defaults as the framework-agnostic manager:

```ts
injectHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: 'auto',
  target: document,
  platform: undefined,
  conflictBehavior: 'warn',
})
```

## Reactive options

For reactive state, pass an options object with property getters or a function returning options.

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

When `ignoreInputs` is enabled, hotkeys also skip keys that a focused control inside their `target` uses itself: `Enter` and `Space` on buttons and `<summary>`, `Enter` on links, and navigation keys in ARIA widgets such as menus, listboxes, tabs, and grids. A hotkey targeted at the control itself still receives them, and `ignoreInputs: false` handles every key. See [Focused controls keep their own keys](../../../guides/sensible-defaults.md#focused-controls-keep-their-own-keys) for the full list.

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

Use the `injectHotkeyRegistrations` function to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```ts
import { Component } from '@angular/core'
import { injectHotkeyRegistrations, formatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-palette',
  template: `
    <ul>
      @for (reg of registrations(); track reg.id) {
        <li>
          <kbd>{{ format(reg.hotkey) }}</kbd>
          @if (reg.options.meta?.name) {
            <span> — {{ reg.options.meta?.name }}</span>
          }
          @if (reg.kind === 'sequence') {
            <small>{{ reg.matchedStepCount }}/{{ reg.hotkey.length }} steps</small>
          }
        </li>
      }
    </ul>
  `,
})
export class ShortcutPaletteComponent {
  readonly format = formatForDisplay
  readonly registrations = injectHotkeyRegistrations()
}
```

The returned signal holds one array of registration views. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./app-hotkeys).

## The hotkey manager

You can access the underlying manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
