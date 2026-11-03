---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to Alpine components with TanStack Hotkeys. Register hotkeys, show them in your UI, and group them into scopes.
---

This guide adds keyboard shortcuts to Alpine components. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Register a hotkey

Install `hotkeysPlugin` before `Alpine.start()`. Then, in each component, create an owner for its hotkeys with `createHotkeysScope`, register the hotkeys in `init()`, and destroy the owner in `destroy()`:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, hotkeysPlugin } from '@tanstack/alpine-hotkeys'

Alpine.plugin(hotkeysPlugin)

Alpine.data('editor', () => ({
  hotkeys: createHotkeysScope(),
  init() {
    this.hotkeys.createHotkey('Mod+S', () => saveDocument())
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))

Alpine.start()
```

```html
<div x-data="editor">
  <textarea></textarea>
</div>
```

The plugin gives the adapter your Alpine instance, so it never loads its own copy. If Alpine comes from a script tag, install the plugin in an `alpine:init` listener. Without the plugin, the adapter uses `window.Alpine`.

Destroying the owner unregisters every hotkey it created. The adapter runs in the browser, so with server rendering, load it only on the client.

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

That's all a hotkey needs. Shared defaults, scopes, and the other features later in this guide are optional, so add them as your app grows.

### Use the `$hotkeys` magic

The plugin also adds the `$hotkeys` magic, which registers hotkeys from markup:

```html
<div x-data="{ count: 0 }" x-init="$hotkeys.createHotkey('Mod+S', () => count++)">
  Saved <span x-text="count"></span> times
</div>
```

`$hotkeys` is an owner that the plugin destroys with its element. It uses the built-in defaults. Register each hotkey with either `$hotkeys` or your own owner, not both.

Call `$hotkeys.create*` in `x-init` or `init()`, and read `.value` anywhere. In a reactive expression such as `x-text`, each evaluation calls `create*` again and adds a new subscription.

## Register several hotkeys

When a component has more than one hotkey, register them together with `createHotkeys`:

```ts
init() {
  this.hotkeys.createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  ])
},
```

`createHotkeys` also accepts a getter that returns the array, so the list can come from Alpine state and change length over time.

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```ts
this.hotkeys.createHotkey(['G', 'G'], () => scrollToTop())
```

Each step must follow the previous one within a second.

`createHotkeys` accepts chords and sequences in the same array:

```ts
this.hotkeys.createHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import type { HotkeyChord } from '@tanstack/alpine-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

Alpine.data('saveButton', () => ({
  hotkeys: createHotkeysScope(),
  label: formatForDisplay(saveHotkey),
  init() {
    this.hotkeys.createHotkey(saveHotkey, () => saveDocument())
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<button x-data="saveButton" type="button">
  Save <kbd x-text="label"></kbd>
</button>
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered in the component's `init()`, and unregistered when the component's `destroy()` destroys its owner. Put each hotkey in the component it belongs to, so it is active only while that component exists:

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
<div x-data="{ isOpen: false }">
  <button type="button" @click="isOpen = true">Settings</button>
  <template x-if="isOpen">
    <div x-data="settingsDialog" role="dialog" @close="isOpen = false">...</div>
  </template>
</div>
```

For a condition that doesn't match a component, pass `enabled`. Pass options as a getter, so they follow Alpine state:

```ts
this.hotkeys.createHotkey('Mod+S', () => save(), () => ({
  enabled: this.hasUnsavedChanges,
}))
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add defaults and scopes](#add-defaults-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, pass that element as `target`:

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
  <div x-ref="panel" tabindex="0">...</div>
</div>
```

`$refs` holds elements that exist when `init()` runs. For an element that Alpine adds later, such as one inside `x-if`, keep the element in component state and return it from the getter. A `null` target waits until the element exists. The hotkey fires while focus is on the element or inside it. If nothing there can take focus, give the element a `tabindex`.

## Add defaults and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component exists.

Alpine has no provider, so pass default options to `createHotkeysScope`. Define them once and share them between components that need the same defaults:

```ts
const hotkeyDefaults = { hotkey: { timeout: 1500 } }

Alpine.data('editor', () => ({
  hotkeys: createHotkeysScope(hotkeyDefaults),
  // ...
}))
```

Hotkeys can also be grouped into scopes. Every hotkey in a scope turns on and off with it. Make a scope `exclusive`, and while it is active, only its hotkeys work. Use one for dialogs and popups that should own the keyboard.

Activate the scope from the hotkey manager in `init()`, release it in `destroy()`, and pass `scope` to the hotkeys that belong to it:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, getHotkeyManager } from '@tanstack/alpine-hotkeys'

Alpine.data('confirmDialog', () => {
  const hotkeys = createHotkeysScope()
  let releaseScope = () => {}

  return {
    init() {
      releaseScope = getHotkeyManager().activateScope('confirm-dialog', {
        exclusive: true,
      })
      hotkeys.createHotkeys(
        [
          { hotkey: 'Enter', callback: () => this.$dispatch('confirm') },
          { hotkey: 'Escape', callback: () => this.$dispatch('cancel') },
        ],
        { scope: 'confirm-dialog' },
      )
    },
    destroy() {
      releaseScope()
      hotkeys.destroy()
    },
  }
})
```

While the dialog exists, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog is destroyed, they work again.

`activateScope` returns a function that releases the scope. A scope stays active until every activation of it is released. Despite its name, `createHotkeysScope` only creates an owner for registrations. It doesn't create or activate a hotkey scope.

## Next steps

Learn more about the basics:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [Held Key State Helpers](./guides/held-key-state-helpers): show which keys are held
- [Hotkey Hints](./guides/hotkey-hints): show a button's shortcut while the user holds its modifiers

As your app grows:

- [App Hotkeys](./guides/app-hotkeys): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./guides/cheat-sheet-ui-helpers): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./guides/custom-hotkey-recording): record the shortcut a user presses
- [Hotkey Manager](./guides/hotkey-manager): register and inspect hotkeys outside components
