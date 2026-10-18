<script setup lang="ts">
import { computed } from 'vue'
import type { ExclusiveOption } from './activity'

/** The box alone, for content rendered apart from its provider, such as a dialog. */
const props = withDefaults(
  defineProps<{
    scope?: string
    exclusive?: ExclusiveOption
    enabled?: boolean
  }>(),
  // Undefined, not false, so the label only shows props that were passed.
  { scope: 'global', exclusive: undefined, enabled: undefined },
)

const label = computed(() => {
  const { scope, exclusive, enabled } = props
  const attributes = [
    scope !== 'global' && `scope="${scope}"`,
    exclusive &&
      (exclusive === true
        ? 'exclusive'
        : `:exclusive="{ allow: [${exclusive.allow.map((s) => `'${s}'`).join(', ')}] }"`),
    enabled !== undefined && `:enabled="${enabled}"`,
  ].filter(Boolean)
  return `<HotkeysProvider${attributes.map((a) => ` ${a}`).join('')}>`
})
</script>

<template>
  <fieldset
    class="scope-frame"
    :data-exclusive="!!exclusive"
    :data-enabled="enabled !== false"
  >
    <legend>
      <code>{{ label }}</code>
    </legend>
    <slot />
  </fieldset>
</template>
