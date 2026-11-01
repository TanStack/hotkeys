<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import '#lib/styles.css'
  import type { LayoutProps } from './$types'

  let { data, children }: LayoutProps = $props()
</script>

<!-- The platform from the request, for labels rendered on the server -->
<HotkeysProvider defaultOptions={{ platform: data.platform }}>
  {@render children()}
</HotkeysProvider>
