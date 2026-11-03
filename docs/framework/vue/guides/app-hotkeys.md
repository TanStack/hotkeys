---
title: App Hotkeys and Custom Shortcuts in Vue
id: app-hotkeys
description: Declare every hotkey in your Vue app in one place, list them in cheat sheets, and let users change them and save their choices.
---

App hotkeys are optional. Plain `useHotkey` is enough until you need a cheat sheet for your whole app, or a screen where users change hotkeys. `useHotkey` registers a hotkey when its component mounts, so a cheat sheet built from live registrations misses hotkeys on routes that have not rendered yet, and a settings screen has nowhere to change them. App hotkeys solve both: you declare every hotkey in one place, pass the declarations to `HotkeysProvider`, and attach callbacks where the work happens. Users can then customize any of them, and your app decides how to save their choices.

A declaration holds a hotkey's id, default hotkey, metadata, and options. It never holds a callback. `useHotkey` and `useHotkeys` still attach the callbacks.

## Declare app hotkeys

Use `defineAppHotkeys` in a module that contains only declarations. Keep it free of components and handlers, because it loads with your app shell:

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

- The object key is the app hotkey's id. Treat ids as a stable contract, because saved custom hotkeys use them as keys.
- `hotkey` is the default: a chord, a sequence, or `null` for an action without a default. An unbound app hotkey registers nothing until the user assigns one.
- `options` describe the hotkey itself: `capture`, `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for a chord default or `timeout` for a sequence default. [Hotkey options](./hotkeys#hotkey-options) describes each one. Options that don't match the default's kind are type errors. Pass `target` and `enabled` where you register the hotkey.
- `scope` sets the [scope](./hotkeys-provider-and-scopes) the hotkey fires in, such as `'editor'`, in place of the scope of the provider it registers under. App hotkeys in different scopes may share a hotkey.

The `Register` augmentation types `useAppHotkeys()`, the ids accepted by `useCustomHotkeys()`, and the `CustomHotkeys` type.

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

Pass an app hotkey wherever you pass a hotkey. Read it from `useAppHotkeys()`, which returns a computed ref, or import it directly:

```ts
import { useAppHotkeys, useHotkey } from '@tanstack/vue-hotkeys'

const appHotkeys = useAppHotkeys()

useHotkey(
  () => appHotkeys.value['doc.save'],
  () => save(),
  () => ({ enabled: isDirty.value }),
)
```

Both forms use the provider's effective hotkey for that id, so a user's custom hotkey applies even to a direct import, such as `useHotkey(appHotkeys['doc.save'], save)`. Without a provider, the declared default is used.

The registration takes `meta` and `options` from the declaration. Options merge in this order: provider `defaultOptions`, then declared options, then call-site options. `meta` comes only from the declaration, so the cheat sheet and the registration cannot disagree. Call-site options are typed by the declared default's kind, so `timeout` is accepted for `nav.home` but not for `doc.save`.

When a component registers several hotkeys, pass app hotkeys to `useHotkeys` in the same field, mixed with plain hotkeys if you like:

```ts
useHotkeys(() => [
  { hotkey: appHotkeys.value['doc.save'], callback: save },
  { hotkey: appHotkeys.value['nav.home'], callback: () => router.push('/') },
  { hotkey: 'Escape', callback: close },
])
```

When the user changes a hotkey, registered app hotkeys move to the new hotkey immediately, even if it changes from a chord to a sequence.

## List app hotkeys

`useAppHotkeyList` returns every app hotkey, with its current hotkey and whether anything has registered it. Use it to build a cheat sheet that includes pages that haven't rendered. See [List every app hotkey](./cheat-sheet-ui-helpers#list-every-app-hotkey).

## Customize and persist hotkeys

TanStack Hotkeys does not store anything. Pass the user's saved custom hotkeys to the provider and save them when they change:

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

- `customHotkeys` holds only the hotkeys that differ from the declared defaults, keyed by id. `null` means the user unbound that hotkey. Saving differences means users who never changed a hotkey get new defaults when you change them.
- When the `customHotkeys` value changes, such as after saved data loads or another user signs in, it replaces the current custom hotkeys without calling `onCustomHotkeysChange`. Passing equal data again, such as parsing local storage on every render, keeps the user's changes. `undefined` leaves the custom hotkeys unchanged, such as while saved data loads, and `null` clears them, such as on sign-out. Saved data can outlive the code that wrote it, so unknown ids and invalid hotkeys are ignored with a warning in development.
- The provider emits `customHotkeysChange` with the complete custom hotkeys after every change, ready to save. Storage can be anything: local storage, a server, or a user profile. With `provideHotkeysContext`, pass `customHotkeys` and `onCustomHotkeysChange` in its options instead.

The [hotkey recorder](./custom-hotkey-recording) records `Mod` rather than platform-specific modifiers, so a hotkey saved on one platform works on others.

### Change hotkeys

`useCustomHotkeys` reads and changes the user's custom hotkeys. Pair it with a [recorder](./custom-hotkey-recording), so users press the hotkey they want:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import {
  formatForDisplay,
  useAppHotkeys,
  useCustomHotkeys,
  useHotkeyRecorder,
} from '@tanstack/vue-hotkeys'
import type { AppHotkeyId } from '@tanstack/vue-hotkeys'

const props = defineProps<{ id: AppHotkeyId }>()
const appHotkeys = useAppHotkeys()
const appHotkey = computed(() => appHotkeys.value[props.id])
const { setCustomHotkey, resetCustomHotkey, findConflicts } = useCustomHotkeys()

const recorder = useHotkeyRecorder({
  maxSteps: Infinity,
  validate: (hotkey) => {
    const conflicts = findConflicts(props.id, hotkey)
    return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
  },
  onRecord: (hotkey) => setCustomHotkey(props.id, hotkey),
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

| Member | Description |
| --- | --- |
| `customHotkeys.value` | The hotkeys that differ from the defaults |
| `setCustomHotkey(id, hotkey)` | Sets a hotkey, or unbinds with `null`. Returns conflicting app hotkeys; when there are any, nothing changes. |
| `findConflicts(id, hotkey)` | App hotkeys that would collide if `id` used `hotkey` |
| `resetCustomHotkey(id)` | Restores one default |
| `resetCustomHotkeys()` | Restores every default |

Two app hotkeys conflict when their scopes match or either is in `'global'`, including app hotkeys with no declared scope, and their hotkeys collide: equal chords, or one sequence starts with the other, including a sequence whose first step equals a chord. Conflicts are checked across every declaration, whether or not it is registered.

Each app hotkey's `defaultHotkey` holds its declared default, and `isCustom` in `useAppHotkeyList` reports whether the effective hotkey differs from it.

`HotkeysProvider` creates an `AppHotkeysStore` from the core package. See the [`AppHotkeysStore` reference](../../../reference/classes/AppHotkeysStore.md) to use it directly.
