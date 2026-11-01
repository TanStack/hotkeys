<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import CheatSheetPage from './CheatSheetPage.vue'
import type { HotkeyPlatform } from '@tanstack/vue-hotkeys'

// Each island is its own Vue app, so the provider renders inside it
defineProps<{ platform: HotkeyPlatform }>()
</script>

<template>
  <HotkeysProvider :default-options="{ platform }">
    <CheatSheetPage />
  </HotkeysProvider>
</template>
