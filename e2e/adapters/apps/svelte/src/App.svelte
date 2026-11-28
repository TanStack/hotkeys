<script lang="ts">
  import {
    createHotkey,
    createHotkeyAttachment,
    createHotkeyRecorder,
    detectPlatform,
    getHeldKeys,
    getHotkeyManager,
    getIsKeyHeld,
    getKeyLockState,
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
  const capsLock = getKeyLockState('CapsLock')
  const heldKeys = getHeldKeys()
  const elementHotkey = createHotkeyAttachment('L', () =>
    logCall('element hotkey'),
  )

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
<div id="caps-lock">
  {capsLock.value === null ? 'unknown' : capsLock.value ? 'on' : 'off'}
</div>
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div id="element-host" tabindex="0" {@attach elementHotkey}></div>
