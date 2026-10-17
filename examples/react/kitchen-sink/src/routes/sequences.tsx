import { useState } from 'react'
import { createLazyRoute } from '@tanstack/react-router'
import {
  HotkeysProvider,
  useAppHotkeyList,
  useAppHotkeys,
  useHotkeys,
} from '@tanstack/react-hotkeys'
import { formatHotkey, useActivity } from '../shared'

export const Route = createLazyRoute('/sequences')({
  component: SequencesRoute,
})

/** The route's hotkeys fire only while this provider's scope is mounted. */
function SequencesRoute() {
  return (
    <HotkeysProvider scope="sequences">
      <Sequences />
    </HotkeysProvider>
  )
}

/** App sequences share a timeout and expose progress through their registrations. */
function Sequences() {
  const log = useActivity()
  const appHotkeys = useAppHotkeys()
  const [timeout, setTimeoutValue] = useState(1000)
  // App sequences register like any hotkey. commonOptions apply each option
  // only to the kinds that support it, so timeout reaches sequences only.
  useHotkeys(
    [
      {
        hotkey: appHotkeys['sequences.top'],
        callback: () => log('Sequence: go to top'),
      },
      {
        hotkey: appHotkeys['sequences.inbox'],
        callback: () => log('Sequence: inbox'),
      },
      {
        hotkey: appHotkeys['sequences.chain'],
        callback: () => log('Sequence: shifted chord chain'),
      },
    ],
    { timeout },
  )
  const items = useAppHotkeyList().filter(
    (item) => item.appHotkey.scope === 'sequences',
  )
  return (
    <section>
      <h2>Sequences</h2>
      <p>
        Try the physical G position twice, G then I, or hold Shift and press R
        then T. Rebind any of them on the Shortcuts route.
      </p>
      <label>
        Time between steps: {timeout} ms{' '}
        <input
          type="range"
          min="300"
          max="2500"
          step="100"
          value={timeout}
          onChange={(e) => setTimeoutValue(Number(e.target.value))}
        />
      </label>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Hotkey</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ appHotkey, registrations }) => {
            const reg = registrations.at(0)
            return (
              <tr key={appHotkey.id}>
                <td>{appHotkey.meta?.name}</td>
                <td>{formatHotkey(appHotkey.hotkey)}</td>
                <td>
                  {!reg
                    ? 'Unassigned'
                    : reg.kind === 'sequence'
                      ? `${reg.matchedStepCount}/${reg.hotkey.length} steps; ${reg.triggerCount} fired`
                      : `${reg.triggerCount} fired (rebound to a chord)`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p>
        Wrong keys and timeouts reset progress. Modifier-only presses and
        automatic repeats do not advance a sequence.
      </p>
    </section>
  )
}
