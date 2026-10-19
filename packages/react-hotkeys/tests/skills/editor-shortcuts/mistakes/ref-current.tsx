// Mistake: ref.current is null on the first render, so Delete listens on document.
import React, { useRef } from 'react'
import { HotkeysProvider, useHotkey } from '../../../../src'
import type { EditorProps } from '../fixture'

export function Editor(props: EditorProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useHotkey('Mod+S', () => {
    if (!props.dirty) return
    props.onSave()
  })
  useHotkey('Delete', () => props.onDeleteSelected(), {
    target: listRef.current,
  })

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
