---
title: App Hotkeys and Custom Shortcuts in Vue
id: app-hotkeys
description: Declare every hotkey in your Vue app in one place, list them in cheat sheets, and let users change them and save their choices.
---

App hotkeys are optional. Plain `useHotkey` calls are enough until you need an app-wide cheat sheet or a shortcut settings screen. Because `useHotkey` registers shortcuts only while its component is mounted, a cheat sheet built purely from active registrations misses shortcuts on routes that haven't rendered and has no single store to edit them.

App hotkeys solve both. Declare every shortcut's ID, default binding, and metadata once with `defineAppHotkeys`, pass it to `HotkeysProvider`, and attach callbacks where the actions live.

## Declare app hotkeys

Create a dedicated module for declarations without importing components or handlers, since this file loads with your app shell:

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/vue-hotkeys'

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

declare module '@tanstack/vue-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

- **IDs are your storage contract.** Keep object keys (`'doc.save'`) stable because persisted user overrides key off them.
- **Defaults (`hotkey`).** Pass a chord, a sequence, or `null` for an unassigned action that registers nothing until the user sets one.
- **Options (`options`).** Accepts hotkey behavior options (`capture`, `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for chords or `timeout` for sequences). See [Hotkey options](./hotkeys#hotkey-options). Options mismatched to the default's kind are type errors. Pass `target` and `enabled` at registration time instead.
- **Scopes (`scope`).** Overrides the [scope](./hotkeys-provider-and-scopes) of whichever provider the hotkey registers under. Declarations in different scopes can share keys.

The `Register` module augmentation enables autocomplete and type checking for `useAppHotkeys()`, `useCustomHotkeys()`, and `CustomHotkeys`.

## Provide app hotkeys

Pass the declarations to the root `HotkeysProvider`. See [Provide app hotkeys](./hotkeys-provider-and-scopes#provide-app-hotkeys):

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import { appHotkeys } from './app-hotkeys'
</script>

<template>
  <HotkeysProvider :app-hotkeys="appHotkeys">
    <App />
  </HotkeysProvider>
</template>
```

## Register app hotkeys

Pass an app hotkey from `useAppHotkeys()` (a computed ref), or from a direct import of `appHotkeys`, anywhere `useHotkey` accepts a hotkey:

```ts
import { useAppHotkeys, useHotkey } from '@tanstack/vue-hotkeys'

const appHotkeys = useAppHotkeys()

useHotkey(
  () => appHotkeys.value['doc.save'],
  () => save(),
  () => ({ enabled: isDirty.value }),
)
```

Both forms resolve to the user's current custom binding inside the provider, such as `useHotkey(appHotkeys['doc.save'], save)`, and fall back to the declared default when there's no provider. When a user rebinds an app hotkey, active registrations update immediately, even when switching between a chord and a sequence.

- **Option merging.** Options merge in order from provider `defaultOptions`, then declared `options`, then call-site options. Call-site options are typed against the declared default's kind, so `timeout` is accepted for `nav.home` but not for `doc.save`.
- **Metadata.** `meta` always comes from the declaration so cheat sheets and handlers stay in sync.

Mix app hotkeys and regular hotkeys freely in `useHotkeys`:

```ts
useHotkeys(() => [
  { hotkey: appHotkeys.value['doc.save'], callback: save },
  { hotkey: appHotkeys.value['nav.home'], callback: () => router.push('/') },
  { hotkey: 'Escape', callback: close },
])
```

## List app hotkeys

`useAppHotkeyList` returns every declared app hotkey, even on routes that haven't rendered, along with its live registration status and `isCustom` flag. See [List every app hotkey](./cheat-sheet-ui-helpers#list-every-app-hotkey).

## Customize and persist hotkeys

TanStack Hotkeys leaves storage up to your app. Pass saved overrides into `customHotkeys` and save updates when they change:

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import type { CustomHotkeys } from '@tanstack/vue-hotkeys'

const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')
const save = (custom: CustomHotkeys) =>
  localStorage.setItem('hotkeys', JSON.stringify(custom))
</script>

<template>
  <HotkeysProvider
    :app-hotkeys="appHotkeys"
    :custom-hotkeys="saved"
    @custom-hotkeys-change="save"
  >
    <App />
  </HotkeysProvider>
</template>
```

- **Stores diffs only.** `customHotkeys` contains only entries that differ from your defaults, with `null` meaning explicitly unbound. Users who haven't customized a binding automatically receive updated defaults when your app changes them.
- **Persisting updates.** The provider emits `customHotkeysChange` with the full `CustomHotkeys` map whenever the user updates or resets a binding. With `provideHotkeysContext`, pass `customHotkeys` and `onCustomHotkeysChange` in its options instead.

How incoming `customHotkeys` updates behave:

- **Changed values.** Replaces current overrides without firing `onCustomHotkeysChange`, for example when async settings finish loading or the user switches accounts.
- **Deeply equal data on re-render.** Ignored, keeping in-memory edits intact even if you re-parse `localStorage` each time.
- **`undefined`.** Leaves current overrides unchanged while async settings are still loading.
- **`null`.** Clears all overrides, which is useful on sign-out.
- **Unknown IDs or invalid bindings.** Silently ignored so older saved data doesn't break after app updates.

Because the [hotkey recorder](./custom-hotkey-recording) emits `Mod` rather than OS-specific `Meta` or `Control`, shortcuts saved on macOS carry over to Windows and Linux.

### Change hotkeys

Use `useCustomHotkeys` alongside the hotkey recorder to build a shortcut settings row. See [Hotkey Recording](./custom-hotkey-recording):

```vue
<script setup lang="ts">
import { computed } from 'vue'
import {
  useAppHotkeys,
  useCustomHotkeys,
  useFormatForDisplay,
  useHotkeyRecorder,
} from '@tanstack/vue-hotkeys'
import type { AppHotkeyId } from '@tanstack/vue-hotkeys'

const props = defineProps<{ id: AppHotkeyId }>()
const formatForDisplay = useFormatForDisplay()
const appHotkeys = useAppHotkeys()
const appHotkey = computed(() => appHotkeys.value[props.id])
const { setCustomHotkey, resetCustomHotkey, findConflicts } = useCustomHotkeys()

const recorder = useHotkeyRecorder({
  maxSteps: Infinity,
  validate: (hotkey, context) => {
    const conflicts = findConflicts(props.id, hotkey, context)
    return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
  },
  onRecord: (hotkey, context) => setCustomHotkey(props.id, hotkey, context),
  onClear: () => setCustomHotkey(props.id, null),
})
</script>

<template>
  <div>
    {{ appHotkey.meta?.name }}:
    {{ appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned' }}
    <button @click="recorder.startRecording">Change</button>
    <button @click="resetCustomHotkey(id)">Reset</button>
  </div>
</template>
```

Pass the recorder's `context` into `findConflicts` and `setCustomHotkey` so conflict detection compares the physical key presses too. That catches differently spelled bindings that fire for the same press, such as a recorded `Shift+[Slash]` against a declared `?` on US keyboards.

| Member | Description |
| --- | --- |
| `customHotkeys.value` | Current overrides that differ from the declared defaults |
| `setCustomHotkey(id, hotkey, context?)` | Assigns a hotkey, or unbinds with `null`. Returns any conflicting app hotkeys and changes nothing if there are any. |
| `findConflicts(id, hotkey, context?)` | Returns app hotkeys that collide with assigning `hotkey` to `id` |
| `resetCustomHotkey(id)` | Restores one app hotkey to its default |
| `resetCustomHotkeys()` | Restores all app hotkeys to their defaults |

Two app hotkeys conflict when their scopes overlap (matching scopes, or either is in `'global'` or has no declared scope) and their bindings collide (equal chords, or one sequence starting with the other chord or sequence). Conflict checks scan every declaration, mounted or not.

Each app hotkey exposes `defaultHotkey`, and `useAppHotkeyList` includes `isCustom` to highlight modified rows. `HotkeysProvider` creates an `AppHotkeysStore` from the core package. For imperative use, see the [`AppHotkeysStore` reference](../../../reference/classes/AppHotkeysStore.md).

See the [Kitchen Sink example](../examples/kitchen-sink) for app hotkeys, grouped cheat sheets, and customization wired together.
