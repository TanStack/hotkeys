<script setup lang="ts">
import { computed, ref } from 'vue'
import { HotkeysProvider, useHotkey } from '@tanstack/vue-hotkeys'
import { useActivity } from './activity'
import ExclusiveDialog from './ExclusiveDialog.vue'
import Key from './Key.vue'
import type { ExclusiveOption } from './activity'

// `exclusive` suspends every other scope, except the ones it allows.
const allowOptions = ['global', 'palette'] as const
const { log } = useActivity()
const open = ref(false)
const allow = ref<Array<string>>(['palette'])
useHotkey('Alt+[KeyD]', () => (open.value = true))

const exclusive = computed<ExclusiveOption>(() =>
  allow.value.length > 0 ? { allow: allow.value } : true,
)

function save() {
  log('dialog', 'Dialog saved')
  open.value = false
}
</script>

<template>
  <section class="demo-section">
    <h2>Exclusive scopes</h2>
    <p>
      An exclusive provider suspends every other scope while it is mounted,
      including <code>global</code>. Scopes nested inside it keep working. List
      scopes in <code>allow</code> to keep them working too.
    </p>
    <fieldset>
      <legend>Allow while the dialog is open</legend>
      <label v-for="scope in allowOptions" :key="scope">
        <input v-model="allow" type="checkbox" :value="scope" />
        <code>{{ scope }}</code>
      </label>
    </fieldset>
    <button @click="open = true">Open dialog <Key hotkey="Alt+D" /></button>
    <HotkeysProvider v-if="open" scope="dialog" :exclusive="exclusive">
      <ExclusiveDialog
        :exclusive="exclusive"
        @close="open = false"
        @save="save"
      />
    </HotkeysProvider>
  </section>
</template>
