<script lang="ts">
  import { untrack } from 'svelte'
  import {
    createHotkey,
    createHotkeyAttachment,
  } from '../../src/createHotkey.svelte'
  import type { ConformanceHotkey } from '@tanstack/hotkeys-test-utils/conformance'
  import type { Attachment } from 'svelte/attachments'

  let {
    entry,
    onElement,
  }: { entry: ConformanceHotkey; onElement: (element: HTMLElement) => void } =
    $props()

  const hotkey = () => entry.hotkey as never
  const options = () => {
    const { target: _target, ...rest } = entry.options ?? {}
    return rest
  }
  // createHotkey keeps its first callback.
  const callback = untrack(() => entry.callback)
  // Svelte listens on an element through an attachment, not a target option.
  let attach: Attachment<HTMLElement> | undefined
  if (untrack(() => entry.options?.target === 'element')) {
    const hotkeyAttachment = createHotkeyAttachment(hotkey, callback, options)
    attach = (element) => {
      onElement(element)
      return hotkeyAttachment(element)
    }
  } else {
    createHotkey(hotkey, callback, options)
  }
</script>

{#if attach}
  <div tabindex="0" {@attach attach}></div>
{/if}
