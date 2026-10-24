---
title: Building a Keyboard Shortcut Cheat Sheet in Alpine
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Alpine from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

A cheat sheet lists the shortcuts users can press. Build it from the same hotkeys that handle the key presses, and it stays correct when a hotkey changes. The helpers in this guide are optional, and each works on its own, so use only the ones your UI needs.

TanStack Hotkeys gives you two lists to build from, both created on an owner from `createHotkeysScope`:

- `createHotkeyRegistrations` returns the hotkeys registered right now, in its `hotkeys` property. It works with plain `createHotkey` and `createHotkeys`, but it only knows about owners that exist.
- `createAppHotkeyList` returns every [app hotkey](./app-hotkeys) you declared, in its `value` property, including hotkeys on pages that haven't rendered, with the status of each.

Start with registrations. Switch to app hotkeys when the cheat sheet should list shortcuts from the whole app, or when users can change them. Label each hotkey with `formatForDisplay`, covered in [Formatting & Display](./formatting-display).

## Name your hotkeys

A cheat sheet needs a name for each hotkey. Pass one in `meta`, with an optional description and group:

```ts
this.hotkeys.createHotkeys([
  {
    hotkey: 'Mod+S',
    callback: () => save(),
    options: { meta: { name: 'Save', group: 'File' } },
  },
  {
    hotkey: 'Mod+Shift+S',
    callback: () => saveAs(),
    options: { meta: { name: 'Save as', group: 'File' } },
  },
  {
    hotkey: ['G', 'H'],
    callback: () => goHome(),
    options: { meta: { name: 'Go home', group: 'Navigation' } },
  },
])
```

`meta` doesn't change how a hotkey behaves. Devtools show it too.

`meta` is typed as `HotkeyMeta`. To add fields of your own, such as an icon, extend it with declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}
```

## List the hotkeys on screen

`createHotkeyRegistrations` returns every registered hotkey, and updates when hotkeys register, unregister, or change. Show the ones with a name:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'

Alpine.data('shortcutList', () => {
  const hotkeys = createHotkeysScope()
  const registrations = hotkeys.createHotkeyRegistrations()

  return {
    formatForDisplay,
    get named() {
      return registrations.hotkeys.filter(
        (reg) => reg.options.meta?.name && reg.status === 'active',
      )
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<dl x-data="shortcutList">
  <template x-for="reg in named" :key="reg.id">
    <div>
      <dt x-text="reg.options.meta.name"></dt>
      <dd><kbd x-text="formatForDisplay(reg.hotkey)"></kbd></dd>
    </div>
  </template>
</dl>
```

Filtering by name leaves out hotkeys you didn't mean to list, such as a dialog's `Escape`. Filtering by `status` leaves only the hotkeys that are on right now.

`status` is `'active'` when the hotkey is enabled and its scope is active, `'suspended'` when its [scope](./hotkey-manager#activate-a-scope) is inactive or suspended by an exclusive scope, and `'disabled'` when it has `enabled: false`. `createHotkeyRegistrations` updates when scopes change, so the list stays current.

Each registration view has an `id`, the `hotkey`, a `status`, its `options` (including `meta`, `enabled`, and `scope`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedChord`, and sequence views add `parsedSequence` and `matchedStepCount`, the number of steps the user has pressed so far. [Show sequences in your UI](./sequences#show-sequences-in-your-ui) uses it to show which keys the user has pressed.

A hotkey that several components register, such as one per list row, appears once for each registration.

Registrations exist only while their owners exist, so this list can't show shortcuts from other pages. To list those, declare them as app hotkeys.

## List every app hotkey

`createAppHotkeyList` returns every app hotkey in declaration order, whether or not anything has registered it. Each item has the `appHotkey`, with its current `hotkey` and its `meta`, plus a `status` and `isCustom`, which is `true` when the user changed the hotkey:

```ts
Alpine.data('cheatSheet', () => {
  const hotkeys = createHotkeysScope()
  const items = hotkeys.createAppHotkeyList()

  return {
    formatForDisplay,
    get items() {
      return items.value
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<ul x-data="cheatSheet">
  <template x-for="item in items" :key="item.appHotkey.id">
    <li :data-status="item.status">
      <span x-text="item.appHotkey.meta?.name"></span>:
      <span x-text="item.appHotkey.hotkey ? formatForDisplay(item.appHotkey.hotkey) : 'Unassigned'"></span>
      <span x-show="item.isCustom">(custom)</span>
    </li>
  </template>
</ul>
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration |
| `'suspended'` | Has an enabled registration, but none in an active scope |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey, but nothing has registered it |
| `'unbound'` | No hotkey assigned |

`createAppHotkeyList` needs app hotkeys published with `provideAppHotkeys`. An app hotkey that many components register appears once, and its `registrations` array holds each live registration.

To also list hotkeys that aren't app hotkeys, combine both lists. Registrations of app hotkeys have `options.appHotkeyId` set, so skip those:

```ts
get undeclared() {
  return registrations.hotkeys.filter(
    (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
  )
},
```

## Group the list

Group rows by `meta.group`:

```ts
get groups() {
  const groups = [...new Set(items.value.map((item) => item.appHotkey.meta?.group))]
  return groups.map((group) => ({
    name: group ?? 'Other',
    items: items.value.filter((item) => item.appHotkey.meta?.group === group),
  }))
},
```

```html
<template x-for="group in groups" :key="group.name">
  <section>
    <h3 x-text="group.name"></h3>
    <ul>
      <template x-for="item in group.items" :key="item.appHotkey.id">
        <li>...</li>
      </template>
    </ul>
  </section>
</template>
```

To show keycaps, pass `parts: true` to `formatForDisplay` and render each part in its own `<kbd>`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Register a hotkey that opens the cheat sheet, and give the cheat sheet an exclusive scope. While it's open, the page's hotkeys pause, so a user who presses a shortcut while reading about it doesn't run it behind the dialog:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, getHotkeyManager } from '@tanstack/alpine-hotkeys'

// Declared with defineAppHotkeys:
// 'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } }

Alpine.data('app', () => ({
  isOpen: false,
  hotkeys: createHotkeysScope(),
  releaseScope: null as null | (() => void),
  init() {
    const appHotkeys = this.hotkeys.createAppHotkeys()

    this.hotkeys.createHotkey(
      () => appHotkeys.value['help.shortcuts'],
      () => this.open(),
    )
    this.hotkeys.createHotkeys(() => [
      { hotkey: 'Escape', callback: () => this.close() },
      // The page's registration pauses while the cheat sheet is open, so close from here
      { hotkey: appHotkeys.value['help.shortcuts'], callback: () => this.close() },
    ], { scope: 'cheat-sheet' })
  },
  open() {
    this.isOpen = true
    this.releaseScope = getHotkeyManager().activateScope('cheat-sheet', {
      exclusive: true,
    })
  },
  close() {
    this.isOpen = false
    this.releaseScope?.()
  },
  destroy() {
    this.releaseScope?.()
    this.hotkeys.destroy()
  },
}))
```

```html
<div x-data="app">
  <main>...</main>
  <div x-show="isOpen" role="dialog" aria-label="Keyboard shortcuts">
    <ul x-data="cheatSheet">...</ul>
  </div>
</div>
```

- The hotkey that opened the cheat sheet pauses with the rest of the page, so register it in the cheat sheet's scope too, as above, to close the cheat sheet with the same keys.
- `createAppHotkeyList` still lists every app hotkey. While the cheat sheet is open, the ones registered outside it report `'suspended'`, because they can't fire until it closes.
- To keep the page's hotkeys working while the cheat sheet is open, leave out `exclusive`. The cheat sheet's own hotkeys still win, because its scope activated most recently. See [Activate a scope](./hotkey-manager#activate-a-scope).

`?` is a common key for opening a cheat sheet. It's a single-key shortcut, so users need a way to turn it off or remap it. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

The [Kitchen Sink example](../examples/kitchen-sink) has a shortcut list built from live registrations.
