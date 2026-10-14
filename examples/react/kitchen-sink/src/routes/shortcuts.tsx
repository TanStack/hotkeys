import { useState } from 'react'
import { createLazyRoute } from '@tanstack/react-router'
import {
  formatForDisplay,
  isHotkeySequence,
  useAppHotkeyList,
  useCustomHotkeys,
  useHotkeyRecorder,
} from '@tanstack/react-hotkeys'
import { formatHotkey, useActivity } from '../shared'
import type {
  AppHotkeyId,
  Hotkey,
  RecorderKeyMode,
} from '@tanstack/react-hotkeys'

export const Route = createLazyRoute('/shortcuts')({ component: Shortcuts })

const statusLabels = {
  active: 'Active',
  disabled: 'Disabled',
  inactive: 'Not on this page',
  unbound: 'Unbound',
}

/**
 * Rebinds any app hotkey, including hotkeys on routes that have not loaded.
 * The provider owns custom hotkeys and saves them through
 * `onCustomHotkeysChange`; this route only calls `useCustomHotkeys`.
 */
function Shortcuts() {
  const log = useActivity()
  const items = useAppHotkeyList()
  const {
    customHotkeys,
    setCustomHotkey,
    resetCustomHotkey,
    resetCustomHotkeys,
    findConflicts,
  } = useCustomHotkeys()
  const [editing, setEditing] = useState<AppHotkeyId | null>(null)
  const [problem, setProblem] = useState('')
  const [mode, setMode] = useState<RecorderKeyMode>('code')
  const [idle, setIdle] = useState(false)

  const nameOf = (id: AppHotkeyId) =>
    items.find((item) => item.appHotkey.id === id)?.appHotkey.meta?.name ?? id

  const finish = (id: AppHotkeyId, message: string) => {
    setEditing(null)
    setProblem('')
    log(`${nameOf(id)}: ${message}`)
  }

  // One recorder for every app hotkey: a single chord or a sequence of up to
  // three. Enter (or the idle timeout) commits; one chord records a chord.
  const recorder = useHotkeyRecorder({
    maxSteps: 3,
    recordBy: mode,
    ignoreInputs: false,
    idleTimeoutMs: idle ? 1500 : undefined,
    validate: (hotkey: Hotkey) => {
      if (!editing) return true
      if (
        !isHotkeySequence(hotkey) &&
        !/^(Control|Alt|Shift|Meta|Mod)\+/.test(hotkey)
      ) {
        return 'Include a modifier, or record a sequence of two or more chords.'
      }
      const conflicts = findConflicts(editing, hotkey)
      return (
        conflicts.length === 0 ||
        `Conflicts with ${conflicts.map((c) => c.meta?.name ?? c.id).join(', ')}.`
      )
    },
    onReject: ({ message }) => setProblem(message),
    onRecord: (hotkey) => {
      if (!editing) return
      setCustomHotkey(editing, hotkey)
      finish(editing, formatHotkey(hotkey))
    },
    onClear: () => {
      if (!editing) return
      resetCustomHotkey(editing)
      finish(editing, 'restored default')
    },
    onCancel: () => {
      setEditing(null)
      setProblem('Recording cancelled. Hotkey unchanged.')
    },
  })

  const record = (id: AppHotkeyId) => {
    setEditing(id)
    setProblem('')
    recorder.startRecording()
  }

  const groups = [...new Set(items.map((item) => item.appHotkey.meta?.group))]

  return (
    <section>
      <h2>Shortcuts</h2>
      <p>
        Every declared hotkey, whether or not its route has loaded. Changes are
        saved to <code>localStorage</code> and survive a reload. Any hotkey can
        become a chord or a sequence.
      </p>
      <p>
        <label>
          Record by{' '}
          <select
            value={mode}
            disabled={recorder.isRecording}
            onChange={(e) => setMode(e.target.value as RecorderKeyMode)}
          >
            <option value="code">Physical code (default)</option>
            <option value="key">Logical character</option>
          </select>
        </label>{' '}
        <label>
          <input
            type="checkbox"
            checked={idle}
            onChange={(e) => setIdle(e.target.checked)}
          />{' '}
          Commit after 1.5 seconds idle
        </label>
      </p>
      <p>
        Press up to three chords, then Enter. Escape cancels. Backspace removes
        the last chord, or restores the default when nothing is recorded. Try
        Alt + 1 on a ticket action: it conflicts with a global navigation
        hotkey.
      </p>
      <p role="status">{problem}</p>
      {groups.map((group) => (
        <div key={group}>
          <h3>{group}</h3>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Hotkey</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items
                .filter((item) => item.appHotkey.meta?.group === group)
                .map(({ appHotkey, status, isCustom }) => {
                  const id = appHotkey.id
                  const isEditing = editing === id && recorder.isRecording
                  return (
                    <tr key={id}>
                      <td>
                        {appHotkey.meta?.name}
                        <br />
                        <small>{appHotkey.meta?.description}</small>
                      </td>
                      <td>
                        {isEditing
                          ? recorder.steps.length > 0
                            ? formatForDisplay(recorder.steps, {
                                sequenceSeparator: ' → ',
                              })
                            : 'Listening…'
                          : formatHotkey(appHotkey.hotkey)}
                        {isCustom && !isEditing && <small> (custom)</small>}
                      </td>
                      <td>{statusLabels[status]}</td>
                      <td>
                        {isEditing ? (
                          <>
                            <button
                              disabled={recorder.steps.length === 0}
                              onClick={recorder.commitRecording}
                            >
                              Save
                            </button>
                            <button onClick={recorder.cancelRecording}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              disabled={recorder.isRecording}
                              onClick={() => record(id)}
                            >
                              Record
                            </button>
                            <button
                              disabled={recorder.isRecording || !isCustom}
                              onClick={() => {
                                resetCustomHotkey(id)
                                finish(id, 'restored default')
                              }}
                            >
                              Reset
                            </button>
                            <button
                              disabled={
                                recorder.isRecording ||
                                appHotkey.hotkey === null
                              }
                              onClick={() => {
                                setCustomHotkey(id, null)
                                finish(id, 'unassigned')
                              }}
                            >
                              Unbind
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      ))}
      <h3>Saved custom hotkeys</h3>
      <p>
        Only differences from the declared defaults are saved, so a changed
        default reaches users who never customized it.
      </p>
      <pre>{JSON.stringify(customHotkeys, null, 2)}</pre>
      <button
        disabled={
          recorder.isRecording || Object.keys(customHotkeys).length === 0
        }
        onClick={() => {
          resetCustomHotkeys()
          log('Restored all default shortcuts')
        }}
      >
        Reset all
      </button>
    </section>
  )
}
