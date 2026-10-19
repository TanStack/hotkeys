# App hotkeys in Vue

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Vue wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/vue-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/vue-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import type { CustomHotkeys } from '@tanstack/vue-hotkeys'
import { appHotkeys } from './app-hotkeys'
import AppContent from './AppContent.vue'

const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')
const saveHotkeys = (custom: CustomHotkeys) =>
  localStorage.setItem('hotkeys', JSON.stringify(custom))
</script>

<template>
  <HotkeysProvider
    :app-hotkeys="appHotkeys"
    :custom-hotkeys="saved"
    @custom-hotkeys-change="saveHotkeys"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

`useAppHotkeys()` returns a computed ref, so register inside a getter: `useHotkey(() => appHotkeys.value['doc.save'], save)`. Build a cheat sheet from `useAppHotkeyList()`.

A settings row records with `useHotkeyRecorder` and saves through `useCustomHotkeys`:

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
const { findConflicts, setCustomHotkey, resetCustomHotkey } = useCustomHotkeys()

const { startRecording } = useHotkeyRecorder({
  maxSteps: Infinity,
  validate: (hotkey) => {
    const [conflict] = findConflicts(props.id, hotkey)
    return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
  },
  onRecord: (hotkey) => setCustomHotkey(props.id, hotkey),
  onClear: () => setCustomHotkey(props.id, null),
})
</script>

<template>
  {{ appHotkey.meta?.name }}:
  {{ appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned' }}
  <button @click="startRecording">Change</button>
  <button @click="resetCustomHotkey(id)">Reset</button>
</template>
```
