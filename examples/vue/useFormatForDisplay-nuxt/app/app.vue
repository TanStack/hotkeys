<script setup lang="ts">
import { HotkeysProvider, detectPlatform } from '@tanstack/vue-hotkeys'

// The request's User-Agent on the server. In the browser it's undefined, so
// detectPlatform reads the browser's navigator instead.
const platform = detectPlatform(useRequestHeader('user-agent'))
</script>

<template>
  <HotkeysProvider :default-options="{ platform }">
    <NuxtPage />
  </HotkeysProvider>
</template>
