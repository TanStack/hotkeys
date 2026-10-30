---
title: Register Hotkeys with injectHotkey and injectHotkeys in Angular
id: hotkeys
description: Register keyboard shortcuts in Angular with injectHotkey and injectHotkeys. Write chords and sequences, set options from signals, turn hotkeys on and off, and listen on one element.
---

`injectHotkey` registers a keyboard shortcut for as long as the component that injects it exists, and `injectHotkeys` registers several. Both functions take the same hotkeys and options. To register hotkeys outside Angular components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```ts
injectHotkey('Mod+K', () => this.openSearch()) // Mod and K together
injectHotkey(['G', 'H'], () => this.goHome()) // G, then H
```

Every function and option in this guide accepts both kinds, and most examples use chords. [Sequences](./sequences) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.

## Register a hotkey

Call `injectHotkey` with a hotkey and a callback:

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
  }

  save() {
    // ...
  }
}
```

Call it in an injection context, such as a constructor or a field initializer.

The callback receives the `KeyboardEvent` and a context object:

```ts
injectHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The callback reads signals when it runs, so it always sees their current values:

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-counter',
  template: `<button (click)="count.set(count() + 1)">Count: {{ count() }}</button>`,
})
export class CounterComponent {
  readonly count = signal(0)

  constructor() {
    // Logs the current count, not the count when the component was created
    injectHotkey('Mod+Shift+C', () => console.log(this.count()))
  }
}
```

The hotkey and its options can change too. Pass them as functions, and `injectHotkey` follows the signals they read. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```ts
import { Component, input } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'
import type { Hotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  readonly saveHotkey = input.required<Hotkey>()
  readonly readOnly = input(false)

  constructor() {
    injectHotkey(
      () => this.saveHotkey(),
      () => this.save(),
      () => ({ enabled: !this.readOnly() }),
    )
  }

  save() {
    // ...
  }
}
```

A plain options object is read once, so it keeps the values it had when the component was created. An object with getters, such as `{ get enabled() { return !component.readOnly() } }`, follows changes like a function does.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```ts
injectHotkey('Escape', () => this.close())
injectHotkey('Mod+S', () => this.save()) // Command+S on macOS, Control+S elsewhere
injectHotkey('Mod+Alt+Shift+K', () => this.openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
injectHotkey('[KeyW]', () => this.moveUp()) // The W position, whatever the layout types there

injectHotkey('Shift+Mod+S', () => this.saveAs()) // Type error: Mod comes first
injectHotkey('Mod+Meta+S', () => this.saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```ts
injectHotkey({ key: 'S', mod: true, shift: true }, () => this.saveAs()) // Same as 'Mod+Shift+S'
injectHotkey({ code: 'KeyW' }, () => this.moveUp()) // Same as '[KeyW]'

injectHotkey(
  () => {
    const { key, mod, shift } = this.binding()
    return { key, mod, shift }
  },
  () => this.runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```ts
injectHotkey(['G', { key: 'H', shift: true }], () => this.goToHistory())
```

`injectHotkey` registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
injectHotkey('Enter', () => this.submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S`. `'always'` also stops it while the hotkey can't fire. |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./provide-hotkeys-and-scopes) the hotkey belongs to |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](../../../guides/sensible-defaults.md) explains why each one was chosen and when to change it. The [`InjectHotkeyOptions` reference](../reference/type-aliases/InjectHotkeyOptions.md) lists the types.

To change a default for every hotkey in your app, add `provideHotkeys` with `defaultOptions` to your application config. Options passed to `injectHotkey` override the provided defaults:

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      defaultOptions: { hotkey: { requireReset: true, timeout: 1500 } },
    }),
  ],
}
```

The provider is optional. Without one, every hotkey uses the built-in defaults in the table. See [provideHotkeys and Scopes](./provide-hotkeys-and-scopes) for nested defaults and for grouping hotkeys into scopes.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
injectHotkey('Escape', close, { requireReset: true }) // OK
injectHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
injectHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as provided defaults, apply each of these to the matching kind only. In the provider example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, `injectHotkey` accepts only the options that both kinds share.

## Register multiple hotkeys

When a component has more than one hotkey, use `injectHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```ts
import { Component } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkeys([
      { hotkey: 'Mod+S', callback: () => this.save() },
      { hotkey: 'Mod+Z', callback: () => this.undo() },
      { hotkey: 'Mod+Shift+Z', callback: () => this.redo() },
      { hotkey: ['G', 'G'], callback: () => this.scrollToTop(), options: { timeout: 500 } },
    ])
  }
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `injectHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

```ts
injectHotkeys([
  {
    hotkey: 'Mod+S',
    callback: (event, context) => {
      if (context.kind === 'chord') console.log(context.parsedChord.modifiers)
    },
  },
])
```

### Share options

Pass options for every definition as the second argument. A definition's own options override them:

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-rich-text-editor',
  template: `<div #editor contenteditable></div>`,
})
export class RichTextEditorComponent {
  private readonly editor = viewChild<ElementRef<HTMLDivElement>>('editor')

  constructor() {
    injectHotkeys(
      () => [
        { hotkey: 'Mod+B', callback: () => this.toggleBold() },
        { hotkey: 'Mod+I', callback: () => this.toggleItalic() },
        { hotkey: 'Mod+Z', callback: () => this.undo(), options: { enabled: this.canUndo() } },
      ],
      () => ({ target: this.editor()?.nativeElement ?? null }),
    )
  }
}
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](#hotkey-targets) explains targets. Passing the array as a function lets `enabled` follow the `canUndo` signal.

Options merge in this order: provided defaults, then the shared options, then each definition's options.

### Build the list from data

The constructor runs once, so a plain array never changes after it registers. Pass a function that reads your signals for any list whose length can change:

```ts
export class MenuShortcutsComponent {
  readonly items = input.required<Array<MenuItem>>()

  constructor() {
    injectHotkeys(() =>
      this.items().map((item) => ({
        hotkey: item.shortcut,
        callback: item.action,
        options: { enabled: item.enabled },
      })),
    )
  }
}
```

`injectHotkeys` compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.

## Enable and disable hotkeys

A hotkey is on while its component exists. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```ts
import { Component, output } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-settings-dialog',
  template: `<div role="dialog">...</div>`,
})
export class SettingsDialogComponent {
  readonly closed = output()

  constructor() {
    // Registered only while the dialog exists
    injectHotkey('Escape', () => this.closed.emit())
  }
}
```

For a condition that doesn't match a component, pass `enabled` from a function:

```ts
injectHotkey('Mod+S', () => this.save(), () => ({
  enabled: this.hasUnsavedChanges(),
}))
```

A disabled hotkey stays registered, so devtools still list it, and changing `enabled` doesn't register it again. While disabled, it ignores key presses, so pressing `Mod+S` opens the browser's Save dialog. To keep the dialog closed, set `preventDefault: 'always'`:

```ts
injectHotkey('Mod+S', () => this.save(), () => ({
  enabled: this.hasUnsavedChanges(),
  preventDefault: 'always',
}))
```

With `'always'`, a hotkey that can't fire, because it's disabled or its scope is inactive or suspended, still prevents the browser's action. It doesn't stop propagation, and when another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. To apply it to every hotkey, set it in the default options. We recommend it for most hotkeys, but not for hotkeys you turn off to hand the key back to the browser, such as `Mod+C` or `Tab`. See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone).

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

When a group of hotkeys turns on and off together, use [scopes](./provide-hotkeys-and-scopes) instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays rendered, or suspend the rest of the page while a dialog is open.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. Read the element with `viewChild`, and pass the options as a function:

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-panel',
  template: `<div #panel tabindex="0">Panel content</div>`,
})
export class PanelComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    // Fires only while the panel, or something inside it, has focus
    injectHotkey('Escape', () => this.closePanel(), () => ({
      target: this.panel()?.nativeElement ?? null,
    }))
  }
}
```

A `null` target waits until the element is rendered.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a [scope](./provide-hotkeys-and-scopes) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.

## Handle duplicate hotkeys

When you register a hotkey that is already registered on the same target and in the same scope, TanStack Hotkeys logs a warning in development, and both callbacks run. Set `conflictBehavior` to change that:

- `'warn'` (default) logs a warning in development and keeps both registrations.
- `'error'` throws an error.
- `'replace'` unregisters the existing registration.
- `'allow'` keeps both without a warning.

The comparison resolves modifiers first, so `Mod+S` and `Meta+S` are duplicates on macOS. Two sequences are duplicates when all their steps match. Sequences that only start with the same chord, such as `['G', 'H']` and `['G', 'S']`, are not duplicates.

The same hotkey in two different [scopes](./provide-hotkeys-and-scopes) is not a duplicate either. When both scopes are active, the scope with higher precedence handles the key. See [Nested scopes win](./provide-hotkeys-and-scopes#nested-scopes-win).

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```ts
injectHotkey('Mod+S', () => this.save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. Devtools show it, and you can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
