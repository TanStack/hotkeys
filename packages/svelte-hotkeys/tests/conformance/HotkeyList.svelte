<script lang="ts">
  import {
    createHotkeys,
    createHotkeysAttachment,
  } from '../../src/createHotkeys.svelte'
  import type { ConformanceHotkey } from '@tanstack/hotkeys-test-utils/conformance'
  import type { CreateHotkeyDefinition } from '../../src/createHotkeys.svelte'

  let {
    hotkeys,
    onElement,
  }: {
    hotkeys: Array<ConformanceHotkey>
    onElement: (element: HTMLElement) => void
  } = $props()

  // Svelte listens on an element through an attachment, so entries with an
  // element target go to createHotkeysAttachment.
  const definitions = (onElementTarget: boolean) =>
    hotkeys
      .filter(
        (entry) => (entry.options?.target === 'element') === onElementTarget,
      )
      .map(({ hotkey, callback, options = {} }) => {
        const { target: _target, ...rest } = options
        return { hotkey, callback, options: rest }
      }) as Array<CreateHotkeyDefinition>

  createHotkeys(() => definitions(false))
  const listAttachment = createHotkeysAttachment(() => definitions(true))
  const attach = (element: HTMLElement) => {
    onElement(element)
    return listAttachment(element)
  }
</script>

<div tabindex="0" {@attach attach}></div>
