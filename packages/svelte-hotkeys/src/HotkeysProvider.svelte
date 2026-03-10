<script lang="ts">
  import { DEFAULT_OPTIONS, setHotkeysContextSource } from './HotkeysCtx'

  import type { HotkeysProviderProps } from './HotkeysCtx'

  let { children, defaultOptions = DEFAULT_OPTIONS }: HotkeysProviderProps =
    $props()

  setHotkeysContextSource(() => defaultOptions)
</script>

{@render children()}
