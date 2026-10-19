---
name: vue-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in a Vue 3 app with
  @tanstack/vue-hotkeys: useHotkey and useHotkeys composables, refs and getters
  as options, template-ref targets, HotkeysProvider and provideHotkeysContext
  scopes, app hotkey composables, recorders, held-key and hint composables, or
  replacing @keydown handlers and window keydown listeners.
metadata:
  purpose: >-
    Vue bindings for TanStack Hotkeys: composables, reactive options,
    providers, and the Vue-specific reactivity mistakes to avoid.
  type: framework
  framework: vue
  library: '@tanstack/vue-hotkeys'
  library_version: '0.15.0'
sources:
  - src/useHotkey.ts
  - src/useHotkeys.ts
  - src/HotkeysProvider.tsx
  - src/HotkeysProviderContext.ts
  - src/useAppHotkeys.ts
  - src/useHotkeyRecorder.ts
  - TanStack/hotkeys:docs/framework/vue/quick-start.md
  - TanStack/hotkeys:docs/framework/vue/guides/hotkeys-provider-and-scopes.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Vue

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'

const isDirty = ref(false)
const panel = ref<HTMLDivElement | null>(null)

useHotkey('Mod+S', () => save(), { enabled: isDirty })
useHotkey('Escape', () => closePanel(), { target: panel })
</script>

<template>
  <div ref="panel" tabindex="0" @input="isDirty = true">
    Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  </div>
</template>
```

| Task                          | API                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Register                      | `useHotkey(hotkey, callback, options?)`; `useHotkeys(definitions, commonOptions?)` for several hotkeys or a list from data                               |
| Defaults, scopes, app hotkeys | `<HotkeysProvider :default-options :scope :exclusive :enabled :app-hotkeys :custom-hotkeys @custom-hotkeys-change>`, or `provideHotkeysContext(options)` |
| App hotkeys                   | `useAppHotkeys()`, `useAppHotkeyList()` (computed refs), `useCustomHotkeys()`                                                                            |
| Record, list, held keys       | `useHotkeyRecorder`, `useHotkeyRegistrations`, `useKeyHold`, `useHeldKeys`, `useHotkeyHint`                                                              |

No provider is required. Call the composables synchronously in setup.

## Pitfalls

- **Pass the ref, not `.value`.** `{ enabled: isDirty.value }` is read once, so the hotkey never turns on, and `{ target: panel.value }` is `null` in setup, so the hotkey never registers. Pass `isDirty` and `panel`. `enabled` and `target` accept refs and getters; for other options that depend on state, pass a getter for the whole options object.
- **Put the provider around the dialog component.** A `HotkeysProvider` in a component's own template, or `provideHotkeysContext` in its own setup, applies only to its children. Register the dialog's hotkeys in a child component, and give each open dialog its own scope name, such as `` `dialog-${useId()}` ``.
- **Destructure the recorder.** Templates unwrap only top-level refs, so `v-if="recorder.isRecording"` is always true. Use `const { isRecording, startRecording } = useHotkeyRecorder(...)`.
- **The callback isn't tracked.** Read refs and props inside it.
- **Call the composables directly.** A `useShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, reactive options, and app hotkeys.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Vue](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/vue-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/vue/guides/<page>.md`, such as `hotkeys`, `hotkeys-provider-and-scopes`, or `app-hotkeys`. Devtools: `HotkeysDevtoolsPanel` from `@tanstack/vue-hotkeys-devtools`.
