<script lang="ts">
  import { getHotkeyRegistrations } from '../../src/getHotkeyRegistrations.svelte'
  import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

  let { onValue }: { onValue: (value: Array<HotkeyRegistrationView>) => void } =
    $props()
  const registrations = getHotkeyRegistrations()
  $effect.pre(() => onValue(registrations.hotkeys))
</script>

<output data-testid="count">{registrations.hotkeys.length}</output>
