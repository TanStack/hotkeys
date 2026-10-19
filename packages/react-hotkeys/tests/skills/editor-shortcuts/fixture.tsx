import React from 'react'

export interface EditorProps {
  dirty: boolean
  confirmOpen: boolean
  onSave: () => void
  onDeleteSelected: () => void
  onCancelConfirm: () => void
}

export function Editor(props: EditorProps) {
  return (
    <main>
      <ul aria-label="Files" tabIndex={0}>
        <li>notes.txt</li>
      </ul>
      {props.confirmOpen ? (
        <ConfirmDialog onCancel={props.onCancelConfirm} />
      ) : null}
    </main>
  )
}

function ConfirmDialog({ onCancel }: { onCancel: () => void }) {
  return (
    <div role="dialog" aria-label="Confirm">
      Delete notes.txt?
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}
