<script setup lang="ts">
import { computed } from 'vue'

/**
 * Renders a label as one keycap, or with `parts: true` as one keycap per key.
 * A sequence's parts are one array per step.
 */
const props = defineProps<{
  label: string | Array<string> | Array<Array<string>>
  sequenceSeparator: string
}>()

const steps = computed(() => {
  const label = props.label
  if (typeof label === 'string') return []
  return isStepList(label) ? label : [label]
})

function isStepList(
  label: Array<string> | Array<Array<string>>,
): label is Array<Array<string>> {
  return Array.isArray(label[0])
}
</script>

<template>
  <kbd v-if="typeof label === 'string'">{{ label }}</kbd>
  <template v-else>
    <span v-for="(step, index) in steps" :key="index" class="step">
      <span v-if="index > 0" class="sequence-separator">{{
        sequenceSeparator
      }}</span>
      <kbd v-for="(part, partIndex) in step" :key="partIndex">{{ part }}</kbd>
    </span>
  </template>
</template>
