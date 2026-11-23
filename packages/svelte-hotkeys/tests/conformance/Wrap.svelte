<script lang="ts">
  import Provider from './Provider.svelte'
  import type { ConformanceProvider } from '@tanstack/hotkeys-test-utils/conformance'
  import type { Component } from 'svelte'

  let {
    provider,
    view: View,
    props,
  }: {
    provider?: ConformanceProvider
    view: Component<any>
    props: Record<string, unknown>
  } = $props()
</script>

<Provider {provider}>
  <View {...props} />
</Provider>
