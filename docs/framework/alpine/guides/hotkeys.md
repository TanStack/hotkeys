---
title: Register Hotkeys with createHotkey and createHotkeys in Alpine
id: hotkeys
description: Register keyboard shortcuts in Alpine components with createHotkey and createHotkeys. Write chords and sequences, set reactive options, turn hotkeys on and off, and listen on one element.
---

`createHotkey` registers a keyboard shortcut, and `createHotkeys` registers several. Call them on an owner from `createHotkeysScope`, and destroy the owner when the component is destroyed. Both functions take the same hotkeys and options. To register hotkeys outside Alpine components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```ts
this.hotkeys.createHotkey('Mod+K', () => openSearch()) // Mod and K together
this.hotkeys.createHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every function and option in this guide accepts both kinds, and most examples use chords. [Sequences](./sequences) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.

## Register a hotkey

Create an owner for the component's hotkeys with `createHotkeysScope`, register hotkeys in `init()`, and destroy the owner in `destroy()`:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('editor', () => ({
  hotkeys: createHotkeysScope(),
  init() {
    this.hotkeys.createHotkey('Mod+S', () => saveDocument())
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

Destroying the owner unregisters every hotkey it created. `createHotkeysScope` only creates an owner for registrations. It doesn't create a hotkey scope.

The callback receives the `KeyboardEvent` and a context object:

```ts
this.hotkeys.createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

A callback created in `init()` reads the component's state through `this`, so it always sees current values:

```ts
Alpine.data('counter', () => ({
  count: 0,
  hotkeys: createHotkeysScope(),
  init() {
    // Logs the current count, not the count when the component was created
    this.hotkeys.createHotkey('Mod+Shift+C', () => console.log(this.count))
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

The hotkey and its options can change too. Pass them as getters, and the owner follows the state they read. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```ts
this.hotkeys.createHotkey(
  () => this.saveHotkey,
  () => save(),
  () => ({ enabled: !this.readOnly }),
)
```

A plain options object is read once, so `{ enabled: !this.readOnly }` keeps the value from when `init()` ran.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Use the `$hotkeys` magic

To register hotkeys from markup, install `hotkeysPlugin` and call the same functions on `$hotkeys`. See [Use the `$hotkeys` magic](../quick-start#use-the-hotkeys-magic) for the setup:

```html
<div x-data="{ count: 0 }" x-init="$hotkeys.createHotkey('Mod+S', () => count++)">
  Saved <span x-text="count"></span> times
</div>
```

The plugin destroys `$hotkeys` with its element. The rest of this guide uses an owner from `createHotkeysScope`.

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```ts
this.hotkeys.createHotkey('Escape', () => close())
this.hotkeys.createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
this.hotkeys.createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
this.hotkeys.createHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

this.hotkeys.createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
this.hotkeys.createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```ts
this.hotkeys.createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
this.hotkeys.createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

this.hotkeys.createHotkey(
  () => ({ key: this.binding.key, mod: this.binding.mod, shift: this.binding.shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```ts
this.hotkeys.createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

Every chord and sequence step registers as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
this.hotkeys.createHotkey('Enter', () => submit(), { ignoreInputs: false })
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
| `scope` | `'global'` | The scope the hotkey belongs to. See [Add defaults and scopes](../quick-start#add-defaults-and-scopes-optional). |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](../../../guides/sensible-defaults.md) explains why each one was chosen and when to change it. The [`AlpineHotkeyCommonOptions` reference](../reference/type-aliases/AlpineHotkeyCommonOptions.md) lists the types.

To change a default for the hotkeys an owner creates, pass default options to `createHotkeysScope`. Options passed to a function override the owner's defaults. Share the defaults object between components that need the same defaults:

```ts
const hotkeyDefaults = { hotkey: { requireReset: true, timeout: 1500 } }

Alpine.data('editor', () => ({
  hotkeys: createHotkeysScope(hotkeyDefaults),
  // ...
}))
```

Without defaults, every hotkey uses the built-in defaults in the table.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
this.hotkeys.createHotkey('Escape', close, { requireReset: true }) // OK
this.hotkeys.createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
this.hotkeys.createHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as an owner's defaults, apply each of these to the matching kind only. In the defaults example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the function accepts only the options that both kinds share.

## Register multiple hotkeys

When a component has more than one hotkey, use `createHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```ts
init() {
  this.hotkeys.createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])
},
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `createHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

```ts
this.hotkeys.createHotkeys([
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
Alpine.data('richTextEditor', () => ({
  canUndo: false,
  hotkeys: createHotkeysScope(),
  init() {
    this.hotkeys.createHotkeys(
      () => [
        { hotkey: 'Mod+B', callback: () => toggleBold() },
        { hotkey: 'Mod+I', callback: () => toggleItalic() },
        { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: this.canUndo } },
      ],
      () => ({ target: this.$refs.editor }),
    )
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<div x-data="richTextEditor">
  <div x-ref="editor" contenteditable></div>
</div>
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](#hotkey-targets) explains targets. Passing the array as a getter lets `enabled` follow `canUndo`.

Options merge in this order: the owner's defaults, then the shared options, then each definition's options.

### Build the list from data

`init()` runs once, so a plain array never changes after it registers. Pass a getter for any list whose length can change:

```ts
this.hotkeys.createHotkeys(() =>
  this.items.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
    options: { enabled: item.enabled },
  })),
)
```

The owner compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.

## Enable and disable hotkeys

A hotkey is on from the component's `init()` until its `destroy()` destroys the owner. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```ts
Alpine.data('settingsDialog', () => ({
  hotkeys: createHotkeysScope(),
  init() {
    // Registered only while the dialog exists
    this.hotkeys.createHotkey('Escape', () => this.$dispatch('close'))
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<template x-if="isOpen">
  <div x-data="settingsDialog" role="dialog" @close="isOpen = false">...</div>
</template>
```

For a condition that doesn't match a component, pass `enabled` from a getter:

```ts
this.hotkeys.createHotkey('Mod+S', () => save(), () => ({
  enabled: this.hasUnsavedChanges,
}))
```

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the callback:

```ts
this.hotkeys.createHotkey('Mod+S', () => {
  if (!this.hasUnsavedChanges) return
  save()
})
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

When a group of hotkeys turns on and off together, put them in a scope instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays in the page, or suspend the rest of the page while a dialog is open. See [Add defaults and scopes](../quick-start#add-defaults-and-scopes-optional).

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. Pass the options as a getter, so the hotkey finds the element after Alpine creates it:

```ts
Alpine.data('panel', () => ({
  hotkeys: createHotkeysScope(),
  init() {
    // Fires only while the panel, or something inside it, has focus
    this.hotkeys.createHotkey('Escape', () => closePanel(), () => ({
      target: this.$refs.panel,
    }))
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<div x-data="panel">
  <div x-ref="panel" tabindex="0">Panel content</div>
</div>
```

`$refs` holds elements that exist when `init()` runs. For an element that Alpine adds later, such as one inside `x-if`, keep the element in component state and return it from the getter. A `null` target waits until the element exists.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a scope both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both. See [Add defaults and scopes](../quick-start#add-defaults-and-scopes-optional).

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
this.hotkeys.createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. You can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
