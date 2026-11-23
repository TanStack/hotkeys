<script lang="ts">
  import { getFormatForDisplay } from '../src/getFormatForDisplay'
  import { getKeyboardLayout } from '../src/getKeyboardLayout.svelte'
  import type { DisplayHotkey, KeyboardLayoutMap } from '@tanstack/hotkeys'

  let {
    hotkey = 'Mod+[KeyQ]',
    layoutMap,
  }: { hotkey?: DisplayHotkey; layoutMap?: KeyboardLayoutMap } = $props()
  const formatForDisplay = getFormatForDisplay()
  const keyboard = getKeyboardLayout()
</script>

<kbd>{formatForDisplay(hotkey, { layoutMap })}</kbd><i
  >{keyboard.layout?.get('KeyQ') ?? 'none'}</i
>
