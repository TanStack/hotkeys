---
title: Building a Keyboard Shortcut Cheat Sheet in Preact
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Preact from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

Build your cheat sheet directly from your registered or declared hotkeys so the help dialog never drifts out of sync when bindings change. Format each binding with `useFormatForDisplay` (see [Formatting & Display](./formatting-display)).

Each of these hooks covers a different cheat sheet setup:

- `useHotkeyRegistrations()` returns currently mounted registrations from `useHotkey` and `useHotkeys`.
- `useAppHotkeyList()` returns every [app hotkey](./app-hotkeys) you declared, including shortcuts on routes that haven't mounted yet.

Start with `useHotkeyRegistrations` for smaller apps. Switch to `useAppHotkeyList` for an app-wide cheat sheet or user customization.

## Name your hotkeys

Add `meta` (`name`, plus optional `description` and `group`) to shortcuts you want displayed:

```tsx
useHotkeys([
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
    callback: () => navigate({ to: '/' }),
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

Pass `meta` inline without memoizing it. TanStack Hotkeys compares its primitive fields (`string`, `number`, `boolean`) to decide when cheat sheet lists should re-render.

> [!NOTE]
> Don't mutate an existing `meta` object in place. Non-primitive fields (arrays, nested objects, JSX, or functions) update without triggering a re-render on their own, so if your UI renders one, change a primitive field like `name` or a version key alongside it.

## List the hotkeys on screen

`useHotkeyRegistrations()` subscribes to active registrations and updates automatically as components mount, unmount, or change scopes:

```tsx
import {
  useFormatForDisplay,
  useHotkeyRegistrations,
} from '@tanstack/preact-hotkeys'

function ShortcutList() {
  const formatForDisplay = useFormatForDisplay()
  const registrations = useHotkeyRegistrations().filter(
    (reg) => reg.options.meta?.name && reg.status === 'active',
  )

  return (
    <dl>
      {registrations.map((reg) => (
        <div key={reg.id}>
          <dt>{reg.options.meta?.name}</dt>
          <dd>
            <kbd>{formatForDisplay(reg.hotkey)}</kbd>
          </dd>
        </div>
      ))}
    </dl>
  )
}
```

Filtering by `meta?.name` omits unnamed helper shortcuts, such as a dialog's `Escape`. Checking `status === 'active'` hides paused shortcuts:

- `'active'` means the hotkey is enabled and in an active scope
- `'suspended'` means it is enabled, but its [scope](./hotkeys-provider-and-scopes) is inactive or suspended by an exclusive scope, or it is a character key shortcut while [character keys are suspended](./accessibility#turn-them-off)
- `'disabled'` means `enabled: false` was set

Each entry also includes `id`, `hotkey`, `options`, `target`, and `triggerCount`. Chord entries (`kind === 'chord'`) add `parsedChord`, and sequence entries (`kind === 'sequence'`) add `parsedSequence` and `matchedStepCount` (used in [Show sequences in your UI](./sequences#show-sequences-in-your-ui)). If multiple mounted components register the same shortcut, such as rows in a list, each registration appears as its own entry.

## List every app hotkey

`useAppHotkeyList()` returns every [app hotkey](./app-hotkeys) in declaration order, even when nothing has mounted it yet. Each item includes its `status`, `isCustom` flag, and live `registrations` array, deduplicated to one row even if multiple components register the same ID:

```tsx
import { useAppHotkeyList, useFormatForDisplay } from '@tanstack/preact-hotkeys'

function CheatSheet() {
  const formatForDisplay = useFormatForDisplay()
  const items = useAppHotkeyList()

  return (
    <ul>
      {items.map(({ appHotkey, status, isCustom }) => (
        <li key={appHotkey.id} data-status={status}>
          {appHotkey.meta?.name}:{' '}
          {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
          {isCustom && ' (custom)'}
        </li>
      ))}
    </ul>
  )
}
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration in an active scope |
| `'suspended'` | Enabled registrations exist, but none can fire: their scope is inactive, or character keys are suspended |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey assigned, but no component has registered it yet |
| `'unbound'` | No hotkey assigned (`null`) |

`useAppHotkeyList` reads declarations from `HotkeysProvider`, so mount a provider with `appHotkeys` above it. If you mix declared app hotkeys with local component hotkeys, combine both lists by filtering out registrations that already have `options.appHotkeyId`:

```tsx
const undeclared = useHotkeyRegistrations().filter(
  (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
)
```

## Group the list

Group items by `meta.group` for scannable sections:

```tsx
function CheatSheet() {
  const items = useAppHotkeyList()
  const groups = [...new Set(items.map((item) => item.appHotkey.meta?.group))]

  return groups.map((group) => (
    <section key={group ?? 'other'}>
      <h3>{group ?? 'Other'}</h3>
      <ul>
        {items
          .filter((item) => item.appHotkey.meta?.group === group)
          .map(({ appHotkey }) => (
            <li key={appHotkey.id}>...</li>
          ))}
      </ul>
    </section>
  ))
}
```

To style individual keys as separate `<kbd>` badges, pass `parts: true` to `formatForDisplay`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Wrap your cheat sheet dialog in an `exclusive` scope so pressing a shortcut while reading the help list doesn't trigger actions behind the modal:

```tsx
import { useState } from 'preact/hooks'
import {
  HotkeysProvider,
  useAppHotkeys,
  useHotkey,
  useHotkeys,
} from '@tanstack/preact-hotkeys'

// Declared with defineAppHotkeys:
// 'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } }

function App() {
  const appHotkeys = useAppHotkeys()
  const [isOpen, setIsOpen] = useState(false)

  useHotkey(appHotkeys['help.shortcuts'], () => setIsOpen(true))

  return (
    <>
      <Main />
      {isOpen && (
        <HotkeysProvider scope="cheat-sheet" exclusive>
          <CheatSheetDialog onClose={() => setIsOpen(false)} />
        </HotkeysProvider>
      )}
    </>
  )
}

function CheatSheetDialog({ onClose }: { onClose: () => void }) {
  const appHotkeys = useAppHotkeys()

  useHotkeys([
    { hotkey: 'Escape', callback: onClose },
    // Page hotkeys pause while exclusive is active, so register toggle inside too
    { hotkey: appHotkeys['help.shortcuts'], callback: onClose },
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
- `useAppHotkeyList` still shows every app hotkey while open. Items from the page behind it report `'suspended'`. To let background shortcuts keep working, omit `exclusive`. See [Exclusive scopes](./hotkeys-provider-and-scopes#exclusive-scopes).
- If you bind `?` to open your cheat sheet, remember single-key shortcuts need a way to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

See the [Kitchen Sink example](../examples/kitchen-sink) for a complete grouped cheat sheet with live statuses and rebinding.
