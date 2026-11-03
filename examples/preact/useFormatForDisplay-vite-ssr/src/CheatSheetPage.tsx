import { useEffect, useRef, useState } from 'preact/hooks'
import {
  detectPlatform,
  useDefaultHotkeysOptions,
  useFormatForDisplay,
  useHotkeys,
} from '@tanstack/preact-hotkeys'
import { commands } from './commands'
import {
  defaultChoices,
  optionGroups,
  platformName,
  toFormatCode,
  toFormatOptions,
} from './format-options'
import type { HotkeyPlatform } from '@tanstack/preact-hotkeys'
import type { FormatChoices } from './format-options'

interface LogEntry {
  id: number
  message: string
}

export function CheatSheetPage() {
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

  return (
    <main className="page">
      <Header />
      <FormatOptions choices={choices} onChange={setChoices} />
      <CheatSheet choices={choices} />
      <ActivityLog entries={log} />
    </main>
  )
}

function Header() {
  // The platform the server rendered with, from the provider
  const serverPlatform = useDefaultHotkeysOptions().platform
  // Read only in the browser after hydration, so it can't cause a mismatch
  const [browserPlatform, setBrowserPlatform] = useState<HotkeyPlatform | null>(
    null,
  )
  useEffect(() => setBrowserPlatform(detectPlatform()), [])

  return (
    <header className="header">
      <h1>Shortcut cheat sheet</h1>
      <p className="badges">
        {serverPlatform && (
          <span className="badge">
            Server rendered for: {platformName(serverPlatform)}
          </span>
        )}
        {browserPlatform && (
          <span className="badge badge-muted">
            This browser: {platformName(browserPlatform)}
          </span>
        )}
      </p>
      <p className="lead">
        Labels are rendered on the server with your platform, from the request's
        User-Agent header.
      </p>
    </header>
  )
}

function FormatOptions({
  choices,
  onChange,
}: {
  choices: FormatChoices
  onChange: (choices: FormatChoices) => void
}) {
  return (
    <section className="panel" aria-labelledby="format-options-title">
      <h2 id="format-options-title">Format options</h2>
      <div className="option-groups">
        {optionGroups.map((group) => (
          <fieldset key={group.id} className="option-group">
            <legend>{group.label}</legend>
            <div className="choices">
              {group.choices.map((choice) => (
                <label key={choice.value} className="choice">
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
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <pre className="code">
        <code>{toFormatCode(choices)}</code>
      </pre>
    </section>
  )
}

function CheatSheet({ choices }: { choices: FormatChoices }) {
  // Formats with the provider's platform, so the server renders the user's labels
  const format = useFormatForDisplay()
  const options = toFormatOptions(choices)

  return (
    <section className="panel" aria-labelledby="cheat-sheet-title">
      <h2 id="cheat-sheet-title">Shortcuts</h2>
      <table className="cheat-sheet">
        <tbody>
          {commands.map((command) => (
            <tr key={command.id} data-command={command.id}>
              <th scope="row">{command.name}</th>
              <td className="label">
                <HotkeyLabel
                  label={format(command.hotkey, options)}
                  sequenceSeparator={options.sequenceSeparator ?? ' '}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
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
}) {
  if (typeof label === 'string') return <kbd>{label}</kbd>
  const steps = isStepList(label) ? label : [label]

  return (
    <>
      {steps.map((step, index) => (
        <span key={index} className="step">
          {index > 0 && (
            <span className="sequence-separator">{sequenceSeparator}</span>
          )}
          {step.map((part, partIndex) => (
            <kbd key={partIndex}>{part}</kbd>
          ))}
        </span>
      ))}
    </>
  )
}

function isStepList(
  label: Array<string> | Array<Array<string>>,
): label is Array<Array<string>> {
  return Array.isArray(label[0])
}

function ActivityLog({ entries }: { entries: Array<LogEntry> }) {
  return (
    <section className="panel" aria-labelledby="activity-log-title">
      <h2 id="activity-log-title">Activity log</h2>
      {entries.length === 0 ? (
        <p className="empty">Press a shortcut</p>
      ) : (
        <ol className="log">
          {entries.map((entry) => (
            <li key={entry.id}>{entry.message}</li>
          ))}
        </ol>
      )}
    </section>
  )
}
