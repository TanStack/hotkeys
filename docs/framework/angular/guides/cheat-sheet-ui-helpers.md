---
title: Building a Keyboard Shortcut Cheat Sheet in Angular
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Angular from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

A cheat sheet lists the shortcuts users can press. Build it from the same hotkeys that handle the key presses, and it stays correct when a hotkey changes. The helpers in this guide are optional, and each works on its own, so use only the ones your UI needs.

TanStack Hotkeys gives you two lists to build from:

- `injectHotkeyRegistrations` returns the hotkeys registered right now. It works with plain `injectHotkey` and `injectHotkeys`, but it only knows about components that exist.
- `injectAppHotkeyList` returns every [app hotkey](./app-hotkeys) you declared, including hotkeys on pages that haven't rendered, with the status of each.

Both return signals. Start with registrations. Switch to app hotkeys when the cheat sheet should list shortcuts from the whole app, or when users can change them. Label each hotkey with `formatForDisplay`, covered in [Formatting & Display](./formatting-display).

## Name your hotkeys

A cheat sheet needs a name for each hotkey. Pass one in `meta`, with an optional description and group:

```ts
injectHotkeys([
  {
    hotkey: 'Mod+S',
    callback: () => this.save(),
    options: { meta: { name: 'Save', group: 'File' } },
  },
  {
    hotkey: 'Mod+Shift+S',
    callback: () => this.saveAs(),
    options: { meta: { name: 'Save as', group: 'File' } },
  },
  {
    hotkey: ['G', 'H'],
    callback: () => this.goHome(),
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

`injectHotkeyRegistrations` returns every registered hotkey, and updates when hotkeys register, unregister, or change. Show the ones with a name:

```ts
import { Component, computed } from '@angular/core'
import {
  formatForDisplay,
  injectHotkeyRegistrations,
} from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-list',
  template: `
    <dl>
      @for (reg of named(); track reg.id) {
        <div>
          <dt>{{ reg.options.meta?.name }}</dt>
          <dd><kbd>{{ format(reg.hotkey) }}</kbd></dd>
        </div>
      }
    </dl>
  `,
})
export class ShortcutListComponent {
  readonly format = formatForDisplay
  private readonly registrations = injectHotkeyRegistrations()
  readonly named = computed(() =>
    this.registrations().filter(
      (reg) => reg.options.meta?.name && reg.status === 'active',
    ),
  )
}
```

Filtering by name leaves out hotkeys you didn't mean to list, such as a dialog's `Escape`. Filtering by `status` leaves only the hotkeys that are on right now.

`status` is `'active'` when the hotkey is enabled and its scope is active, `'suspended'` when its [scope](./provide-hotkeys-and-scopes) is inactive or suspended by an exclusive scope, and `'disabled'` when it has `enabled: false`. `injectHotkeyRegistrations` updates when scopes change, so the list stays current.

Each registration view has an `id`, the `hotkey`, a `status`, its `options` (including `meta`, `enabled`, and `scope`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedChord`, and sequence views add `parsedSequence` and `matchedStepCount`, the number of steps the user has pressed so far. [Show sequences in your UI](./sequences#show-sequences-in-your-ui) uses it to show which keys the user has pressed.

A hotkey that several components register, such as one per list row, appears once for each registration.

Registrations exist only while their components exist, so this list can't show shortcuts from other pages. To list those, declare them as app hotkeys.

## List every app hotkey

`injectAppHotkeyList` returns every app hotkey in declaration order, whether or not anything has registered it. Each item has the `appHotkey`, with its current `hotkey` and its `meta`, plus a `status` and `isCustom`, which is `true` when the user changed the hotkey:

```ts
import { Component } from '@angular/core'
import { formatForDisplay, injectAppHotkeyList } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-cheat-sheet',
  template: `
    <ul>
      @for (item of items(); track item.appHotkey.id) {
        <li [attr.data-status]="item.status">
          {{ item.appHotkey.meta?.name }}:
          {{ item.appHotkey.hotkey ? format(item.appHotkey.hotkey) : 'Unassigned' }}
          @if (item.isCustom) { (custom) }
        </li>
      }
    </ul>
  `,
})
export class CheatSheetComponent {
  readonly items = injectAppHotkeyList()
  readonly format = formatForDisplay
}
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration |
| `'suspended'` | Has an enabled registration, but none in an active scope |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey, but nothing has registered it |
| `'unbound'` | No hotkey assigned |

`injectAppHotkeyList` needs `provideHotkeys` with `appHotkeys`. An app hotkey that many components register appears once, and its `registrations` array holds each live registration.

To also list hotkeys that aren't app hotkeys, combine both lists. Registrations of app hotkeys have `options.appHotkeyId` set, so skip those:

```ts
readonly undeclared = computed(() =>
  this.registrations().filter(
    (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
  ),
)
```

## Group the list

Group rows by `meta.group`:

```ts
@Component({
  selector: 'app-cheat-sheet',
  template: `
    @for (group of groups(); track group) {
      <section>
        <h3>{{ group ?? 'Other' }}</h3>
        <ul>
          @for (item of itemsIn(group); track item.appHotkey.id) {
            <li>...</li>
          }
        </ul>
      </section>
    }
  `,
})
export class CheatSheetComponent {
  readonly items = injectAppHotkeyList()
  readonly groups = computed(() => [
    ...new Set(this.items().map((item) => item.appHotkey.meta?.group)),
  ])

  itemsIn(group: string | undefined) {
    return this.items().filter((item) => item.appHotkey.meta?.group === group)
  }
}
```

To show keycaps, pass `parts: true` to `formatForDisplay` and render each part in its own `<kbd>`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Register a hotkey that opens the cheat sheet, and give the cheat sheet an exclusive scope. While it's open, the page's hotkeys pause, so a user who presses a shortcut while reading about it doesn't run it behind the dialog:

```ts
import { Component, output, signal } from '@angular/core'
import {
  injectAppHotkeys,
  injectHotkey,
  injectHotkeys,
  provideHotkeys,
} from '@tanstack/angular-hotkeys'

// Declared with defineAppHotkeys:
// 'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } }

@Component({
  selector: 'app-cheat-sheet-dialog',
  providers: [provideHotkeys({ scope: 'cheat-sheet', exclusive: true })],
  imports: [CheatSheetComponent],
  template: `
    <div role="dialog" aria-label="Keyboard shortcuts">
      <app-cheat-sheet />
    </div>
  `,
})
export class CheatSheetDialog {
  readonly close = output()
  readonly appHotkeys = injectAppHotkeys()

  constructor() {
    injectHotkeys(() => [
      { hotkey: 'Escape', callback: () => this.close.emit() },
      // The page's registration pauses while the cheat sheet is open, so close from here
      { hotkey: this.appHotkeys()['help.shortcuts'], callback: () => this.close.emit() },
    ])
  }
}

@Component({
  selector: 'app-root',
  imports: [CheatSheetDialog],
  template: `
    <app-main />
    @if (isOpen()) {
      <app-cheat-sheet-dialog (close)="isOpen.set(false)" />
    }
  `,
})
export class AppComponent {
  readonly appHotkeys = injectAppHotkeys()
  readonly isOpen = signal(false)

  constructor() {
    injectHotkey(() => this.appHotkeys()['help.shortcuts'], () => this.isOpen.set(true))
  }
}
```

- The hotkey that opened the cheat sheet pauses with the rest of the page, so register it inside the dialog too, as above, to close the cheat sheet with the same keys.
- `injectAppHotkeyList` still lists every app hotkey. While the cheat sheet is open, the ones registered outside it report `'suspended'`, because they can't fire until it closes.
- To keep the page's hotkeys working while the cheat sheet is open, leave out `exclusive`. The cheat sheet's own hotkeys still win, because its scope is newer. See [Exclusive scopes](./provide-hotkeys-and-scopes#exclusive-scopes).

`?` is a common key for opening a cheat sheet. It's a single-key shortcut, so users need a way to turn it off or remap it. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

The [Kitchen Sink example](../examples/kitchen-sink) has a shortcut list built from live registrations.
