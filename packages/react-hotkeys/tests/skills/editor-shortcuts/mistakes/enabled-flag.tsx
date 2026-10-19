// Mistake: enabled turns the hotkey off, so the browser handles Mod+S.
import React, { useRef } from 'react'
import { HotkeysProvider, useHotkey } from '../../../../src'
import type { EditorProps } from '../fixture'

export function Editor(props: EditorProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useHotkey('Mod+S', () => props.onSave(), { enabled: props.dirty })
  useHotkey('Delete', () => props.onDeleteSelected(), { target: listRef })

  return (
    <main>
      <ul ref={listRef} aria-label="Files" tabIndex={0}>
        <li>notes.txt</li>
      </ul>
      {props.confirmOpen ? (
        <HotkeysProvider scope="confirm-dialog" exclusive>
          <ConfirmDialog onCancel={props.onCancelConfirm} />
        </HotkeysProvider>
      ) : null}
    </main>
  )
}

function ConfirmDialog({ onCancel }: { onCancel: () => void }) {
  useHotkey('Escape', () => onCancel())

  return (
    <div role="dialog" aria-label="Confirm">
      Delete notes.txt?
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}
