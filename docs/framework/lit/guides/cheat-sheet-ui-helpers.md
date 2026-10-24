---
title: Building a Keyboard Shortcut Cheat Sheet in Lit
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Lit from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

A cheat sheet lists the shortcuts users can press. Build it from the same hotkeys that handle the key presses, and it stays correct when a hotkey changes. The helpers in this guide are optional, and each works on its own, so use only the ones your UI needs.

TanStack Hotkeys gives you two lists to build from:

- `HotkeyRegistrationsController` holds the hotkeys registered right now. It works with plain `@hotkey` and `HotkeyController`, but it only knows about connected elements.
- `AppHotkeysController` lists every [app hotkey](./app-hotkeys) you declared, including hotkeys on pages that haven't rendered, with the status of each.

Start with registrations. Switch to app hotkeys when the cheat sheet should list shortcuts from the whole app, or when users can change them. Label each hotkey with `formatForDisplay`, covered in [Formatting & Display](./formatting-display).

## Name your hotkeys

A cheat sheet needs a name for each hotkey. Pass one in `meta`, with an optional description and group:

```ts
@hotkey('Mod+S', { meta: { name: 'Save', group: 'File' } })
save() {}

@hotkey('Mod+Shift+S', { meta: { name: 'Save as', group: 'File' } })
saveAs() {}

@hotkey(['G', 'H'], { meta: { name: 'Go home', group: 'Navigation' } })
goHome() {}
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

`HotkeyRegistrationsController` holds every registered hotkey in its `hotkeys` property, and updates its element when hotkeys register, unregister, or change. Show the ones with a name:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  HotkeyRegistrationsController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'

@customElement('shortcut-list')
class ShortcutList extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    const named = this.registrations.hotkeys.filter(
      (reg) => reg.options.meta?.name && reg.status === 'active',
    )

    return html`<dl>
      ${named.map(
        (reg) => html`
          <div>
            <dt>${reg.options.meta?.name}</dt>
            <dd><kbd>${formatForDisplay(reg.hotkey)}</kbd></dd>
          </div>
        `,
      )}
    </dl>`
  }
}
```

Filtering by name leaves out hotkeys you didn't mean to list, such as a dialog's `Escape`. Filtering by `status` leaves only the hotkeys that can fire right now.

`status` is `'active'` when the hotkey can fire, `'suspended'` when its [scope](./hotkey-manager#activate-a-scope) is inactive or suspended by an exclusive scope, and `'disabled'` when it has `enabled: false`. `HotkeyRegistrationsController` updates when scopes change, so the list stays current.

Each registration view has an `id`, the `hotkey`, a `status`, its `options` (including `meta`, `enabled`, and `scope`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedChord`, and sequence views add `parsedSequence` and `matchedStepCount`, the number of steps the user has pressed so far. [Show sequences in your UI](./sequences#show-sequences-in-your-ui) uses it to show which keys the user has pressed.

A hotkey that several elements register, such as one per list row, appears once for each registration.

Registrations exist only while their elements are connected, so this list can't show shortcuts from other pages. To list those, declare them as app hotkeys.

## List every app hotkey

`AppHotkeysController.list` holds every app hotkey in declaration order, whether or not anything has registered it. Each item has the `appHotkey`, with its current `hotkey` and its `meta`, plus a `status` and `isCustom`, which is `true` when the user changed the hotkey:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { AppHotkeysController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('cheat-sheet')
class CheatSheet extends LitElement {
  private app = new AppHotkeysController(this)

  render() {
    return html`<ul>
      ${this.app.list.map(
        ({ appHotkey, status, isCustom }) => html`
          <li data-status=${status}>
            ${appHotkey.meta?.name}:
            ${appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
            ${isCustom ? '(custom)' : ''}
          </li>
        `,
      )}
    </ul>`
  }
}
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration |
| `'suspended'` | Has an enabled registration, but none in an active scope |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey, but nothing has registered it |
| `'unbound'` | No hotkey assigned |

`AppHotkeysController` needs app hotkeys published with `provideAppHotkeys`. An app hotkey that many elements register appears once, and its `registrations` array holds each live registration.

To also list hotkeys that aren't app hotkeys, combine both lists. Registrations of app hotkeys have `options.appHotkeyId` set, so skip those:

```ts
const undeclared = this.registrations.hotkeys.filter(
  (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
)
```

## Group the list

Group rows by `meta.group`:

```ts
render() {
  const items = this.app.list
  const groups = [...new Set(items.map((item) => item.appHotkey.meta?.group))]

  return groups.map(
    (group) => html`
      <section>
        <h3>${group ?? 'Other'}</h3>
        <ul>
          ${items
            .filter((item) => item.appHotkey.meta?.group === group)
            .map(() => html`<li>...</li>`)}
        </ul>
      </section>
    `,
  )
}
```

To show keycaps, pass `parts: true` to `formatForDisplay` and render each part in its own `<kbd>`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Register a hotkey that opens the cheat sheet, and give the cheat sheet an exclusive scope. While it's open, the page's hotkeys pause, so a user who presses a shortcut while reading about it doesn't run it behind the dialog:

```ts
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { getHotkeyManager, hotkey } from '@tanstack/lit-hotkeys'
import { appHotkeys } from './app-hotkeys'

// Declared with defineAppHotkeys:
// 'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } }

@customElement('my-app')
class MyApp extends LitElement {
  @state() private isOpen = false

  @hotkey(appHotkeys['help.shortcuts'])
  openCheatSheet() {
    this.isOpen = true
  }

  render() {
    return html`
      <main-view></main-view>
      ${this.isOpen
        ? html`<cheat-sheet-dialog @close=${() => (this.isOpen = false)}></cheat-sheet-dialog>`
        : ''}
    `
  }
}

@customElement('cheat-sheet-dialog')
class CheatSheetDialog extends LitElement {
  private releaseScope?: () => void

  connectedCallback() {
    super.connectedCallback()
    this.releaseScope = getHotkeyManager().activateScope('cheat-sheet', {
      exclusive: true,
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.releaseScope?.()
  }

  @hotkey('Escape', { scope: 'cheat-sheet' })
  closeOnEscape() {
    this.close()
  }

  // The page's registration pauses while the cheat sheet is open, so close from here
  @hotkey(appHotkeys['help.shortcuts'], { scope: 'cheat-sheet' })
  closeOnToggle() {
    this.close()
  }

  close() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    return html`<div role="dialog" aria-label="Keyboard shortcuts">
      <cheat-sheet></cheat-sheet>
    </div>`
  }
}
```

- The hotkey that opened the cheat sheet pauses with the rest of the page, so register it inside the dialog too, as above, to close the cheat sheet with the same keys.
- `AppHotkeysController.list` still lists every app hotkey. While the cheat sheet is open, the ones registered outside it report `'suspended'`, because they can't fire until it closes.
- To keep the page's hotkeys working while the cheat sheet is open, leave out `exclusive`. The cheat sheet's own hotkeys still win, because its scope activated most recently. See [Activate a scope](./hotkey-manager#activate-a-scope).

`?` is a common key for opening a cheat sheet. It's a single-key shortcut, so users need a way to turn it off or remap it. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

The [Kitchen Sink example](../examples/kitchen-sink) has a shortcut list built from live registrations.
