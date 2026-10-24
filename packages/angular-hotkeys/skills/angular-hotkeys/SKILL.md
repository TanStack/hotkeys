---
name: angular-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in an Angular app with
  @tanstack/angular-hotkeys: injectHotkey and injectHotkeys in an injection
  context, signal-driven options, viewChild targets, provideHotkeys defaults
  and component scopes, app hotkey injectors, recorders, held-key and hint
  injectors, or replacing @HostListener keydown handlers.
metadata:
  purpose: >-
    Angular bindings for TanStack Hotkeys: inject functions, signal-driven
    options, provideHotkeys scopes, and the Angular-specific mistakes to avoid.
  type: framework
  framework: angular
  library: '@tanstack/angular-hotkeys'
  library_version: '0.15.0'
sources:
  - src/injectHotkey.ts
  - src/injectHotkeys.ts
  - src/hotkeys-provider.ts
  - src/injectAppHotkeys.ts
  - src/injectHotkeyRecorder.ts
  - TanStack/hotkeys:docs/framework/angular/quick-start.md
  - TanStack/hotkeys:docs/framework/angular/guides/provide-hotkeys-and-scopes.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Angular

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```ts
import { Component, ElementRef, signal, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-panel',
  template: `<div #panel tabindex="0" (input)="isDirty.set(true)">Panel</div>`,
})
export class PanelComponent {
  readonly isDirty = signal(false)
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    injectHotkey(
      'Mod+S',
      () => this.save(),
      () => ({ enabled: this.isDirty() }),
    )
    injectHotkey(
      'Escape',
      () => this.close(),
      () => ({
        target: this.panel()?.nativeElement ?? null,
      }),
    )
  }

  save() {}
  close() {}
}
```

## API

| API                                          | What it's for                                                                                                                                                                                      |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `injectHotkey(hotkey, callback, options?)`   | Register one chord, sequence, or app hotkey for the component's or service's lifetime; options can be a function that reads signals.                                                               |
| `injectHotkeys(definitions, commonOptions?)` | Register several hotkeys, or a function returning a list built from data, in one call.                                                                                                             |
| `provideHotkeys(options)`                    | Set default options, a scope (`exclusive` for dialogs), `enabled`, and app hotkeys in the app config or a component's `providers`.                                                                 |
| `injectHotkeysContext()`                     | Read the nearest provided defaults and enabled state, or `null` without a provider.                                                                                                                |
| `injectDefaultHotkeysOptions()`              | Read the default options merged from every provider above.                                                                                                                                         |
| `injectAppHotkeys()`                         | Get a signal of the declared app hotkeys with the user's custom hotkeys applied.                                                                                                                   |
| `injectAppHotkeyList()`                      | Get a signal listing every app hotkey with its status, for a cheat sheet or settings screen.                                                                                                       |
| `injectCustomHotkeys()`                      | Read, change, and reset the user's custom hotkeys, and check a new one for conflicts.                                                                                                              |
| `injectHotkeyRecorder(options)`              | Record a chord or sequence the user presses, for a settings screen.                                                                                                                                |
| `injectHotkeyRegistrations()`                | Get a signal listing every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope).                                                                 |
| `injectHotkeyScopesState()`                  | Get a signal of the active scopes and the exclusive scope that owns the keyboard.                                                                                                                  |
| `injectHotkeyHint(hotkey, options?)`         | Get a signal of whether held modifiers should reveal a shortcut's hint. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target. |
| `injectKeyHold(key)`                         | Get a signal of whether one key is held.                                                                                                                                                           |
| `injectHeldKeys()`                           | Get a signal of every key that's held right now.                                                                                                                                                   |
| `injectHeldKeyCodes()`                       | Get a signal mapping each held key to its physical `event.code`.                                                                                                                                   |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

No provider is required. Call the inject functions in a constructor or field initializer.

## A dialog that owns the keyboard

```ts
import { Component, InjectionToken, inject, output } from '@angular/core'
import { injectHotkey, provideHotkeys } from '@tanstack/angular-hotkeys'

let nextDialogId = 0
const DIALOG_SCOPE = new InjectionToken<string>('DIALOG_SCOPE')

@Component({
  selector: 'app-dialog',
  providers: [
    { provide: DIALOG_SCOPE, useFactory: () => `dialog-${++nextDialogId}` },
    provideHotkeys({ scope: () => inject(DIALOG_SCOPE), exclusive: true }),
  ],
  template: `<div role="dialog"><ng-content /></div>`,
})
export class DialogComponent {
  readonly closed = output()

  constructor() {
    injectHotkey('Escape', () => this.closed.emit())
  }
}
```

A component's `providers` apply to the component itself, so it can register its own scoped hotkeys. A fixed `scope: 'dialog'` would give every open dialog the same scope; the per-instance token gives each its own.

## Pitfalls

- **Pass options as a function.** `{ enabled: this.isDirty() }` is read once, in the constructor. A `viewChild` read there is `undefined`, and an undefined target means `document`. Use `() => ({ ... })`.
- **Replace `@HostListener('document:keydown')` and `(keydown.control.s)` bindings with `injectHotkey`.**
- **Register runtime lists in the constructor.** `injectHotkey` throws outside an injection context, such as in `ngOnInit`. For hotkeys from data, use `injectHotkeys(() => this.items().map(...))`.
- **Call the inject functions directly.** A shortcut service or `injectShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, signal options, and app hotkeys.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Angular](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/angular-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/angular/guides/<page>.md`, such as `hotkeys`, `provide-hotkeys-and-scopes`, or `app-hotkeys`. Devtools (Angular 21+): `hotkeysDevtoolsPlugin()` from `@tanstack/angular-hotkeys-devtools` with `provideTanStackDevtools`.
