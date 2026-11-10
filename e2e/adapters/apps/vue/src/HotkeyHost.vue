<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'
import { logCall } from '../../../shared/fixture'
import type { Hotkey } from '@tanstack/vue-hotkeys'

const props = defineProps<{ hotkey: string; enabled: boolean }>()

useHotkey(
  () => props.hotkey as Hotkey,
  () => logCall('hotkey'),
  () => ({ enabled: props.enabled }),
)
</script>

<template>
  <div id="hotkey-host" />
</template>
