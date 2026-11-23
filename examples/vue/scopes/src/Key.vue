<script setup lang="ts">
import { useFormatForDisplay } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

defineProps<{ hotkey: Hotkey }>()
const formatForDisplay = useFormatForDisplay()
</script>

<template>
  <kbd>{{ formatForDisplay(hotkey) }}</kbd>
</template>
