// Mistake: a cheat sheet built from live registrations misses unmounted pages.
import React, { useState } from 'react'
import {
  HotkeysProvider,
  defineAppHotkeys,
  formatForDisplay,
  useAppHotkeys,
  useCustomHotkeys,
  useHotkey,
  useHotkeyRecorder,
  useHotkeyRegistrations,
} from '../../../../src'
import type { ReactNode } from 'react'
import type { CustomHotkeys } from '../../../../src'
import type { ShortcutId } from '../fixture'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'report.print': { hotkey: 'Mod+P', meta: { name: 'Print report' } },
})

export function Root({ children }: { children: ReactNode }) {
  const [saved] = useState<CustomHotkeys>(() =>
    JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  )

  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={saved}
      onCustomHotkeysChange={(custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom))
      }
    >
      {children}
    </HotkeysProvider>
  )
}

export function EditorPage({ onSave }: { onSave: () => void }) {
  useHotkey(appHotkeys['doc.save'], () => onSave())
  return <section aria-label="Editor" />
}

export function ReportsPage({ onPrint }: { onPrint: () => void }) {
  useHotkey(appHotkeys['report.print'], () => onPrint())
  return <section aria-label="Reports" />
}

export function CheatSheet() {
  const registrations = useHotkeyRegistrations().filter(
    (registration) => registration.options.meta?.name,
  )

  return (
    <ul aria-label="Keyboard shortcuts">
      {registrations.map((registration) => (
        <li key={registration.id}>
          {registration.options.meta?.name}:{' '}
          {formatForDisplay(registration.hotkey)}
        </li>
      ))}
    </ul>
  )
}

export function ShortcutRow({ id }: { id: ShortcutId }) {
  const appHotkey = useAppHotkeys()[id]
  const { findConflicts, setCustomHotkey } = useCustomHotkeys()

  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = findConflicts(id, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => setCustomHotkey(id, hotkey),
  })

  return (
    <button onClick={recorder.startRecording}>
      Change {appHotkey?.meta?.name}
    </button>
  )
}
