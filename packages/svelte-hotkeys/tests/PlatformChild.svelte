<script lang="ts">
  import { createHotkey } from '../src/createHotkey.svelte'
  import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import PlatformLabel from './PlatformLabel.svelte'
  import type { Hotkey, HotkeyPlatform } from '@tanstack/hotkeys'
  import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

  let {
    hotkeyPlatform,
    labelPlatform,
    onHotkey,
    onRecord,
    recorder = $bindable(),
  }: {
    hotkeyPlatform?: HotkeyPlatform
    labelPlatform?: HotkeyPlatform
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
