---
title: App Hotkeys and Custom Shortcuts in Svelte
id: app-hotkeys
description: Declare every hotkey in your Svelte app in one place, list them in cheat sheets, and let users change them and save their choices.
---

App hotkeys are optional. Plain `createHotkey` calls are enough until you need an app-wide cheat sheet or a shortcut settings screen. Because `createHotkey` registers shortcuts only while its component is mounted, a cheat sheet built purely from active registrations misses shortcuts on routes that haven't rendered and has no single store to edit them.

App hotkeys solve both. Declare every shortcut's ID, default binding, and metadata once with `defineAppHotkeys`, pass it to `HotkeysProvider`, and attach callbacks where the actions live.

## Declare app hotkeys

Create a dedicated module for declarations without importing components or handlers, since this file loads with your app shell:

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/svelte-hotkeys'

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

declare module '@tanstack/svelte-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

- **IDs are your storage contract.** Keep object keys (`'doc.save'`) stable because persisted user overrides key off them.
- **Defaults (`hotkey`).** Pass a chord, a sequence, or `null` for an unassigned action that registers nothing until the user sets one.
- **Options (`options`).** Accepts hotkey behavior options (`capture`, `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for chords or `timeout` for sequences). See [Hotkey options](./hotkeys#hotkey-options). Options mismatched to the default's kind are type errors. Pass `target` and `enabled` at registration time instead.
- **Scopes (`scope`).** Overrides the [scope](./hotkeys-provider-and-scopes) of whichever provider the hotkey registers under. Declarations in different scopes can share keys.

The `Register` module augmentation enables autocomplete and type checking for `getAppHotkeys()`, `getCustomHotkeys()`, and `CustomHotkeys`.

## Provide app hotkeys

Pass the declarations to the root `HotkeysProvider`. See [Provide app hotkeys](./hotkeys-provider-and-scopes#provide-app-hotkeys):

```svelte
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import { appHotkeys } from './app-hotkeys'
  import App from './App.svelte'
</script>

<HotkeysProvider {appHotkeys}>
  <App />
</HotkeysProvider>
```

## Register app hotkeys

Pass an app hotkey from `getAppHotkeys().current` inside a getter so the registration follows changes, or from a direct import of `appHotkeys`, anywhere `createHotkey` accepts a hotkey:

```ts
import { createHotkey, getAppHotkeys } from '@tanstack/svelte-hotkeys'

const appHotkeys = getAppHotkeys()

createHotkey(
  () => appHotkeys.current['doc.save'],
  () => save(),
  () => ({ enabled: isDirty }),
)
```

Inside `HotkeysProvider`, `getAppHotkeys()` and direct imports (such as `createHotkey(appHotkeys['doc.save'], save)`) both resolve to the user's current custom binding. Without a provider, direct imports fall back to the declared defaults, while `getAppHotkeys()` requires a provider with `appHotkeys`. When a user rebinds an app hotkey, active registrations update immediately, even when switching between a chord and a sequence.

- **Option merging.** Options merge in order from provider `defaultOptions`, then declared `options`, then call-site options. Call-site options are typed against the declared default's kind, so `timeout` is accepted for `nav.home` but not for `doc.save`.
- **Metadata.** `meta` always comes from the declaration so cheat sheets and handlers stay in sync.

Mix app hotkeys and regular hotkeys freely in `createHotkeys`:

```ts
createHotkeys(() => [
  { hotkey: appHotkeys.current['doc.save'], callback: save },
  { hotkey: appHotkeys.current['nav.home'], callback: () => goHome() },
  { hotkey: 'Escape', callback: close },
])
```

## List app hotkeys

`getAppHotkeyList` returns every declared app hotkey, even on routes that haven't rendered, along with its live registration status and `isCustom` flag. See [List every app hotkey](./cheat-sheet-ui-helpers#list-every-app-hotkey).

## Customize and persist hotkeys

TanStack Hotkeys leaves storage up to your app. Pass saved overrides into `customHotkeys` and save updates when they change:

```svelte
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import type { CustomHotkeys } from '@tanstack/svelte-hotkeys'

  const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')
</script>

<HotkeysProvider
  {appHotkeys}
  customHotkeys={saved}
  onCustomHotkeysChange={(custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom))}
>
  <App />
</HotkeysProvider>
```

- **Stores diffs only.** `customHotkeys` contains only entries that differ from your defaults, with `null` meaning explicitly unbound. Users who haven't customized a binding automatically receive updated defaults when your app changes them.
- **Persisting updates.** `onCustomHotkeysChange` fires with the full `CustomHotkeys` map whenever the user updates or resets a binding.

How incoming `customHotkeys` updates behave:

- **Changed values.** Replaces current overrides without firing `onCustomHotkeysChange`, for example when async settings finish loading or the user switches accounts.
- **Deeply equal data on re-render.** Ignored, keeping in-memory edits intact even if you re-parse `localStorage` each time.
- **`undefined`.** Leaves current overrides unchanged while async settings are still loading.
- **`null`.** Clears all overrides without calling `onCustomHotkeysChange` when it differs from the last non-`undefined` value passed in, which is useful on sign-out. If the last non-`undefined` value was already `null` and the user made in-memory edits, remount the provider (or pass `{}`) instead. Calling `resetCustomHotkeys()` triggers `onCustomHotkeysChange` and is intended for user-initiated resets.
- **Unknown IDs or invalid bindings.** Silently ignored so older saved data doesn't break after app updates.

`setHotkeysContext` accepts the same `appHotkeys`, `customHotkeys`, and `onCustomHotkeysChange` options.

Because the [hotkey recorder](./custom-hotkey-recording) emits `Mod` rather than OS-specific `Meta` or `Control`, shortcuts saved on macOS carry over to Windows and Linux.

### Change hotkeys

Use `getCustomHotkeys` alongside the hotkey recorder to build a shortcut settings row. See [Hotkey Recording](./custom-hotkey-recording):

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    getAppHotkeys,
    getCustomHotkeys,
    getFormatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  import type { AppHotkeyId } from '@tanstack/svelte-hotkeys'

  let { id }: { id: AppHotkeyId } = $props()
  const formatForDisplay = getFormatForDisplay()
  const appHotkeys = getAppHotkeys()
  const custom = getCustomHotkeys()
  const appHotkey = $derived(appHotkeys.current[id])

  const recorder = createHotkeyRecorder(() => ({
    maxSteps: Infinity,
    validate: (hotkey, context) => {
      const conflicts = custom.findConflicts(id, hotkey, context)
      return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
    },
    onRecord: (hotkey, context) => custom.setCustomHotkey(id, hotkey, context),
    onClear: () => custom.setCustomHotkey(id, null),
  }))
</script>

<div>
  {appHotkey.meta?.name}:
  {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
  <button onclick={recorder.startRecording}>Change</button>
  <button onclick={() => custom.resetCustomHotkey(id)}>Reset</button>
</div>
```

Pass the recorder's `context` into `findConflicts` and `setCustomHotkey` so conflict detection compares the physical key presses too. That catches differently spelled bindings that fire for the same press, such as a recorded `Shift+[Slash]` against a declared `?` on US keyboards.

| Member | Description |
| --- | --- |
| `current` | Current overrides that differ from the declared defaults |
| `setCustomHotkey(id, hotkey, context?)` | Assigns a hotkey, or unbinds with `null`. Returns any conflicting app hotkeys and changes nothing if there are any. |
| `findConflicts(id, hotkey, context?)` | Returns app hotkeys that collide with assigning `hotkey` to `id` |
| `resetCustomHotkey(id)` | Restores one app hotkey to its default |
| `resetCustomHotkeys()` | Restores all app hotkeys to their defaults |

Two app hotkeys conflict when their scopes overlap (matching scopes, or either is in `'global'` or has no declared scope) and their bindings collide (equal chords, or one sequence starting with the other chord or sequence). Conflict checks scan every declaration, mounted or not.

Each app hotkey exposes `defaultHotkey`, and `getAppHotkeyList` includes `isCustom` to highlight modified rows. `HotkeysProvider` creates an `AppHotkeysStore` from the core package. For imperative use, see the [`AppHotkeysStore` reference](../../../reference/classes/AppHotkeysStore.md).

See the [Kitchen Sink example](../examples/kitchen-sink) for app hotkeys, grouped cheat sheets, and customization wired together.
