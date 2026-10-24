---
title: Building a Keyboard Shortcut Cheat Sheet in Ember
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Ember from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

A cheat sheet lists the shortcuts users can press. Build it from the same hotkeys that handle the key presses, and it stays correct when a hotkey changes. The helpers in this guide are optional, and each works on its own, so use only the ones your UI needs.

TanStack Hotkeys gives you two lists to build from:

- `useHotkeyRegistrations` returns the hotkeys registered right now, in its `hotkeys` property. It works with plain `useHotkey` and `useHotkeys`, but it only knows about rendered helpers.
- `useAppHotkeyList` returns every [app hotkey](./app-hotkeys) you declared, in its `value` property, including hotkeys on pages that haven't rendered, with the status of each.

Pass the component as the owner of each one. Start with registrations. Switch to app hotkeys when the cheat sheet should list shortcuts from the whole app, or when users can change them. Label each hotkey with `formatForDisplay`, covered in [Formatting & Display](./formatting-display).

## Name your hotkeys

A cheat sheet needs a name for each hotkey. Pass one in `meta`, with an optional description and group:

```ts
shortcuts: Array<EmberHotkeyDefinition> = [
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
]
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

`useHotkeyRegistrations` returns every registered hotkey, and updates when hotkeys register, unregister, or change. Show the ones with a name:

```gts
import Component from '@glimmer/component'
import {
  formatForDisplay,
  useHotkeyRegistrations,
} from '@tanstack/ember-hotkeys'

export default class ShortcutList extends Component {
  registrations = useHotkeyRegistrations(this)

  get named() {
    return this.registrations.hotkeys.filter(
      (reg) => reg.options.meta?.name && reg.status === 'active',
    )
  }

  <template>
    <dl>
      {{#each this.named key='id' as |reg|}}
        <div>
          <dt>{{reg.options.meta.name}}</dt>
          <dd><kbd>{{formatForDisplay reg.hotkey}}</kbd></dd>
        </div>
      {{/each}}
    </dl>
  </template>
}
```

Filtering by name leaves out hotkeys you didn't mean to list, such as a dialog's `Escape`. Filtering by `status` leaves only the hotkeys that can fire right now.

`status` is `'active'` when the hotkey can fire, `'suspended'` when its [scope](./hotkey-manager#activate-a-scope) is inactive or suspended by an exclusive scope, and `'disabled'` when it has `enabled: false`. `useHotkeyRegistrations` updates when scopes change, so the list stays current.

Each registration view has an `id`, the `hotkey`, a `status`, its `options` (including `meta`, `enabled`, and `scope`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedChord`, and sequence views add `parsedSequence` and `matchedStepCount`, the number of steps the user has pressed so far. [Show sequences in your UI](./sequences#show-sequences-in-your-ui) uses it to show which keys the user has pressed.

A hotkey that several components register, such as one per list row, appears once for each registration.

Registrations exist only while their helpers are rendered, so this list can't show shortcuts from other pages. To list those, declare them as app hotkeys.

## List every app hotkey

`useAppHotkeyList` returns every app hotkey in declaration order, whether or not anything has registered it. Each item has the `appHotkey`, with its current `hotkey` and its `meta`, plus a `status` and `isCustom`, which is `true` when the user changed the hotkey:

```gts
import Component from '@glimmer/component'
import { formatForDisplay, useAppHotkeyList } from '@tanstack/ember-hotkeys'
import type { AppHotkey } from '@tanstack/ember-hotkeys'

const label = (appHotkey: AppHotkey) =>
  appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'

export default class CheatSheet extends Component {
  items = useAppHotkeyList(this)

  <template>
    <ul>
      {{#each this.items.value key='appHotkey.id' as |item|}}
        <li data-status={{item.status}}>
          {{item.appHotkey.meta.name}}: {{label item.appHotkey}}
          {{#if item.isCustom}}(custom){{/if}}
        </li>
      {{/each}}
    </ul>
  </template>
}
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration |
| `'suspended'` | Has an enabled registration, but none in an active scope |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey, but nothing has registered it |
| `'unbound'` | No hotkey assigned |

`useAppHotkeyList` needs app hotkeys published with `provideAppHotkeys`. An app hotkey that many components register appears once, and its `registrations` array holds each live registration.

To also list hotkeys that aren't app hotkeys, combine both lists. Registrations of app hotkeys have `options.appHotkeyId` set, so skip those:

```ts
get undeclared() {
  return this.registrations.hotkeys.filter(
    (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
  )
}
```

## Group the list

Group rows by `meta.group`:

```gts
export default class CheatSheet extends Component {
  items = useAppHotkeyList(this)

  get groups() {
    const items = this.items.value
    const groups = [...new Set(items.map((item) => item.appHotkey.meta?.group))]
    return groups.map((group) => ({
      name: group ?? 'Other',
      items: items.filter((item) => item.appHotkey.meta?.group === group),
    }))
  }

  <template>
    {{#each this.groups key='name' as |group|}}
      <section>
        <h3>{{group.name}}</h3>
        <ul>
          {{#each group.items key='appHotkey.id' as |item|}}
            <li>...</li>
          {{/each}}
        </ul>
      </section>
    {{/each}}
  </template>
}
```

To show keycaps, pass `parts: true` to `formatForDisplay` and render each part in its own `<kbd>`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Register a hotkey that opens the cheat sheet, and give the cheat sheet an exclusive scope. While it's open, the page's hotkeys pause, so a user who presses a shortcut while reading about it doesn't run it behind the dialog:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { registerDestructor } from '@ember/destroyable'
import { getHotkeyManager, useAppHotkeys, useHotkey, useHotkeys } from '@tanstack/ember-hotkeys'
import type Owner from '@ember/owner'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

// Declared with defineAppHotkeys:
// 'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } }

class CheatSheetDialog extends Component<{ Args: { onClose: () => void } }> {
  appHotkeys = useAppHotkeys(this)

  constructor(owner: Owner, args: { onClose: () => void }) {
    super(owner, args)
    const releaseScope = getHotkeyManager().activateScope('cheat-sheet', {
      exclusive: true,
    })
    registerDestructor(this, releaseScope)
  }

  get shortcuts(): Array<EmberHotkeyDefinition> {
    return [
      { hotkey: 'Escape', callback: () => this.args.onClose() },
      // The page's registration pauses while the cheat sheet is open, so close from here
      { hotkey: this.appHotkeys.value['help.shortcuts'], callback: () => this.args.onClose() },
    ]
  }

  <template>
    {{useHotkeys this.shortcuts scope='cheat-sheet'}}
    <div role="dialog" aria-label="Keyboard shortcuts">
      <CheatSheet />
    </div>
  </template>
}

export default class App extends Component {
  @tracked isOpen = false
  appHotkeys = useAppHotkeys(this)

  get helpHotkey() {
    return this.appHotkeys.value['help.shortcuts']
  }
  open = () => (this.isOpen = true)
  close = () => (this.isOpen = false)

  <template>
    {{useHotkey this.helpHotkey this.open}}
    <Main />
    {{#if this.isOpen}}
      <CheatSheetDialog @onClose={{this.close}} />
    {{/if}}
  </template>
}
```

- The hotkey that opened the cheat sheet pauses with the rest of the page, so register it inside the dialog too, as above, to close the cheat sheet with the same keys.
- `useAppHotkeyList` still lists every app hotkey. While the cheat sheet is open, the ones registered outside it report `'suspended'`, because they can't fire until it closes.
- To keep the page's hotkeys working while the cheat sheet is open, leave out `exclusive`. The cheat sheet's own hotkeys still win, because its scope activated most recently. See [Activate a scope](./hotkey-manager#activate-a-scope).

`?` is a common key for opening a cheat sheet. It's a single-key shortcut, so users need a way to turn it off or remap it. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

The [Kitchen Sink example](../examples/kitchen-sink) has a shortcut list built from live registrations.
