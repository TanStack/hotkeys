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

| Task                          | API                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Register                      | `injectHotkey(hotkey, callback, options?)`; `injectHotkeys(definitions, commonOptions?)` for several hotkeys or a list from data                             |
| Defaults, scopes, app hotkeys | `provideHotkeys({ defaultOptions, scope, exclusive, enabled, appHotkeys, customHotkeys, onCustomHotkeysChange })` in app config or a component's `providers` |
| App hotkeys                   | `injectAppHotkeys()`, `injectAppHotkeyList()` (signals), `injectCustomHotkeys()`                                                                             |
| Record, list, held keys       | `injectHotkeyRecorder`, `injectHotkeyRegistrations`, `injectKeyHold`, `injectHeldKeys`, `injectHotkeyHint`                                                   |

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
