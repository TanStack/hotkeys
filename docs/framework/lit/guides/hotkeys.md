---
title: Register Hotkeys with @hotkey and HotkeyController in Lit
id: hotkeys
description: Register keyboard shortcuts in Lit with the @hotkey decorator and HotkeyController. Write chords and sequences, set options, turn hotkeys on and off, and listen on one element.
---

The `@hotkey` decorator registers a keyboard shortcut for a method while its element is connected. `HotkeyController` does the same for any callback, and accepts a hotkey and options that change. Both take the same hotkeys and options. To register hotkeys outside Lit elements, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```ts
@hotkey('Mod+K') // Mod and K together
openSearch() {}

@hotkey(['G', 'H']) // G, then H
goHome() {}
```

Every decorator, controller, and option in this guide accepts both kinds, and most examples use chords. [Sequences](./sequences) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.

## Register a hotkey

Decorate the method that handles the hotkey with `@hotkey`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {
    saveDocument()
  }

  render() {
    return html`<textarea></textarea>`
  }
}
```

The method receives the `KeyboardEvent` and a context object. Type the context to match the hotkey, `HotkeyChordCallbackContext` for a chord:

```ts
@hotkey('Mod+S')
save(event: KeyboardEvent, context: HotkeyChordCallbackContext) {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
}
```

The method runs with the element as `this`, so it reads the element's current properties.

Decorator arguments are fixed when the class is defined. When the hotkey or its options change, use `HotkeyController` and pass them as functions. The controller reads them when the element connects and after each update. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'
import type { Hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @property({ attribute: false }) saveHotkey: Hotkey = 'Mod+S'
  @property({ type: Boolean }) readOnly = false

  constructor() {
    super()
    this.addController(
      new HotkeyController(
        this,
        () => this.saveHotkey,
        () => this.save(),
        () => ({ enabled: !this.readOnly }),
      ),
    )
  }

  save() {
    saveDocument()
  }

  render() {
    return html`<textarea></textarea>`
  }
}
```

Keep the values the functions read in reactive properties, so a change triggers an update. A controller callback receives `HotkeyCallbackContext`, which can belong to either kind of hotkey, so check `context.kind` before reading `context.parsedChord`.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```ts
@hotkey('Escape')
close() {}

@hotkey('Mod+S') // Command+S on macOS, Control+S elsewhere
save() {}

@hotkey('Mod+Alt+Shift+K') // Modifiers in order: Mod or Control, Alt, Shift, Meta
openCommandLog() {}

@hotkey('[KeyW]') // The W position, whatever the layout types there
moveUp() {}

@hotkey('Shift+Mod+S') // Type error: Mod comes first
saveAs() {}
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```ts
@hotkey({ key: 'S', mod: true, shift: true }) // Same as 'Mod+Shift+S'
saveAs() {}

@hotkey({ code: 'KeyW' }) // Same as '[KeyW]'
moveUp() {}

constructor() {
  super()
  this.addController(
    new HotkeyController(
      this,
      () => ({ key: this.binding.key, mod: this.binding.mod, shift: this.binding.shift }),
      () => this.runAction(),
    ),
  )
}
```

Sequence steps can be strings, objects, or a mix:

```ts
@hotkey(['G', { key: 'H', shift: true }])
goToHistory() {}
```

Every chord and sequence step registers as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as the decorator's second argument, or the controller's fourth:

```ts
// Submit with Enter, even while focus is in a text field
@hotkey('Enter', { ignoreInputs: false })
submit() {}
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S` |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | `'global'` | The scope the hotkey belongs to. See [Add scopes](../quick-start#add-scopes-optional). |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](../../../guides/sensible-defaults.md) explains why each one was chosen and when to change it. The [`HotkeyControllerOptions` reference](../reference/type-aliases/HotkeyControllerOptions.md) lists the types.

Lit has no provider for app-wide defaults, so pass options to each hotkey. To give several hotkeys the same options, share an options object. See [Share options](#share-options).

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The decorator's option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
@hotkey('Escape', { requireReset: true }) // OK
close() {}

@hotkey(['G', 'G'], { timeout: 500 }) // OK
scrollToTop() {}

@hotkey('Escape', { timeout: 500 }) // Type error
cancel() {}
```

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the decorator accepts only the options that both kinds share.

## Register multiple hotkeys

Decorate one method for each hotkey. Each decorator registers its own hotkey:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {}

  @hotkey('Mod+Z')
  undo() {}

  @hotkey('Mod+Shift+Z')
  redo() {}

  @hotkey(['G', 'G'], { timeout: 500 })
  scrollToTop() {}
}
```

Chords and sequences can sit side by side on the same element.

### Share options

Keep options that several hotkeys share in one object. Pass it to each hotkey, or spread it to add more options:

```ts
import type { HotkeyControllerChordOptions } from '@tanstack/lit-hotkeys'

// The formatting hotkeys toggle, so each fires once per press
const toggle: HotkeyControllerChordOptions = { requireReset: true }

@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+B', toggle)
  toggleBold() {}

  @hotkey('Mod+I', toggle)
  toggleItalic() {}

  @hotkey('Mod+U', { ...toggle, meta: { name: 'Underline' } })
  toggleUnderline() {}
}
```

### Build the list from data

Each decorator and controller registers one hotkey, and Lit has no API for a list whose length changes. When the list is known when the element is created, create one `HotkeyController` for each item in the constructor.

## Enable and disable hotkeys

A hotkey is on while its element is connected. Most hotkeys need no other on and off logic, so put each one on the element it belongs to:

```ts
@customElement('settings-dialog')
class SettingsDialog extends LitElement {
  // Registered only while the dialog is connected
  @hotkey('Escape')
  close() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    return html`<div role="dialog">...</div>`
  }
}
```

For a condition that doesn't match an element, pass `enabled` from a `HotkeyController` options function:

```ts
constructor() {
  super()
  this.addController(
    new HotkeyController(this, 'Mod+S', () => this.save(), () => ({
      enabled: this.hasUnsavedChanges,
    })),
  )
}
```

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the method:

```ts
@hotkey('Mod+S')
save() {
  if (!this.hasUnsavedChanges) return
  saveDocument()
}
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

When a group of hotkeys turns on and off together, put them in a scope instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays connected, or suspend the rest of the page while a dialog is open. See [Add scopes](../quick-start#add-scopes-optional).

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. For an element the hotkey's element renders, pass the options as a function on a `HotkeyController`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-panel')
class MyPanel extends LitElement {
  private panel = createRef<HTMLDivElement>()

  constructor() {
    super()
    // Fires only while the panel, or something inside it, has focus
    this.addController(
      new HotkeyController(this, 'Escape', () => this.closePanel(), () => ({
        target: this.panel.value ?? null,
      })),
    )
  }

  render() {
    return html`<div ${ref(this.panel)} tabindex="0">Panel content</div>`
  }
}
```

A `null` target waits until the element renders.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a scope both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both. See [Add scopes](../quick-start#add-scopes-optional).

## Handle duplicate hotkeys

When you register a hotkey that is already registered on the same target and in the same scope, TanStack Hotkeys logs a warning, and both callbacks run. Set `conflictBehavior` to change that:

- `'warn'` (default) logs a warning and keeps both registrations.
- `'error'` throws an error.
- `'replace'` unregisters the existing registration.
- `'allow'` keeps both without a warning.

The comparison resolves modifiers first, so `Mod+S` and `Meta+S` are duplicates on macOS. Two sequences are duplicates when all their steps match. Sequences that only start with the same chord, such as `['G', 'H']` and `['G', 'S']`, are not duplicates.

The same hotkey in two different scopes is not a duplicate either. When both scopes are active, the scope with higher precedence handles the key.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```ts
@hotkey('Mod+S', {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
save() {}
```

`meta` doesn't change how a hotkey behaves. You can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
