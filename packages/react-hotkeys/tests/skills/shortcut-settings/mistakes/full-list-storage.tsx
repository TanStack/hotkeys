// Mistake: saving every effective hotkey freezes the defaults into saved data.
import React, { useEffect, useState } from 'react'
import {
  HotkeysProvider,
  defineAppHotkeys,
  formatForDisplay,
  useAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
  useHotkey,
  useHotkeyRecorder,
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
    <HotkeysProvider appHotkeys={appHotkeys} customHotkeys={saved}>
      <SaveAllHotkeys />
      {children}
    </HotkeysProvider>
  )
}

function SaveAllHotkeys() {
  const items = useAppHotkeyList()
  const all = Object.fromEntries(
    items.map(({ appHotkey }) => [appHotkey.id, appHotkey.hotkey]),
  )
  useEffect(() => {
    localStorage.setItem('hotkeys', JSON.stringify(all))
  })
  return null
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
  const items = useAppHotkeyList()

  return (
    <ul aria-label="Keyboard shortcuts">
      {items.map(({ appHotkey }) => (
        <li key={appHotkey.id}>
          {appHotkey.meta?.name}:{' '}
          {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
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
