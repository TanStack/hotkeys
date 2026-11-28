---
title: Building a Keyboard Shortcut Cheat Sheet in Solid
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Solid from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

Build your cheat sheet directly from your registered or declared hotkeys so the help dialog never drifts out of sync when bindings change. Format each binding with `createFormatForDisplay` (see [Formatting & Display](./formatting-display)).

Each of these primitives covers a different cheat sheet setup:

- `createHotkeyRegistrations` returns the hotkeys registered right now from `createHotkey` and `createHotkeys`. It only knows about components that are rendered.
- `createAppHotkeyList` returns every [app hotkey](./app-hotkeys) you declared, including shortcuts on routes that haven't rendered yet.

Both return accessors. Start with `createHotkeyRegistrations` for smaller apps. Switch to `createAppHotkeyList` for an app-wide cheat sheet or user customization.

## Name your hotkeys

Add `meta` (`name`, plus optional `description` and `group`) to shortcuts you want displayed:

```tsx
createHotkeys([
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

`meta` doesn't affect key matching. It feeds your UI lists and shows up in devtools. To add custom fields like `icon`, augment `HotkeyMeta`:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}
```

Pass `meta` inline without memoizing it. TanStack Hotkeys compares its primitive fields (`string`, `number`, `boolean`) to decide when cheat sheet lists should update.

> [!NOTE]
> Don't mutate an existing `meta` object in place. Non-primitive fields (arrays, nested objects, JSX, or functions) don't trigger an update on their own, so if your UI renders one, change a primitive field like `name` or a version key alongside it.

## List the hotkeys on screen

`createHotkeyRegistrations` updates automatically as hotkeys register, unregister, or change scopes. Show the ones with a name:

```tsx
import { For } from 'solid-js'
import {
  createFormatForDisplay,
  createHotkeyRegistrations,
} from '@tanstack/solid-hotkeys'

function ShortcutList() {
  const formatForDisplay = createFormatForDisplay()
  const registrations = createHotkeyRegistrations()
  const named = () =>
    registrations().filter(
      (reg) => reg.options.meta?.name && reg.status === 'active',
    )

  return (
    <dl>
      <For each={named()}>
        {(reg) => (
          <div>
            <dt>{reg.options.meta?.name}</dt>
            <dd>
              <kbd>{formatForDisplay(reg.hotkey)}</kbd>
            </dd>
          </div>
        )}
      </For>
    </dl>
  )
}
```

Filtering by `meta?.name` omits unnamed helper shortcuts, such as a dialog's `Escape`. Checking `status === 'active'` hides paused shortcuts:

- `'active'` means the hotkey is enabled and nothing suspends it
- `'suspended'` means it is enabled, but its [scope](./hotkeys-provider-and-scopes) is inactive or suspended by an exclusive scope, or it is a document-level character key shortcut while [character keys are suspended](./accessibility#turn-them-off)
- `'disabled'` means `enabled: false` was set

Each entry also includes `id`, `hotkey`, `options`, `target`, and `triggerCount`. Chord entries (`kind === 'chord'`) add `parsedChord`, and sequence entries (`kind === 'sequence'`) add `parsedSequence` and `matchedStepCount` (used in [Show sequences in your UI](./sequences#show-sequences-in-your-ui)). If multiple mounted components register the same shortcut, such as rows in a list, each registration appears as its own entry.

## List every app hotkey

`createAppHotkeyList` returns every [app hotkey](./app-hotkeys) in declaration order, even when nothing has registered it yet. Each item includes its `status`, `isCustom` flag, and live `registrations` array, deduplicated to one row even if multiple components register the same ID:

```tsx
import { For } from 'solid-js'
import { createAppHotkeyList, createFormatForDisplay } from '@tanstack/solid-hotkeys'

function CheatSheet() {
  const formatForDisplay = createFormatForDisplay()
  const items = createAppHotkeyList()

  return (
    <ul>
      <For each={items()}>
        {({ appHotkey, status, isCustom }) => (
          <li data-status={status}>
            {appHotkey.meta?.name}:{' '}
            {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
            {isCustom && ' (custom)'}
          </li>
        )}
      </For>
    </ul>
  )
}
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one registration reports `'active'` |
| `'suspended'` | Enabled registrations exist, but none can fire: their scope is inactive, or character keys are suspended |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey assigned, but nothing has registered it yet |
| `'unbound'` | No hotkey assigned (`null`) |

`createAppHotkeyList` needs a `HotkeysProvider` with `appHotkeys`.

If you mix declared app hotkeys with local component hotkeys, combine both lists by filtering out registrations that already have `options.appHotkeyId`:

```tsx
const undeclared = () =>
  registrations().filter(
    (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
  )
```

## Group the list

Group items by `meta.group` for scannable sections:

```tsx
function CheatSheet() {
  const items = createAppHotkeyList()
  const groups = () => [
    ...new Set(items().map((item) => item.appHotkey.meta?.group)),
  ]

  return (
    <For each={groups()}>
      {(group) => (
        <section>
          <h3>{group ?? 'Other'}</h3>
          <ul>
            <For
              each={items().filter(
                (item) => item.appHotkey.meta?.group === group,
              )}
            >
              {({ appHotkey }) => <li>...</li>}
            </For>
          </ul>
        </section>
      )}
    </For>
  )
}
```

To style individual keys as separate `<kbd>` badges, pass `parts: true` to the function from `createFormatForDisplay`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Wrap your cheat sheet dialog in an `exclusive` scope so pressing a shortcut while reading the help list doesn't trigger actions behind the modal:

```tsx
import { Show, createSignal } from 'solid-js'
import {
  HotkeysProvider,
  createHotkey,
  createHotkeys,
  useAppHotkeys,
} from '@tanstack/solid-hotkeys'

// Declared with defineAppHotkeys:
// 'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } }

function App() {
  const appHotkeys = useAppHotkeys()
  const [isOpen, setIsOpen] = createSignal(false)

  createHotkey(() => appHotkeys()['help.shortcuts'], () => setIsOpen(true))

  return (
    <>
      <Main />
      <Show when={isOpen()}>
        <HotkeysProvider scope="cheat-sheet" exclusive>
          <CheatSheetDialog onClose={() => setIsOpen(false)} />
        </HotkeysProvider>
      </Show>
    </>
  )
}

function CheatSheetDialog(props: { onClose: () => void }) {
  const appHotkeys = useAppHotkeys()

  createHotkeys(() => [
    { hotkey: 'Escape', callback: () => props.onClose() },
    // Page hotkeys pause while exclusive is active, so register the toggle inside too
    { hotkey: appHotkeys()['help.shortcuts'], callback: () => props.onClose() },
  ])

  return (
    <div role="dialog" aria-label="Keyboard shortcuts">
      <CheatSheet />
    </div>
  )
}
```

A few details to keep in mind:

- Register the toggle hotkey inside the dialog as well so pressing the same keys closes it cleanly, since `exclusive` suspends the outer registration.
- `createAppHotkeyList` still lists every app hotkey while the dialog is open. Items registered outside it report `'suspended'`. To let background shortcuts keep working, omit `exclusive`. The cheat sheet's own hotkeys still win, because its scope is newer. See [Exclusive scopes](./hotkeys-provider-and-scopes#exclusive-scopes).

- Register the toggle hotkey inside the dialog as well so pressing the same keys closes it cleanly, since `exclusive` suspends the outer registration.
- `createAppHotkeyList` still shows every app hotkey while open. Items from the page behind it report `'suspended'`. To let background shortcuts keep working, omit `exclusive`. See [Exclusive scopes](./hotkeys-provider-and-scopes#exclusive-scopes).
- If you bind `?` to open your cheat sheet, remember single-key shortcuts need a way to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

See the [Kitchen Sink example](../examples/kitchen-sink) for a complete grouped cheat sheet with live statuses and rebinding.
