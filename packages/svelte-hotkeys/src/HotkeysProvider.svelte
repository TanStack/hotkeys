<script lang="ts">
  import { setHotkeysContextSource } from './HotkeysCtx'

  import type { HotkeysProviderProps } from './HotkeysCtx'

  let {
    children,
    defaultOptions,
    appHotkeys,
    customHotkeys,
    onCustomHotkeysChange,
    scope,
    exclusive,
    enabled,
  }: HotkeysProviderProps = $props()

  const context = setHotkeysContextSource(() => ({
    defaultOptions,
    appHotkeys,
    customHotkeys,
    onCustomHotkeysChange,
    scope,
    exclusive,
    enabled,
  }))

  // Keep declarations current (for example after hot module replacement).
  $effect(() => {
    if (appHotkeys) context.appHotkeysStore?.setAppHotkeys(appHotkeys)
  })
</script>

{@render children()}
