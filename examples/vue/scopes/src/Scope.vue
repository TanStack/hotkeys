<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import ScopeFrame from './ScopeFrame.vue'
import type { ExclusiveOption } from './activity'

/** A `HotkeysProvider` with a box around its children, labeled with its props. */
withDefaults(
  defineProps<{
    scope: string
    exclusive?: ExclusiveOption
    enabled?: boolean
  }>(),
  // Undefined, not false, so the provider's own defaults apply.
  { exclusive: undefined, enabled: undefined },
)
</script>

<template>
  <HotkeysProvider :scope="scope" :exclusive="exclusive" :enabled="enabled">
    <ScopeFrame :scope="scope" :exclusive="exclusive" :enabled="enabled">
      <slot />
    </ScopeFrame>
  </HotkeysProvider>
</template>
