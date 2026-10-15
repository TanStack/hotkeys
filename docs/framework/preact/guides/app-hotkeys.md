---
title: App Hotkeys Guide
id: app-hotkeys
---

`useHotkey` registers a hotkey when its component mounts. A cheat sheet built from live registrations therefore misses hotkeys on routes that have not rendered yet, and a settings screen has nowhere to change them. App hotkeys solve both: you declare every hotkey in one place, pass the declarations to `HotkeysProvider`, and attach callbacks where the work happens. Users can then customize any of them, and your app decides how to save their choices.

A declaration holds a hotkey's id, default hotkey, metadata, and options. It never holds a callback. `useHotkey` and `useHotkeys` still attach the callbacks.

## Declare app hotkeys

Use `defineAppHotkeys` in a module that contains only declarations. Keep it free of components and handlers, because it loads with your app shell:

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/preact-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save', group: 'Document' } },
  'doc.find': {
    hotkey: 'Mod+F',
    meta: { name: 'Find', group: 'Document' },
    context: 'editor',
  },
  'nav.home': {
    hotkey: ['G', 'H'],
    meta: { name: 'Go home', group: 'Navigation' },
    options: { timeout: 800 },
  },
  'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
})

declare module '@tanstack/preact-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

- The object key is the app hotkey's id. Treat ids as a stable contract, because saved custom hotkeys use them as keys.
- `hotkey` is the default: a chord, a sequence, or `null` for an action without a default. An unbound app hotkey registers nothing until the user assigns one.
- `options` describe the hotkey itself: `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for a chord default or `timeout` for a sequence default. Options that don't match the default's kind are type errors. Pass `target` and `enabled` where you register the hotkey.
- `context` labels where a hotkey applies, such as `'editor'`. App hotkeys with different contexts may share a hotkey. It is used only for conflict checks and does not affect matching.

The `Register` augmentation types `useAppHotkeys()`, the ids accepted by `useCustomHotkeys()`, and the `CustomHotkeys` type.

## Provide app hotkeys

Pass the declarations to `HotkeysProvider`:

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import { appHotkeys } from './app-hotkeys'

function Root() {
  return (
    <HotkeysProvider appHotkeys={appHotkeys}>
      <App />
    </HotkeysProvider>
  )
}
```

## Register app hotkeys

Pass an app hotkey wherever you pass a hotkey. Read it from `useAppHotkeys()`, or import it directly:

```tsx
import { useAppHotkeys, useHotkey } from '@tanstack/preact-hotkeys'

function Editor() {
  const hotkeys = useAppHotkeys()

  useHotkey(hotkeys['doc.save'], () => save(), { enabled: isDirty })
  useHotkey(hotkeys['nav.home'], () => navigate({ to: '/' }))
}
```

Both forms use the provider's effective hotkey for that id, so a user's custom hotkey applies even to a direct import. Without a provider, the declared default is used.

The registration takes `meta` and `options` from the declaration. Options merge in this order: provider `defaultOptions`, then declared options, then call-site options. `meta` comes only from the declaration, so the cheat sheet and the registration cannot disagree. Call-site options are typed by the declared default's kind, so `timeout` is accepted for `nav.home` but not for `doc.save`.

`useHotkeys` accepts app hotkeys in the same field:

```tsx
useHotkeys([
  { hotkey: hotkeys['doc.save'], callback: save },
  { hotkey: 'Escape', callback: close },
])
```

When the user changes a hotkey, registered app hotkeys move to the new hotkey immediately, even if it changes from a chord to a sequence.

## Build a cheat sheet

`useAppHotkeyList` returns every app hotkey in declaration order, with its live status:

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey, but nothing has registered it |
| `'unbound'` | No hotkey assigned |

```tsx
import { formatForDisplay, useAppHotkeyList } from '@tanstack/preact-hotkeys'

function CheatSheet() {
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

An app hotkey registered by many components, such as one per list row, appears once. Its `registrations` array holds each live registration. Devtools also list declared app hotkeys that are not registered.

## Customize and persist hotkeys

TanStack Hotkeys does not store anything. Pass the user's saved custom hotkeys to the provider and save them when they change:

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import type { CustomHotkeys } from '@tanstack/preact-hotkeys'

const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')

function Root() {
  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={saved}
      onCustomHotkeysChange={(custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom))
      }
    >
      <App />
    </HotkeysProvider>
  )
}
```

- `customHotkeys` holds only the hotkeys that differ from the declared defaults, keyed by id. `null` means the user unbound that hotkey. Saving differences means users who never changed a hotkey get new defaults when you change them.
- The provider reads `customHotkeys` once and owns the state afterwards. Saved data can outlive the code that wrote it, so unknown ids and invalid hotkeys are ignored with a warning.
- `onCustomHotkeysChange` receives the complete custom hotkeys after every change, ready to save. Storage can be anything: local storage, a server, or a user profile.

Recorded hotkeys use `Mod` rather than platform-specific modifiers, so a hotkey saved on one platform works on others.

### Change hotkeys

`useCustomHotkeys` reads and changes the user's custom hotkeys:

```tsx
import {
  formatForDisplay,
  useAppHotkeys,
  useCustomHotkeys,
  useHotkeyRecorder,
} from '@tanstack/preact-hotkeys'
import type { AppHotkeyId } from '@tanstack/preact-hotkeys'

function ShortcutRow({ id }: { id: AppHotkeyId }) {
  const appHotkey = useAppHotkeys()[id]
  const { setCustomHotkey, resetCustomHotkey, findConflicts } = useCustomHotkeys()

  const recorder = useHotkeyRecorder({
    maxSteps: 3,
    validate: (hotkey) => {
      const conflicts = findConflicts(id, hotkey)
      return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
    },
    onRecord: (hotkey) => setCustomHotkey(id, hotkey),
    onClear: () => setCustomHotkey(id, null),
  })

  return (
    <div>
      {appHotkey.meta?.name}:{' '}
      {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
      <button onClick={recorder.startRecording}>Change</button>
      <button onClick={() => resetCustomHotkey(id)}>Reset</button>
    </div>
  )
}
```

| Member | Description |
| --- | --- |
| `customHotkeys` | The hotkeys that differ from the defaults |
| `setCustomHotkey(id, hotkey)` | Sets a hotkey, or unbinds with `null`. Returns conflicting app hotkeys; when there are any, nothing changes. |
| `findConflicts(id, hotkey)` | App hotkeys that would collide if `id` used `hotkey` |
| `resetCustomHotkey(id)` | Restores one default |
| `resetCustomHotkeys()` | Restores every default |

Two app hotkeys conflict when their contexts match or either has no `context`, and their hotkeys collide: equal chords, or one sequence starts with the other, including a sequence whose first step equals a chord. Conflicts are checked across every declaration, whether or not it is registered.

Each app hotkey's `defaultHotkey` holds its declared default, and `isCustom` in `useAppHotkeyList` reports whether the effective hotkey differs from it.

## Without Preact

The provider creates an `AppHotkeysStore` from `@tanstack/hotkeys`. Outside Preact, create the store yourself and publish it for devtools with `publishAppHotkeysStore`, or use `provideAppHotkeys` to do both.
