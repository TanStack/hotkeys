---
title: provideHotkeys, Default Options, and Hotkey Scopes in Angular
id: provide-hotkeys-and-scopes
description: Use provideHotkeys in Angular to set default options for hotkeys and recorders, provide app hotkeys, and turn groups of hotkeys on and off with the dialogs, panels, and tabs they belong to.
redirect_from:
  - framework/angular/guides/hotkeys-provider-and-scopes
---

`provideHotkeys` is optional. Without it, every hotkey uses the built-in defaults and belongs to the `'global'` scope, so it works for as long as its component exists. Many apps never need more. Add it to your application config or to a component's `providers` when you want to:

- Change the default options for every hotkey or recorder in part of your app.
- Provide [app hotkeys](./app-hotkeys) and the user's custom hotkeys.
- Group hotkeys into scopes that turn on and off together, such as everything in a dialog.

## Set default options

Pass `defaultOptions` to change the defaults for everything below the provider:

```ts
import { provideHotkeys } from '@tanstack/angular-hotkeys'

bootstrapApplication(AppComponent, {
  providers: [
    provideHotkeys({
      defaultOptions: {
        hotkey: { requireReset: true, timeout: 1500 },
        hotkeyRecorder: { idleTimeoutMs: 2000 },
      },
    }),
  ],
})
```

- `hotkey` defaults apply to every `injectHotkey` and `injectHotkeys` below the provider. `requireReset` applies to chords, and `timeout` to sequences. Options passed to a function override the defaults. See [Hotkey options](./hotkeys#hotkey-options).
- `hotkeyRecorder` defaults apply to every `injectHotkeyRecorder` below the provider. See [Custom Hotkey Recording](./custom-hotkey-recording).

A `provideHotkeys` in a component's `providers` merges its defaults over its parent's, so a component can change the defaults for its part of your app.

## Provide app hotkeys

Pass your [app hotkeys](./app-hotkeys) in the application config, along with the user's saved custom hotkeys and a function that saves changes:

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideHotkeys({
      appHotkeys,
      customHotkeys: savedHotkeys,
      onCustomHotkeysChange: saveHotkeys,
    }),
  ],
})
```

Nested providers use the app hotkeys and custom hotkeys of the provider above them, so pass these only once, in the application config.

## Group hotkeys into scopes

Apps reuse keys. `Escape` should close the dialog, not the panel behind it, and `Mod+S` should post the comment you are typing, not save the whole document. You could pass [`enabled`](./hotkeys#enable-and-disable-hotkeys) to every hotkey, but then each component has to know about every other component that might want the same key.

Scopes group hotkeys by where they render instead. Add `provideHotkeys` with a `scope` to a component's `providers`, and every hotkey injected in that component and its children belongs to that scope. The scope is active while the component exists and the provider is enabled, and nested scopes take precedence over the scopes around them.

```ts
import { Component } from '@angular/core'
import { injectHotkey, provideHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  providers: [provideHotkeys({ scope: 'editor' })],
  template: `...`,
})
export class Editor {
  constructor() {
    // Registered in the 'editor' scope
    injectHotkey('Mod+B', () => this.toggleBold())
  }
}
```

A hotkey registered with `injectHotkey` or `injectHotkeys` uses the scope of the nearest provider that sets one. Hotkeys outside any scoped provider, including those under the `provideHotkeys` in your application config, are in the `'global'` scope, which is always active. A provider without `scope` uses its parent's scope.

The scope activates when the first hotkey in it is injected, and stays active until the component is destroyed. A provider with no hotkeys under it never activates, so an exclusive provider needs at least one hotkey inside it before it suspends anything.

Scopes are names, not instances. Two components that provide the `editor` scope share one scope, and it stays active until both are destroyed. Give each region its own name when you need to turn them on and off separately.

## Scopes and targets

A scope and a [target](./hotkeys#hotkey-targets) both limit when a hotkey works, and a hotkey can have both:

```ts
@Component({
  selector: 'app-editor',
  providers: [provideHotkeys({ scope: 'editor' })],
  template: `<nav #outline tabindex="0">...</nav>`,
})
export class Editor {
  private readonly outline = viewChild<ElementRef<HTMLElement>>('outline')

  constructor() {
    // In the 'editor' scope: works wherever focus is, while the scope is active
    injectHotkey('Mod+B', () => this.toggleBold())

    // Also has a target: works only while focus is inside the outline
    injectHotkey('Delete', () => this.deleteHeading(), () => ({
      target: this.outline()?.nativeElement ?? null,
    }))
  }
}
```

| | Scope | Target |
| --- | --- | --- |
| Decides | Whether the hotkey is on | Which key presses the hotkey receives |
| Based on | Which providers exist and are enabled | Where focus is |
| Follows | The injector tree, including overlays | The DOM |
| Set with | `provideHotkeys({ scope })`, or the `scope` option | The `target` option |
| Use for | Dialogs, panes, and tabs | Focusable elements, such as a list or a code editor |

## Nested scopes win

When hotkeys in two active scopes match the same key, only one scope handles it:

- A nested scope beats the scopes it is nested in.
- Otherwise, the scope that activated most recently wins.

Every hotkey in the winning scope that matches the key runs. Hotkeys in other scopes do not.

```ts
@Component({
  selector: 'app-comment-box',
  providers: [provideHotkeys({ scope: 'comments' })],
  template: `<textarea></textarea>`,
})
export class CommentBox {
  constructor() {
    // Wins while it exists, because 'comments' is nested in 'document'
    injectHotkey('Mod+S', () => this.post())
  }
}

@Component({
  selector: 'app-document',
  providers: [provideHotkeys({ scope: 'document' })],
  imports: [CommentBox],
  template: `<app-comment-box />`,
})
export class DocumentView {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
  }
}
```

When the comment box is destroyed, `Mod+S` saves the document again.

Precedence compares hotkeys on the same [`target`](./hotkeys#hotkey-targets). A hotkey bound to an element still handles events from inside that element before document hotkeys do, as long as its scope is active.

Two registrations of the same hotkey in different scopes are not a conflict, so `conflictBehavior` does not warn about them.

## Turn a scope off with `enabled`

Pass `enabled` to deactivate a provider's scope while its component stays rendered. This suits tabs, carousels, and split views that keep inactive panes rendered.

`scope`, `exclusive`, and `enabled` accept getters. They run in the providing component's injection context, so they can `inject()` that component and read its inputs:

```ts
@Component({
  selector: 'app-folder',
  providers: [
    provideHotkeys({
      scope: () => inject(Folder).name(),
      enabled: () => inject(Folder).current(),
    }),
  ],
  template: `...`,
})
export class Folder {
  readonly name = input.required<string>()
  readonly current = input(false)

  constructor() {
    // Only the current folder's handler runs
    injectHotkey('Alt+N', () => this.addItem())
  }
}
```

```html
@for (name of folders; track name) {
  <app-folder [name]="name" [current]="current() === name" />
}
```

The folder's hotkeys don't check which folder is current. Without scopes, each would need its own `enabled` option. Getters are tracked like `computed`, so the scope turns on and off as the inputs change.

`enabled` is inherited. Disabling a provider also deactivates every scope nested in it. A provider without its own `scope` has no scope to deactivate, so disabling it affects only the scoped providers inside it.

Hotkeys in an inactive scope stay registered. Devtools list them under their inactive scope, and [`injectAppHotkeyList`](./cheat-sheet-ui-helpers#list-every-app-hotkey) reports their app hotkeys as `'suspended'`.

## Exclusive scopes

An exclusive scope suspends every other scope while it is active, including `'global'`. Use it for dialogs, menus, and other overlays that should own the keyboard:

```ts
@Component({
  selector: 'app-edit-dialog',
  providers: [provideHotkeys({ scope: 'edit-dialog', exclusive: true })],
  template: `<div role="dialog">...</div>`,
})
export class EditDialog {
  constructor() {
    injectHotkeys([
      { hotkey: 'Escape', callback: () => this.close() },
      { hotkey: 'Mod+S', callback: () => this.saveAndClose() },
    ])
  }
}
```

While the dialog is open, `Mod+S` saves the dialog and nothing else, even though the page behind it registers `Mod+S` too. Scopes nested inside the exclusive provider keep working, so the dialog can still be built from scoped components.

A scope follows the injector tree, not the DOM. A dialog component that renders in an overlay keeps the scope from its own `providers`.

### Allow other scopes

Pass `{ allow }` to keep some scopes working while an exclusive scope is active:

```ts
provideHotkeys({
  scope: 'edit-dialog',
  exclusive: { allow: ['global', 'command-palette'] },
})
```

- An allowed scope still has to be active on its own. Only `'global'` is always active.
- Allowed scopes follow the usual precedence. A popover that opens over the dialog in an allowed scope is newer, so its `Escape` closes the popover first.
- A getter can return a new `allow` array each time. Providers compare it by value, so an equal array does not reactivate the scope.

### Stacked exclusive scopes

When more than one exclusive scope is active, the one with the highest precedence owns the keyboard, and only its `allow` list applies. A confirmation dialog opened from inside an edit dialog suspends the edit dialog until it closes.

Each exclusive scope needs a unique name. Activating the same exclusive scope twice logs a warning in development, because hotkeys from both providers would fire together.

## Choose a scope for one hotkey

Pass `scope` to a single hotkey to register it somewhere other than the nearest provider's scope:

```ts
// Registered in 'global' even when this component is inside a scope
injectHotkey('Mod+K', () => this.openPalette(), { scope: 'global' })
```

A hotkey can name any scope, but it fires only while some provider has that scope active.

## Scopes and app hotkeys

An [app hotkey](./app-hotkeys) can declare a `scope`. The declared scope wins over the provider it registers under:

```ts
export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' }, scope: 'document' },
  'comment.post': { hotkey: 'Mod+S', meta: { name: 'Post comment' }, scope: 'comments' },
  'palette.open': { hotkey: 'Mod+K', meta: { name: 'Command palette' }, scope: 'global' },
})
```

App hotkeys without a declared scope use the provider's scope, like any other hotkey.

The declared scope also drives conflict checks. `findConflicts` and `setCustomHotkey` let app hotkeys in different scopes share a hotkey, as `doc.save` and `comment.post` do above. An app hotkey in `'global'`, or with no declared scope, conflicts with every app hotkey that uses the same hotkey. Declare scopes on app hotkeys that are meant to share keys.

`injectAppHotkeyList` reports an app hotkey as `'suspended'` when it has enabled registrations but none of them is in an active scope.

## Scopes outside Angular

For UI that Angular doesn't render, such as a dialog from another library, activate a scope on the hotkey manager. See [Activate a scope](./hotkey-manager#activate-a-scope).

## Inspect scopes

The hotkeys [devtools](../../../devtools) group registrations by scope and show which scopes are active, suspended, allowed, or exclusive.

Your app doesn't need to track scopes itself. If you want to show scope state anyway, read it from the hotkey manager. See [Read scope state](./hotkey-manager#read-scope-state).

See the [Scopes example](../examples/scopes) for nested, enabled, and exclusive scopes together.
