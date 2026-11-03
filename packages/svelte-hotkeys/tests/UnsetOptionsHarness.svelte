<script lang="ts">
  import { setHotkeysContext } from '../src/HotkeysCtx'
  import { createHotkey } from '../src/createHotkey.svelte'

  let {
    providerPreventDefault,
    preventDefault,
    stopPropagation,
  }: {
    providerPreventDefault?: boolean
    preventDefault?: boolean
    stopPropagation?: boolean
  } = $props()

  // svelte-ignore state_referenced_locally
  if (providerPreventDefault !== undefined) {
    setHotkeysContext({
      defaultOptions: { hotkey: { preventDefault: providerPreventDefault } },
    })
  }
  createHotkey(
    'Control+S',
    () => {},
    () => ({ platform: 'windows', preventDefault, stopPropagation }),
  )
</script>
