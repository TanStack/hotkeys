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

  // Apply saved custom hotkeys whose value changes, such as data that loads
  // after the first render. Only a provider with appHotkeys owns a store.
  $effect(() => {
    if (appHotkeys) context.appHotkeysStore?.setOptions({ customHotkeys })
  })
</script>

{@render children()}
