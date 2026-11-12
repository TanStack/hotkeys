<script lang="ts">
  import { getFormatForDisplay } from '../src/getFormatForDisplay'
  import { getKeyboardLayout } from '../src/getKeyboardLayout.svelte'
  import type { DisplayHotkey, KeyboardLayoutMap } from '@tanstack/hotkeys'

  let {
    hotkey = 'Mod+[KeyQ]',
    layoutMap,
  }: { hotkey?: DisplayHotkey; layoutMap?: KeyboardLayoutMap } = $props()
  const format = getFormatForDisplay()
  const keyboard = getKeyboardLayout()
</script>

<kbd>{format(hotkey, { layoutMap })}</kbd><i
  >{keyboard.layout?.get('KeyQ') ?? 'none'}</i
>
