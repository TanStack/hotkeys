<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import CheatSheetPage from './components/CheatSheetPage.vue'
import type { HotkeyPlatform } from '@tanstack/vue-hotkeys'

defineProps<{ platform: HotkeyPlatform }>()
</script>

<template>
  <HotkeysProvider :default-options="{ platform }">
    <CheatSheetPage />
  </HotkeysProvider>
</template>
