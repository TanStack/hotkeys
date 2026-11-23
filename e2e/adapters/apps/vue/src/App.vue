<script setup lang="ts">
import {
  detectPlatform,
  getHotkeyManager,
  useHeldKeys,
  useHotkey,
  useHotkeyRecorder,
  useKeyHold,
} from '@tanstack/vue-hotkeys'
import { onMounted, ref } from 'vue'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import HotkeyHost from './HotkeyHost.vue'

const shown = ref(true)
const enabled = ref(true)
const hotkey = ref('K')
useHotkey(['G', 'G'], () => logCall('sequence'))
const recorder = useHotkeyRecorder({ onRecord: setRecorded })
const shiftHeld = useKeyHold('Shift')
const heldKeys = useHeldKeys()

onMounted(() => {
  exposeFixture(
    { getHotkeyManager, detectPlatform },
    {
      setShown: (value) => (shown.value = value),
      setEnabled: (value) => (enabled.value = value),
      setHotkey: (value) => (hotkey.value = value),
      startRecording: () => recorder.startRecording(),
    },
  )
})
</script>

<template>
  <HotkeyHost v-if="shown" :hotkey="hotkey" :enabled="enabled" />
  <div id="recording">{{ recorder.isRecording.value ? 'yes' : 'no' }}</div>
  <div id="shift-held">{{ shiftHeld ? 'held' : 'released' }}</div>
  <div id="held-keys">{{ heldKeys.join('+') }}</div>
</template>
