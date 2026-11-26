---
title: App Hotkeys and Custom Shortcuts in Solid
id: app-hotkeys
description: Declare every hotkey in your Solid app in one place, list them in cheat sheets, and let users change them and save their choices.
---

App hotkeys are optional. Plain `createHotkey` calls are enough until you need an app-wide cheat sheet or a shortcut settings screen. Because `createHotkey` registers shortcuts only while its component is rendered, a cheat sheet built purely from active registrations misses shortcuts on routes that haven't rendered and has no single store to edit them.

App hotkeys solve both. Declare every shortcut's ID, default binding, and metadata once with `defineAppHotkeys`, pass it to `HotkeysProvider`, and attach callbacks where the actions live. A declaration never holds a callback, so `createHotkey` and `createHotkeys` still attach them.

## Declare app hotkeys

Create a dedicated module for declarations without importing components or handlers, since this file loads with your app shell:

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/solid-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save', group: 'Document' } },
  'doc.find': {
    hotkey: 'Mod+F',
    meta: { name: 'Find', group: 'Document' },
    scope: 'editor',
  },
  'nav.home': {
    hotkey: ['G', 'H'],
    meta: { name: 'Go home', group: 'Navigation' },
    options: { timeout: 800 },
  },
  'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
})

declare module '@tanstack/solid-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

- **IDs are your storage contract.** Keep object keys (`'doc.save'`) stable because persisted user overrides key off them.
- **Defaults (`hotkey`).** Pass a chord, a sequence, or `null` for an unassigned action that registers nothing until the user sets one.
- **Options (`options`).** Accepts hotkey behavior options (`capture`, `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for chords or `timeout` for sequences). Options mismatched to the default's kind are type errors. Pass `target` and `enabled` at registration time instead.
- **Scopes (`scope`).** Overrides the scope of whichever provider the hotkey registers under. Declarations in different scopes can share keys.

The `Register` module augmentation enables autocomplete and type checking for `useAppHotkeys()`, `useCustomHotkeys()`, and `CustomHotkeys`.

## Provide app hotkeys

Pass your declarations to the root `HotkeysProvider` (see [Provide app hotkeys](./hotkeys-provider-and-scopes#provide-app-hotkeys)):

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'
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

Pass an app hotkey from `useAppHotkeys()`, which returns an accessor, or from a direct import of `appHotkeys`, anywhere `createHotkey` accepts a hotkey:

```tsx
import { createHotkey, useAppHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  const appHotkeys = useAppHotkeys()

  createHotkey(
    () => appHotkeys()['doc.save'],
    () => save(),
    () => ({ enabled: isDirty() }),
  )
}
```

Inside `HotkeysProvider`, `useAppHotkeys()` and direct imports (such as `createHotkey(appHotkeys['doc.save'], save)`) both resolve to the user's current custom binding. Without a provider, direct imports fall back to the declared defaults, while `useAppHotkeys()` requires a provider with `appHotkeys`. When a user rebinds an app hotkey, active registrations update immediately, even when switching between a chord and a sequence.

- **Option merging.** Options merge in order from provider `defaultOptions`, then declared `options`, then call-site options. Call-site options are typed against the declared default's kind.
- **Metadata.** `meta` always comes from the declaration so cheat sheets and handlers stay in sync.

Mix app hotkeys and regular hotkeys freely in `createHotkeys`:

```tsx
createHotkeys(() => [
  { hotkey: appHotkeys()['doc.save'], callback: save },
  { hotkey: appHotkeys()['nav.home'], callback: () => navigate('/') },
  { hotkey: 'Escape', callback: close },
])
```

## List app hotkeys

`createAppHotkeyList` returns every declared app hotkey, even on routes that haven't rendered, along with its live registration status and `isCustom` flag. See [List every app hotkey](./cheat-sheet-ui-helpers#list-every-app-hotkey).

## Customize and persist hotkeys

TanStack Hotkeys leaves storage up to your app. Pass saved overrides into `customHotkeys` and save updates in `onCustomHotkeysChange`:

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'
import type { CustomHotkeys } from '@tanstack/solid-hotkeys'

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

- **Stores diffs only.** `customHotkeys` contains only entries that differ from your defaults, with `null` meaning explicitly unbound. Users who haven't customized a binding automatically receive updated defaults when your app changes them.
- **Persisting updates.** `onCustomHotkeysChange` fires with the full `CustomHotkeys` map whenever the user updates or resets a binding.

How incoming `customHotkeys` prop updates behave:

- **Changed values.** Replaces current overrides without firing `onCustomHotkeysChange` (for example, when async settings finish loading or the user switches accounts).
- **Deeply equal data.** Ignored, keeping in-memory edits intact even if the saved data is parsed again each time the prop updates.
- **`undefined`.** Leaves current overrides unchanged while async settings are still loading.
- **`null`.** Clears all overrides without calling `onCustomHotkeysChange` when it differs from the last non-`undefined` value passed in, which is useful on sign-out. If the last non-`undefined` value was already `null` and the user made in-memory edits, remount the provider (or pass `{}`) instead. Calling `resetCustomHotkeys()` triggers `onCustomHotkeysChange` and is intended for user-initiated resets.
- **Unknown IDs or invalid bindings.** Silently ignored so older saved data won't crash after app updates.

Because the [hotkey recorder](./custom-hotkey-recording) emits `Mod` rather than OS-specific `Meta` or `Control`, shortcuts saved on macOS sync cleanly to Windows and Linux too.

### Change hotkeys

Use `useCustomHotkeys()` alongside `createHotkeyRecorder()` to build a shortcut settings row:

```tsx
import { Show } from 'solid-js'
import {
  createFormatForDisplay,
  createHotkeyRecorder,
  useAppHotkeys,
  useCustomHotkeys,
} from '@tanstack/solid-hotkeys'
import type { AppHotkeyId } from '@tanstack/solid-hotkeys'

function ShortcutRow(props: { id: AppHotkeyId }) {
  const formatForDisplay = createFormatForDisplay()
  const appHotkeys = useAppHotkeys()
  const appHotkey = () => appHotkeys()[props.id]
  const { setCustomHotkey, resetCustomHotkey, findConflicts } = useCustomHotkeys()

  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    validate: (hotkey, context) => {
      const conflicts = findConflicts(props.id, hotkey, context)
      return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
    },
    onRecord: (hotkey, context) => setCustomHotkey(props.id, hotkey, context),
    onClear: () => setCustomHotkey(props.id, null),
  })

  return (
    <div>
      {appHotkey().meta?.name}:{' '}
      <Show when={appHotkey().hotkey} fallback="Unassigned">
        {(hotkey) => formatForDisplay(hotkey())}
      </Show>
      <button onClick={recorder.startRecording}>Change</button>
      <button onClick={() => resetCustomHotkey(props.id)}>Reset</button>
    </div>
  )
}
```

Pass the recorder's `context` into `findConflicts` and `setCustomHotkey` so conflict detection compares the physical keypresses too. That catches differently spelled bindings that fire for the same press, like `Shift+[Slash]`, recorded by code, against a declared `?` on US keyboards.

| Member | Description |
| --- | --- |
| `customHotkeys()` | The hotkeys that differ from the defaults |
| `setCustomHotkey(id, hotkey, context?)` | Sets a hotkey, or unbinds with `null`. Returns conflicting app hotkeys, and changes nothing when there are any. Takes the recorder's `context`, as `findConflicts` does. |
| `findConflicts(id, hotkey, context?)` | App hotkeys that would collide if `id` used `hotkey`. With the recorder's `context`, also checks with the key press that recorded it. |
| `resetCustomHotkey(id)` | Restores one default |
| `resetCustomHotkeys()` | Restores every default |

Two app hotkeys conflict when their scopes overlap (matching scopes, or either is in `'global'` or has no declared scope) and their bindings collide (equal chords, or one sequence starting with the other chord or sequence). Conflict checks scan every declaration, rendered or not.

Each app hotkey exposes `defaultHotkey`, and `createAppHotkeyList` includes `isCustom` to highlight modified rows. For imperative usage outside components, see [`AppHotkeysStore`](../../../reference/classes/AppHotkeysStore.md).

See the [Kitchen Sink example](../examples/kitchen-sink) for app hotkeys, grouped cheat sheets, and customization wired together.
