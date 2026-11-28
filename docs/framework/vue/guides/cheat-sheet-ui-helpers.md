---
title: Building a Keyboard Shortcut Cheat Sheet in Vue
id: cheat-sheet-ui-helpers
description: Build a keyboard shortcut cheat sheet or help dialog in Vue from the hotkeys your app registers or declares, so the list always matches the real hotkeys.
---

Build your cheat sheet directly from your registered or declared hotkeys so the help dialog never drifts out of sync when bindings change. Format each binding with `useFormatForDisplay` (see [Formatting & Display](./formatting-display)).

Two APIs cover different cheat sheet setups:

- `useHotkeyRegistrations()` returns registrations from `useHotkey` and `useHotkeys` for the components that are mounted right now.
- `useAppHotkeyList()` returns every [app hotkey](./app-hotkeys) you declared, including shortcuts on routes that haven't rendered yet.

Both return refs. Start with `useHotkeyRegistrations` for smaller apps. Switch to `useAppHotkeyList` for an app-wide cheat sheet or user customization.

## Name your hotkeys

Add `meta` (`name`, plus optional `description` and `group`) to shortcuts to display:

```ts
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
    callback: () => router.push('/'),
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

`useHotkeyRegistrations()` subscribes to active registrations and updates automatically as components mount, unmount, or change scopes:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useFormatForDisplay, useHotkeyRegistrations } from '@tanstack/vue-hotkeys'

const formatForDisplay = useFormatForDisplay()
const registrations = useHotkeyRegistrations()
const named = computed(() =>
  registrations.value.filter(
    (reg) => reg.options.meta?.name && reg.status === 'active',
  ),
)
</script>

<template>
  <dl>
    <div v-for="reg in named" :key="reg.id">
      <dt>{{ reg.options.meta?.name }}</dt>
      <dd>
        <kbd>{{ formatForDisplay(reg.hotkey) }}</kbd>
      </dd>
    </div>
  </dl>
</template>
```

Filtering by `meta?.name` omits unnamed helper shortcuts, such as a dialog's `Escape`. Checking `status === 'active'` hides paused shortcuts:

- `'active'` means the hotkey is enabled and nothing suspends it
- `'suspended'` means it is enabled, but its [scope](./hotkeys-provider-and-scopes) is inactive or suspended by an exclusive scope, or it is a document-level character key shortcut while [character keys are suspended](./accessibility#turn-them-off)
- `'disabled'` means `enabled: false` was set

Each entry also includes `id`, `hotkey`, `options`, `target`, and `triggerCount`. Chord entries (`kind === 'chord'`) add `parsedChord`, and sequence entries (`kind === 'sequence'`) add `parsedSequence` and `matchedStepCount` (used in [Show sequences in your UI](./sequences#show-sequences-in-your-ui)). If several components register the same shortcut, such as rows in a list, each registration appears as its own entry.

## List every app hotkey

`useAppHotkeyList()` returns every [app hotkey](./app-hotkeys) in declaration order, even when nothing has registered it yet. Each item includes its `status`, `isCustom` flag, and live `registrations` array, deduplicated to one row even if several components register the same ID:

```vue
<script setup lang="ts">
import { useAppHotkeyList, useFormatForDisplay } from '@tanstack/vue-hotkeys'

const formatForDisplay = useFormatForDisplay()
const items = useAppHotkeyList()
</script>

<template>
  <ul>
    <li
      v-for="{ appHotkey, status, isCustom } in items"
      :key="appHotkey.id"
      :data-status="status"
    >
      {{ appHotkey.meta?.name }}:
      {{ appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned' }}
      <span v-if="isCustom">(custom)</span>
    </li>
  </ul>
</template>
```

| Status | Meaning |
| --- | --- |
| `'active'` | At least one registration reports `'active'` |
| `'suspended'` | Enabled registrations exist, but none can fire: their scope is inactive, or character keys are suspended |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey assigned, but no component has registered it yet |
| `'unbound'` | No hotkey assigned (`null`) |

`useAppHotkeyList` reads declarations from `HotkeysProvider`, so mount a provider with `appHotkeys` above it. If you mix declared app hotkeys with local component hotkeys, combine both lists by filtering out registrations that already have `options.appHotkeyId`:

```ts
const undeclared = computed(() =>
  registrations.value.filter(
    (reg) => reg.options.appHotkeyId === undefined && reg.options.meta?.name,
  ),
)
```

## Group the list

Group items by `meta.group` for scannable sections:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useAppHotkeyList } from '@tanstack/vue-hotkeys'

const items = useAppHotkeyList()
const groups = computed(() => [
  ...new Set(items.value.map((item) => item.appHotkey.meta?.group)),
])
</script>

<template>
  <section v-for="group in groups" :key="group ?? 'other'">
    <h3>{{ group ?? 'Other' }}</h3>
    <ul>
      <li
        v-for="{ appHotkey } in items.filter((item) => item.appHotkey.meta?.group === group)"
        :key="appHotkey.id"
      >
        ...
      </li>
    </ul>
  </section>
</template>
```

To style individual keys as separate `<kbd>` badges, pass `parts: true` to the function from `useFormatForDisplay`. See [Render individual keycaps](./formatting-display#render-individual-keycaps).

## Open the cheat sheet with a hotkey

Wrap your cheat sheet dialog in an `exclusive` scope so pressing a shortcut while reading the help list doesn't trigger actions behind the modal:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { HotkeysProvider, useAppHotkeys, useHotkey } from '@tanstack/vue-hotkeys'

// Declared with defineAppHotkeys:
// 'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } }

const appHotkeys = useAppHotkeys()
const isOpen = ref(false)

useHotkey(() => appHotkeys.value['help.shortcuts'], () => (isOpen.value = true))
</script>

<template>
  <Main />
  <HotkeysProvider v-if="isOpen" scope="cheat-sheet" exclusive>
    <CheatSheetDialog @close="isOpen = false" />
  </HotkeysProvider>
</template>
```

```vue
<!-- CheatSheetDialog.vue -->
<script setup lang="ts">
import { useAppHotkeys, useHotkeys } from '@tanstack/vue-hotkeys'

const emit = defineEmits<{ close: [] }>()
const appHotkeys = useAppHotkeys()

useHotkeys(() => [
  { hotkey: 'Escape', callback: () => emit('close') },
  // The page's registration pauses while the cheat sheet is open, so close from here
  { hotkey: appHotkeys.value['help.shortcuts'], callback: () => emit('close') },
])
</script>

<template>
  <div role="dialog" aria-label="Keyboard shortcuts">
    <CheatSheet />
  </div>
</template>
```

A few details to keep in mind:

- Register the toggle hotkey inside the dialog as well so pressing the same keys closes it cleanly, since `exclusive` suspends the outer registration.
- `useAppHotkeyList` still shows every app hotkey while the dialog is open. Items from the page behind it report `'suspended'`. To let background shortcuts keep working, omit `exclusive`. See [Exclusive scopes](./hotkeys-provider-and-scopes#exclusive-scopes).
- When binding `?` to open your cheat sheet, remember that single-key shortcuts need a way to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

See the [Kitchen Sink example](../examples/kitchen-sink) for a complete grouped cheat sheet with live statuses and rebinding.
