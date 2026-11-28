---
title: Register Hotkeys with injectHotkey and injectHotkeys in Angular
id: hotkeys
description: Register keyboard shortcuts in Angular with injectHotkey and injectHotkeys. Write chords and sequences, set options from signals, turn hotkeys on and off, and listen on one element.
---

`injectHotkey` registers a keyboard shortcut for as long as the component that injects it exists, and `injectHotkeys` registers several. Both functions take the same hotkeys and options. To register hotkeys outside Angular components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```ts
injectHotkey('Mod+K', () => this.openSearch()) // Mod and K together
injectHotkey(['G', 'H'], () => this.goHome()) // G, then H
```

Every function and option in this guide accepts both. See [Sequences](./sequences) for sequence rules such as timeouts and overlapping prefixes.

## Register a hotkey

Pass a hotkey and callback to `injectHotkey`:

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

Callbacks receive the `KeyboardEvent` and a context object:

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

That makes it straightforward to register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which suits optional shortcut props. Switching to one of these values unregisters the hotkey and hides its hints. Passing a valid hotkey again registers it again.

To keep the hotkey registered, visible in devtools and cheat sheets, but paused, leave it defined and pass `enabled: false` instead.

### Write a chord as a string or an object

Most chords are written as strings, which gives you editor autocomplete and compile-time validation:

```ts
injectHotkey('Escape', () => this.close())
injectHotkey('Mod+S', () => this.save()) // Command+S on macOS, Control+S elsewhere
injectHotkey('Mod+Alt+Shift+K', () => this.openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
injectHotkey('[KeyW]', () => this.moveUp()) // The W position, whatever the layout types there

injectHotkey('Shift+Mod+S', () => this.saveAs()) // Type error: Mod comes first
injectHotkey('Mod+Meta+S', () => this.saveAs()) // Type error: Mod is already Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./keyboard-layouts).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

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

Sequence steps can be strings, objects, or a mix of both:

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
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](../../../guides/sensible-defaults.md#component-libraries-that-handle-the-same-keys). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./provide-hotkeys-and-scopes) the hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

See [Sensible Defaults](../../../guides/sensible-defaults.md) for why each default behaves the way it does, and the [`InjectHotkeyOptions` reference](../reference/type-aliases/InjectHotkeyOptions.md) for type definitions.

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

The provider is optional. See [provideHotkeys & Scopes](./provide-hotkeys-and-scopes) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```ts
injectHotkey('Escape', close, { requireReset: true }) // OK
injectHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
injectHotkey('Escape', close, { timeout: 500 }) // Type error
```

When defaults apply to many hotkeys at once, `requireReset` affects only chords and `timeout` affects only sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only the options common to both kinds are accepted.

## Register multiple hotkeys

Use `injectHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

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
      { hotkey: 'Mod+Enter', callback: () => this.publish() },
      { hotkey: 'Mod+D', callback: () => this.duplicate() },
      { hotkey: ['G', 'G'], callback: () => this.scrollToTop(), options: { timeout: 500 } },
    ])
  }
}
```

Chords and sequences can share the same array, and each item's `options` are typed against its own `hotkey`. Inside the array, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

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

Pass shared options as the second argument. Individual definitions override them:

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
      { target: this.editor },
    )
  }
}
```

The shared `target` makes every hotkey in the list listen on the editor only. [Hotkey targets](#hotkey-targets) explains targets. Passing the array as a function lets `enabled` follow the `canUndo` signal.

Options merge in layers: defaults from the provider first, then the shared options, then per-item options.

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

Toggling `enabled` keeps the hotkey registered and visible in devtools without registering it again. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```ts
injectHotkey('Mod+S', () => this.save(), () => ({
  enabled: this.hasUnsavedChanges(),
  preventDefault: 'always',
}))
```

See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

> [!NOTE]
> Single-key shortcuts such as `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch). To toggle a group of shortcuts together, use [scopes](./provide-hotkeys-and-scopes) instead of passing `enabled` to each hotkey.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, an `ElementRef`, `document`, or `window` to listen somewhere else. To listen on an element in the template, pass its `viewChild` signal:

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
    injectHotkey('Escape', () => this.closePanel(), { target: this.panel })
  }
}
```

The hotkey reads the signal, so it registers once the element renders and moves if the element changes. A `null` or `undefined` target, or a signal of either, registers nothing until the element exists, including a value read in an options function, such as `() => ({ target: this.panel()?.nativeElement })`. Only an omitted `target` listens on `document`, so a wrapper that forwards an unset `target` waits too. Set `target: document` to choose the document explicitly.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./provide-hotkeys-and-scopes#scopes-and-targets) are active regardless of focus.

A single hotkey can use both.

## Handle duplicate hotkeys

Registering the same canonical binding on the same target, scope, and `eventType` logs a console warning in development and runs both callbacks. `Mod+S` and `Meta+S` are identical on macOS. Customize this with `conflictBehavior`:

- `'warn'` (default) logs a development warning and keeps both registrations
- `'error'` throws an error
- `'allow'` keeps both silently

Two sequences conflict only when all steps match, so `['G', 'H']` and `['G', 'S']` do not. Registrations in different [scopes](./provide-hotkeys-and-scopes) don't conflict either. When both are active, the [higher-precedence scope](./provide-hotkeys-and-scopes#nested-scopes-win) wins for overlapping chords and for a sequence that completes in both. Sequences in both scopes still advance, so a dialog's `['G', 'G']` doesn't stop a page's `['G', 'I']`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```ts
injectHotkey('Mod+S', () => this.save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no effect on key matching. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./cheat-sheet-ui-helpers).
