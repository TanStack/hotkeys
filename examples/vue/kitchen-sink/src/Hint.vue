<script setup lang="ts">
import { useFormatForDisplay, useHotkeyHint } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

const props = defineProps<{ hotkey: Hotkey }>()
const formatForDisplay = useFormatForDisplay()
const visible = useHotkeyHint(() => props.hotkey)
</script>
<template>
  <kbd v-if="visible">{{ formatForDisplay(hotkey) }}</kbd>
</template>
