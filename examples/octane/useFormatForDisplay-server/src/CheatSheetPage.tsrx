import { useRef, useState, useSyncExternalStore } from 'octane'
import {
  detectPlatform,
  useDefaultHotkeysOptions,
  useFormatForDisplay,
  useHotkeys,
} from '@tanstack/octane-hotkeys'
import { commands } from './commands'
import {
  defaultChoices,
  optionGroups,
  platformName,
  toFormatCode,
  toFormatOptions,
} from './format-options'
import type { FormatChoices, OptionGroup } from './format-options'

interface LogEntry {
  id: number
  message: string
}

export function CheatSheetPage() @{
  const [choices, setChoices] = useState<FormatChoices>(defaultChoices)
  const [log, setLog] = useState<Array<LogEntry>>([])
  const nextLogId = useRef(0)

  useHotkeys(
    commands.map((command) => ({
      hotkey: command.hotkey,
      callback: () => {
        const entry = { id: nextLogId.current++, message: command.message }
        setLog((entries) => [entry, ...entries].slice(0, 5))
      },
      options: { meta: { name: command.name } },
    })),
  )

  <main className="page">
    <Header />
    <FormatOptions choices={choices} onChange={setChoices} />
    <CheatSheet choices={choices} />
    <ActivityLog entries={log} />
  </main>
}

const subscribe = () => () => {}

function Header() @{
  // The platform the server rendered with, from the provider
  const serverPlatform = useDefaultHotkeysOptions().platform
  // Read only in the browser after hydration, so it can't cause a mismatch
  const browserPlatform = useSyncExternalStore(
    subscribe,
    () => detectPlatform(),
    () => null,
  )

  <header className="header">
    <h1>Shortcut cheat sheet</h1>
    <p className="badges">
      @if (serverPlatform) {
        <span className="badge">
          Server rendered for: {platformName(serverPlatform)}
        </span>
      }
      @if (browserPlatform) {
        <span className="badge badge-muted">
          This browser: {platformName(browserPlatform)}
        </span>
      }
    </p>
    <p className="lead">
      Labels are rendered on the server with your platform, from the request's
      User-Agent header.
    </p>
  </header>
}

function FormatOptions({
  choices,
  onChange,
}: {
  choices: FormatChoices
  onChange: (choices: FormatChoices) => void
}) @{
  <section className="panel" aria-labelledby="format-options-title">
    <h2 id="format-options-title">Format options</h2>
    <div className="option-groups">
      @for (const group of optionGroups; key group.id) {
        <fieldset className="option-group">
          <legend>{group.label}</legend>
          <div className="choices">
            @for (const choice of choicesOf(group); key choice.value) {
              <label className="choice">
                <input
                  type="radio"
                  name={group.id}
                  value={choice.value}
                  checked={choices[group.id] === choice.value}
                  onChange={() =>
                    onChange({ ...choices, [group.id]: choice.value })
                  }
                />
                <span>{choice.label}</span>
              </label>
            }
          </div>
        </fieldset>
      }
    </div>
    <pre className="code">
      <code>{toFormatCode(choices)}</code>
    </pre>
  </section>
}

/** A group's choices as one array type, so `@for` can iterate any group. */
function choicesOf(
  group: OptionGroup,
): ReadonlyArray<OptionGroup['choices'][number]> {
  return group.choices
}

function CheatSheet({ choices }: { choices: FormatChoices }) @{
  // Formats with the provider's platform, so the server renders the user's labels
  const format = useFormatForDisplay()
  const options = toFormatOptions(choices)

  <section className="panel" aria-labelledby="cheat-sheet-title">
    <h2 id="cheat-sheet-title">Shortcuts</h2>
    <table className="cheat-sheet">
      <tbody>
        @for (const command of commands; key command.id) {
          <tr data-command={command.id}>
            <th scope="row">{command.name}</th>
            <td className="label">
              <HotkeyLabel
                label={format(command.hotkey, options)}
                sequenceSeparator={options.sequenceSeparator ?? ' '}
              />
            </td>
          </tr>
        }
      </tbody>
    </table>
  </section>
}

/**
 * Renders a label as one keycap, or with `parts: true` as one keycap per key.
 * A sequence's parts are one array per step.
 */
function HotkeyLabel({
  label,
  sequenceSeparator,
}: {
  label: string | Array<string> | Array<Array<string>>
  sequenceSeparator: string
}) @{
  @if (typeof label === 'string') {
    <kbd>{label}</kbd>
  } @else {
    @for (const [index, step] of toSteps(label).entries(); key index) {
      <span className="step">
        @if (index > 0) {
          <span className="sequence-separator">{sequenceSeparator}</span>
        }
        @for (const [partIndex, part] of step.entries(); key partIndex) {
          <kbd>{part}</kbd>
        }
      </span>
    }
  }
}

function toSteps(
  label: Array<string> | Array<Array<string>>,
): Array<Array<string>> {
  return isStepList(label) ? label : [label]
}

function isStepList(
  label: Array<string> | Array<Array<string>>,
): label is Array<Array<string>> {
  return Array.isArray(label[0])
}

function ActivityLog({ entries }: { entries: Array<LogEntry> }) @{
  <section className="panel" aria-labelledby="activity-log-title">
    <h2 id="activity-log-title">Activity log</h2>
    @if (entries.length === 0) {
      <p className="empty">Press a shortcut</p>
    } @else {
      <ol className="log">
        @for (const entry of entries; key entry.id) {
          <li>{entry.message}</li>
        }
      </ol>
    }
  </section>
}
