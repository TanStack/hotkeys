import React from 'react'
import type { ReactNode } from 'react'

export type ShortcutId = 'doc.save' | 'report.print'

export function Root({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function EditorPage(_props: { onSave: () => void }) {
  return <section aria-label="Editor" />
}

export function ReportsPage(_props: { onPrint: () => void }) {
  return <section aria-label="Reports" />
}

export function CheatSheet() {
  return <ul aria-label="Keyboard shortcuts" />
}

export function ShortcutRow({ id }: { id: ShortcutId }) {
  return <button>Change {id}</button>
}
