<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'
import Key from './Key.vue'
import Scope from './Scope.vue'
import ScopeFrame from './ScopeFrame.vue'
import Steps from './Steps.vue'
import type { ExclusiveOption } from './activity'

defineProps<{ exclusive: ExclusiveOption }>()
const emit = defineEmits<{ close: []; save: [] }>()
useHotkey('Escape', () => emit('close'))
useHotkey('Mod+S', () => emit('save'))
</script>

<template>
  <!--
    Teleported to the body, outside the boxes above. The scope still comes
    from the provider around this component, not from where it renders.
  -->
  <Teleport to="body">
    <div class="backdrop" @click="emit('close')">
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Exclusive dialog"
        @click.stop
      >
        <ScopeFrame scope="dialog" :exclusive="exclusive">
          <h2>Exclusive dialog</h2>
          <p>
            <Key hotkey="Mod+S" /> saves this dialog instead of the document.
            <Key hotkey="Escape" /> closes it. The folder hotkeys are suspended,
            and so is anything you did not allow above.
          </p>
          <Scope scope="dialog-steps"><Steps /></Scope>
          <div class="actions">
            <button class="secondary" @click="emit('close')">Cancel</button>
            <button @click="emit('save')">Save</button>
          </div>
        </ScopeFrame>
      </div>
    </div>
  </Teleport>
</template>
