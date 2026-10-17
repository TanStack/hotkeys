<script setup lang="ts">
import { formatForDisplay } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

defineProps<{ hotkey: Hotkey }>()
</script>

<template>
  <kbd>{{ formatForDisplay(hotkey) }}</kbd>
</template>
