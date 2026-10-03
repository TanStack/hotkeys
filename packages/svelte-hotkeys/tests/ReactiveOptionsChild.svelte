<script lang="ts">
  import { createHotkey } from '../src/createHotkey.svelte'
  import type { HotkeyCallback } from '@tanstack/hotkeys'

  let {
    enabled,
    callback,
    kind,
  }: {
    enabled: boolean
    callback: HotkeyCallback
    kind: 'local' | 'provider'
  } = $props()
  createHotkey(
    'A',
    (event, context) => callback(event, context),
    () =>
      kind === 'local'
        ? {
            get enabled() {
              return enabled
            },
          }
        : {},
  )
</script>
