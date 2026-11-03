import { For, Show, createSignal, onMount } from 'solid-js'
import {
  createFormatForDisplay,
  createHotkeys,
  detectPlatform,
  useHotkeysContext,
} from '@tanstack/solid-hotkeys'
import { commands } from './commands'
import {
  defaultChoices,
  optionGroups,
  platformName,
  toFormatCode,
  toFormatOptions,
} from './format-options'
import type { HotkeyPlatform } from '@tanstack/solid-hotkeys'
import type { FormatChoices } from './format-options'

interface LogEntry {
  id: number
  message: string
}

export function CheatSheetPage() {
  const [choices, setChoices] = createSignal<FormatChoices>(defaultChoices)
  const [log, setLog] = createSignal<Array<LogEntry>>([])
  let nextLogId = 0

  createHotkeys(
    commands.map((command) => ({
      hotkey: command.hotkey,
      callback: () => {
        const entry = { id: nextLogId++, message: command.message }
        setLog((entries) => [entry, ...entries].slice(0, 5))
      },
      options: { meta: { name: command.name } },
    })),
  )

  return (
    <main class="page">
      <Header />
      <FormatOptions choices={choices()} onChange={setChoices} />
      <CheatSheet choices={choices()} />
      <ActivityLog entries={log()} />
    </main>
  )
}

function Header() {
  const context = useHotkeysContext()
  // The platform the server rendered with, from the provider
  const serverPlatform = () => context?.defaultOptions.platform
  // Read only in the browser after hydration, so it can't cause a mismatch
  const [browserPlatform, setBrowserPlatform] =
    createSignal<HotkeyPlatform | null>(null)
  onMount(() => setBrowserPlatform(detectPlatform()))

  return (
    <header class="header">
      <h1>Shortcut cheat sheet</h1>
      <p class="badges">
        <Show when={serverPlatform()}>
          {(platform) => (
            <span class="badge">
              Server rendered for: {platformName(platform())}
            </span>
          )}
        </Show>
        <Show when={browserPlatform()}>
          {(platform) => (
            <span class="badge badge-muted">
              This browser: {platformName(platform())}
            </span>
          )}
        </Show>
      </p>
      <p class="lead">
        Labels are rendered on the server with your platform, from the request's
        User-Agent header.
      </p>
    </header>
  )
}

function FormatOptions(props: {
  choices: FormatChoices
  onChange: (choices: FormatChoices) => void
}) {
  return (
    <section class="panel" aria-labelledby="format-options-title">
      <h2 id="format-options-title">Format options</h2>
      <div class="option-groups">
        <For each={optionGroups}>
          {(group) => (
            <fieldset class="option-group">
              <legend>{group.label}</legend>
              <div class="choices">
                <For each={group.choices}>
                  {(choice) => (
                    <label class="choice">
                      <input
                        type="radio"
                        name={group.id}
                        value={choice.value}
                        checked={props.choices[group.id] === choice.value}
                        onChange={() =>
                          props.onChange({
                            ...props.choices,
                            [group.id]: choice.value,
                          })
                        }
                      />
                      <span>{choice.label}</span>
                    </label>
                  )}
                </For>
              </div>
            </fieldset>
          )}
        </For>
      </div>
      <pre class="code">
        <code>{toFormatCode(props.choices)}</code>
      </pre>
    </section>
  )
}

function CheatSheet(props: { choices: FormatChoices }) {
  // Formats with the provider's platform, so the server renders the user's labels
  const format = createFormatForDisplay()
  const options = () => toFormatOptions(props.choices)

  return (
    <section class="panel" aria-labelledby="cheat-sheet-title">
      <h2 id="cheat-sheet-title">Shortcuts</h2>
      <table class="cheat-sheet">
        <tbody>
          <For each={commands}>
            {(command) => (
              <tr data-command={command.id}>
                <th scope="row">{command.name}</th>
                <td class="label">
                  <HotkeyLabel
                    label={format(command.hotkey, options())}
                    sequenceSeparator={options().sequenceSeparator ?? ' '}
                  />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </section>
  )
}

type Label = string | Array<string> | Array<Array<string>>

/**
 * Renders a label as one keycap, or with `parts: true` as one keycap per key.
 * A sequence's parts are one array per step.
 */
function HotkeyLabel(props: { label: Label; sequenceSeparator: string }) {
  return (
    <Show when={toSteps(props.label)} fallback={<kbd>{props.label}</kbd>}>
      {(steps) => (
        <For each={steps()}>
          {(step, index) => (
            <span class="step">
              <Show when={index() > 0}>
                <span class="sequence-separator">
                  {props.sequenceSeparator}
                </span>
              </Show>
              <For each={step}>{(part) => <kbd>{part}</kbd>}</For>
            </span>
          )}
        </For>
      )}
    </Show>
  )
}

/** The keycaps of each step, or `undefined` for a text label. */
function toSteps(label: Label): Array<Array<string>> | undefined {
  if (typeof label === 'string') return undefined
  return isStepList(label) ? label : [label]
}

function isStepList(
  label: Array<string> | Array<Array<string>>,
): label is Array<Array<string>> {
  return Array.isArray(label[0])
}

function ActivityLog(props: { entries: Array<LogEntry> }) {
  return (
    <section class="panel" aria-labelledby="activity-log-title">
      <h2 id="activity-log-title">Activity log</h2>
      <Show
        when={props.entries.length > 0}
        fallback={<p class="empty">Press a shortcut</p>}
      >
        <ol class="log">
          <For each={props.entries}>{(entry) => <li>{entry.message}</li>}</For>
        </ol>
      </Show>
    </section>
  )
}
