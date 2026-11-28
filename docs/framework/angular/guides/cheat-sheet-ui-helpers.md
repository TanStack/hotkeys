---
title: Building a Keyboard Shortcut Cheat Sheet in Angular
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Angular from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

Build your cheat sheet directly from your registered or declared hotkeys so the help dialog never drifts out of sync when bindings change. Format each binding with `injectFormatForDisplay` (see [Formatting & Display](./formatting-display)).

Two APIs cover different cheat sheet setups:

- `injectHotkeyRegistrations()` returns registrations from `injectHotkey` and `injectHotkeys` for the components that exist right now.
- `injectAppHotkeyList()` returns every [app hotkey](./app-hotkeys) you declared, including shortcuts on routes that haven't rendered yet.

Both return signals. Start with `injectHotkeyRegistrations` for smaller apps. Switch to `injectAppHotkeyList` for an app-wide cheat sheet or user customization.

## Name your hotkeys

Add `meta` (`name`, plus optional `description` and `group`) to shortcuts to display:

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

`meta` doesn't affect key matching. It feeds your UI lists and shows up in devtools. To add custom fields like `icon`, augment `HotkeyMeta`:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}
```

Pass `meta` inline without memoizing it. TanStack Hotkeys compares its primitive fields (`string`, `number`, `boolean`) to decide when cheat sheet lists update.

> [!NOTE]
> Don't mutate an existing `meta` object in place. Non-primitive fields (arrays, nested objects, elements, or functions) update without triggering a list update on their own, so if your UI renders one, change a primitive field like `name` alongside it.

## List the hotkeys on screen

`injectHotkeyRegistrations()` subscribes to active registrations and updates automatically as components are created or destroyed, or change scopes:

```ts
import { Component, computed } from '@angular/core'
import {
  injectFormatForDisplay,
  injectHotkeyRegistrations,
} from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-list',
  template: `
    <dl>
      @for (reg of named(); track reg.id) {
        <div>
          <dt>{{ reg.options.meta?.name }}</dt>
          <dd><kbd>{{ formatForDisplay(reg.hotkey) }}</kbd></dd>
        </div>
      }
    </dl>
  `,
})
export class ShortcutListComponent {
  readonly formatForDisplay = injectFormatForDisplay()
  private readonly registrations = injectHotkeyRegistrations()
  readonly named = computed(() =>
    this.registrations().filter(
      (reg) => reg.options.meta?.name && reg.status === 'active',
    ),
  )
}
```

Filtering by `meta?.name` omits unnamed helper shortcuts, such as a dialog's `Escape`. Checking `status === 'active'` hides paused shortcuts:

- `'active'` means the hotkey is enabled and in an active scope
- `'suspended'` means it is enabled, but its [scope](./provide-hotkeys-and-scopes) is inactive or suspended by an exclusive scope, or it is a character key shortcut while [character keys are suspended](./accessibility#turn-them-off)
- `'disabled'` means `enabled: false` was set

Each entry also includes `id`, `hotkey`, `options`, `target`, and `triggerCount`. Chord entries (`kind === 'chord'`) add `parsedChord`, and sequence entries (`kind === 'sequence'`) add `parsedSequence` and `matchedStepCount` (used in [Show sequences in your UI](./sequences#show-sequences-in-your-ui)). If several components register the same shortcut, such as rows in a list, each registration appears as its own entry.

## List every app hotkey

`injectAppHotkeyList()` returns every [app hotkey](./app-hotkeys) in declaration order, even when nothing has registered it yet. Each item includes its `status`, `isCustom` flag, and live `registrations` array, deduplicated to one row even if several components register the same ID:

```ts
import { Component } from '@angular/core'
import { injectAppHotkeyList, injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-cheat-sheet',
  template: `
    <ul>
      @for (item of items(); track item.appHotkey.id) {
        <li [attr.data-status]="item.status">
          {{ item.appHotkey.meta?.name }}:
          {{ item.appHotkey.hotkey ? formatForDisplay(item.appHotkey.hotkey) : 'Unassigned' }}
          @if (item.isCustom) { (custom) }
        </li>
      }
    </ul>
  `,
})
export class CheatSheetComponent {
  readonly items = injectAppHotkeyList()
  readonly formatForDisplay = injectFormatForDisplay()
}
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration in an active scope |
| `'suspended'` | Enabled registrations exist, but none can fire: their scope is inactive, or character keys are suspended |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey assigned, but no component has registered it yet |
| `'unbound'` | No hotkey assigned (`null`) |

`injectAppHotkeyList` needs `provideHotkeys` with `appHotkeys`. An app hotkey that many components register appears once, and its `registrations` array holds each live registration.

If you mix declared app hotkeys with local component hotkeys, combine both lists by filtering out registrations that already have `options.appHotkeyId`:

```ts
readonly undeclared = computed(() =>
  this.registrations().filter(
    (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
  ),
)
```

## Group the list

Group items by `meta.group` for scannable sections:

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

To style individual keys as separate `<kbd>` badges, pass `parts: true` to the function from `injectFormatForDisplay`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Wrap your cheat sheet dialog in an `exclusive` scope so pressing a shortcut while reading the help list doesn't trigger actions behind the modal:

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

A few details to keep in mind:

- Register the toggle hotkey inside the dialog as well so pressing the same keys closes it cleanly, since `exclusive` suspends the outer registration.
- `injectAppHotkeyList` still shows every app hotkey while the dialog is open. Items from the page behind it report `'suspended'`. To let background shortcuts keep working, omit `exclusive`. See [Exclusive scopes](./provide-hotkeys-and-scopes#exclusive-scopes).
- When binding `?` to open your cheat sheet, remember that single-key shortcuts need a way to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

See the [Kitchen Sink example](../examples/kitchen-sink) for a complete grouped cheat sheet with live statuses and rebinding.
