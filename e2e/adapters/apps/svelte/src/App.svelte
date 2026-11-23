<script lang="ts">
  import {
    createHotkey,
    createHotkeyRecorder,
    detectPlatform,
    getHeldKeys,
    getHotkeyManager,
    getIsKeyHeld,
  } from '@tanstack/svelte-hotkeys'
  import { onMount } from 'svelte'
  import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
  import HotkeyHost from './HotkeyHost.svelte'

  let shown = $state(true)
  let enabled = $state(true)
  let hotkey = $state('K')
  createHotkey(['G', 'G'], () => logCall('sequence'))
  const recorder = createHotkeyRecorder({ onRecord: setRecorded })
  const shiftHeld = getIsKeyHeld('Shift')
  const heldKeys = getHeldKeys()

  onMount(() => {
    exposeFixture(
      { getHotkeyManager, detectPlatform },
      {
        setShown: (value) => (shown = value),
        setEnabled: (value) => (enabled = value),
        setHotkey: (value) => (hotkey = value),
        startRecording: () => recorder.startRecording(),
      },
    )
  })
</script>

{#if shown}
  <HotkeyHost {hotkey} {enabled} />
{/if}
<div id="recording">{recorder.isRecording ? 'yes' : 'no'}</div>
<div id="shift-held">{shiftHeld.held ? 'held' : 'released'}</div>
<div id="held-keys">{heldKeys.keys.join('+')}</div>
