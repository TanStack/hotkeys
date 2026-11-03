<script lang="ts">
  import { onMount } from 'svelte'
  import {
    createHotkeys,
    detectPlatform,
    getDefaultHotkeysOptions,
    getFormatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  import type { HotkeyPlatform } from '@tanstack/svelte-hotkeys'
  import { commands } from './commands'
  import {
    defaultChoices,
    optionGroups,
    platformName,
    toFormatCode,
    toFormatOptions,
  } from './format-options'
  import type { FormatChoices } from './format-options'

  interface LogEntry {
    id: number
    message: string
  }

  type Label = string | Array<string> | Array<Array<string>>

  let choices = $state.raw<FormatChoices>(defaultChoices)
  let log = $state.raw<Array<LogEntry>>([])
  let nextLogId = 0

  createHotkeys(
    commands.map((command) => ({
      hotkey: command.hotkey,
      callback: () => {
        const entry = { id: nextLogId++, message: command.message }
        log = [entry, ...log].slice(0, 5)
      },
      options: { meta: { name: command.name } },
    })),
  )

  // The platform the server rendered with, from the provider
  const serverPlatform = getDefaultHotkeysOptions().platform

  // Read only in the browser after hydration, so it can't cause a mismatch
  let browserPlatform = $state<HotkeyPlatform | null>(null)
  onMount(() => {
    browserPlatform = detectPlatform()
  })

  // Formats with the provider's platform, so the server renders the user's labels
  const format = getFormatForDisplay()
  const options = $derived(toFormatOptions(choices))
  const sequenceSeparator = $derived(options.sequenceSeparator ?? ' ')

  /** A sequence's parts are one array per step; a chord's are one step. */
  function toSteps(label: Array<string> | Array<Array<string>>) {
    return isStepList(label) ? label : [label]
  }

  function isStepList(
    label: Array<string> | Array<Array<string>>,
  ): label is Array<Array<string>> {
    return Array.isArray(label[0])
  }
</script>

<!--
  Renders a label as one keycap, or with `parts: true` as one keycap per key.
-->
{#snippet hotkeyLabel(label: Label)}
  {#if typeof label === 'string'}
    <kbd>{label}</kbd>
  {:else}
    {#each toSteps(label) as step, index (index)}
      <span class="step"
        >{#if index > 0}<span class="sequence-separator"
            >{sequenceSeparator}</span
          >{/if}{#each step as part, partIndex (partIndex)}<kbd>{part}</kbd
          >{/each}</span
      >
    {/each}
  {/if}
{/snippet}

<main class="page">
  <header class="header">
    <h1>Shortcut cheat sheet</h1>
    <p class="badges">
      {#if serverPlatform}
        <span class="badge">
          Server rendered for: {platformName(serverPlatform)}
        </span>
      {/if}
      {#if browserPlatform}
        <span class="badge badge-muted">
          This browser: {platformName(browserPlatform)}
        </span>
      {/if}
    </p>
    <p class="lead">
      Labels are rendered on the server with your platform, from the request's
      User-Agent header.
    </p>
  </header>

  <section class="panel" aria-labelledby="format-options-title">
    <h2 id="format-options-title">Format options</h2>
    <div class="option-groups">
      {#each optionGroups as group (group.id)}
        <fieldset class="option-group">
          <legend>{group.label}</legend>
          <div class="choices">
            {#each group.choices as choice (choice.value)}
              <label class="choice">
                <input
                  type="radio"
                  name={group.id}
                  value={choice.value}
                  checked={choices[group.id] === choice.value}
                  onchange={() => {
                    choices = { ...choices, [group.id]: choice.value }
                  }}
                />
                <span>{choice.label}</span>
              </label>
            {/each}
          </div>
        </fieldset>
      {/each}
    </div>
    <pre class="code"><code>{toFormatCode(choices)}</code></pre>
  </section>

  <section class="panel" aria-labelledby="cheat-sheet-title">
    <h2 id="cheat-sheet-title">Shortcuts</h2>
    <table class="cheat-sheet">
      <tbody>
        {#each commands as command (command.id)}
          <tr data-command={command.id}>
            <th scope="row">{command.name}</th>
            <td class="label">
              {@render hotkeyLabel(format(command.hotkey, options))}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="panel" aria-labelledby="activity-log-title">
    <h2 id="activity-log-title">Activity log</h2>
    {#if log.length === 0}
      <p class="empty">Press a shortcut</p>
    {:else}
      <ol class="log">
        {#each log as entry (entry.id)}
          <li>{entry.message}</li>
        {/each}
      </ol>
    {/if}
  </section>
</main>
