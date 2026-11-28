<script lang="ts">
  import { setHotkeysContextSource } from './HotkeysCtx.js'
  import type { HotkeysProviderProps } from './HotkeysCtx.js'

  let {
    children,
    defaultOptions,
    appHotkeys,
    customHotkeys,
    onCustomHotkeysChange,
    scope,
    exclusive,
    enabled,
    suspendCharacterKeys,
  }: HotkeysProviderProps = $props()

  setHotkeysContextSource(() => ({
    defaultOptions,
    appHotkeys,
    customHotkeys,
    onCustomHotkeysChange,
    scope,
    exclusive,
    enabled,
    suspendCharacterKeys,
  }))
</script>

{@render children()}
