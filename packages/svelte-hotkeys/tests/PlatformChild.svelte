<script lang="ts">
  import { createHotkey } from '../src/createHotkey.svelte'
  import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import PlatformLabel from './PlatformLabel.svelte'
  import type { Hotkey } from '@tanstack/hotkeys'
  import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

  type Platform = 'mac' | 'windows' | 'linux'
  let {
    hotkeyPlatform,
    labelPlatform,
    onHotkey,
    onRecord,
    recorder = $bindable(),
  }: {
    hotkeyPlatform?: Platform
    labelPlatform?: Platform
    onHotkey: () => void
    onRecord: (hotkey: Hotkey) => void
    recorder?: SvelteHotkeyRecorder
  } = $props()
  createHotkey(
    'Mod+S',
    () => onHotkey(),
    () => ({ platform: hotkeyPlatform }),
  )
  recorder = createHotkeyRecorder({
    onRecord: (hotkey) => onRecord(hotkey),
    recordBy: 'key',
  })
</script>

<PlatformLabel platform={labelPlatform} />
