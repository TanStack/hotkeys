<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  detectPlatform,
  useDefaultHotkeysOptions,
  useFormatForDisplay,
  useHotkeys,
} from '@tanstack/vue-hotkeys'
import { commands } from '../commands'
import {
  defaultChoices,
  optionGroups,
  platformName,
  toFormatCode,
  toFormatOptions,
} from '../format-options'
import HotkeyLabel from './HotkeyLabel.vue'
import type { HotkeyPlatform } from '@tanstack/vue-hotkeys'
import type { FormatChoices } from '../format-options'

interface LogEntry {
  id: number
  message: string
}

const choices = reactive<FormatChoices>({ ...defaultChoices })
const log = ref<Array<LogEntry>>([])
let nextLogId = 0

useHotkeys(
  commands.map((command) => ({
    hotkey: command.hotkey,
    callback: () => {
      const entry = { id: nextLogId++, message: command.message }
      log.value = [entry, ...log.value].slice(0, 5)
    },
    options: { meta: { name: command.name } },
  })),
)

// The platform the server rendered with, from the provider
const serverPlatform = useDefaultHotkeysOptions().platform
// Read only in the browser after mount, so it can't cause a mismatch
const browserPlatform = ref<HotkeyPlatform | null>(null)
onMounted(() => {
  browserPlatform.value = detectPlatform()
})

// Formats with the provider's platform, so the server renders the user's labels
const format = useFormatForDisplay()
const options = computed(() => toFormatOptions(choices))
</script>

<template>
  <main class="page">
    <header class="header">
      <h1>Shortcut cheat sheet</h1>
      <p class="badges">
        <span v-if="serverPlatform" class="badge">
          Server rendered for: {{ platformName(serverPlatform) }}
        </span>
        <span v-if="browserPlatform" class="badge badge-muted">
          This browser: {{ platformName(browserPlatform) }}
        </span>
      </p>
      <p class="lead">
        Labels are rendered on the server with your platform, from the request's
        User-Agent header.
      </p>
    </header>

    <section class="panel" aria-labelledby="format-options-title">
      <h2 id="format-options-title">Format options</h2>
      <div class="option-groups">
        <fieldset
          v-for="group in optionGroups"
          :key="group.id"
          class="option-group"
        >
          <legend>{{ group.label }}</legend>
          <div class="choices">
            <label
              v-for="choice in group.choices"
              :key="choice.value"
              class="choice"
            >
              <input
                v-model="choices[group.id]"
                type="radio"
                :name="group.id"
                :value="choice.value"
              />
              <span>{{ choice.label }}</span>
            </label>
          </div>
        </fieldset>
      </div>
      <pre class="code"><code>{{ toFormatCode(choices) }}</code></pre>
    </section>

    <section class="panel" aria-labelledby="cheat-sheet-title">
      <h2 id="cheat-sheet-title">Shortcuts</h2>
      <table class="cheat-sheet">
        <tbody>
          <tr
            v-for="command in commands"
            :key="command.id"
            :data-command="command.id"
          >
            <th scope="row">{{ command.name }}</th>
            <td class="label">
              <HotkeyLabel
                :label="format(command.hotkey, options)"
                :sequence-separator="options.sequenceSeparator ?? ' '"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="panel" aria-labelledby="activity-log-title">
      <h2 id="activity-log-title">Activity log</h2>
      <p v-if="log.length === 0" class="empty">Press a shortcut</p>
      <ol v-else class="log">
        <li v-for="entry in log" :key="entry.id">{{ entry.message }}</li>
      </ol>
    </section>
  </main>
</template>
