---
id: useHotkeyRegistrations
title: useHotkeyRegistrations
---

```ts
function useHotkeyRegistrations(): Readonly<Ref<HotkeyRegistrationView[]>>;
```

Defined in: [useHotkeyRegistrations.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRegistrations.ts#L26)

Vue composable that reactively reads every hotkey registration, chords and
sequences, from the singleton HotkeyManager. Narrow each view with `kind`.

This composable does NOT require the HotkeysProvider.

## Returns

`Readonly`\<`Ref`\<`HotkeyRegistrationView`[]\>\>

A ref of all registrations, without callbacks

## Example

```vue
<script setup>
const registrations = useHotkeyRegistrations()
</script>
<template>
  <li v-for="reg in registrations" :key="reg.id">
    {{ reg.options.meta?.name }}: {{ formatForDisplay(reg.hotkey) }}
  </li>
</template>
```
