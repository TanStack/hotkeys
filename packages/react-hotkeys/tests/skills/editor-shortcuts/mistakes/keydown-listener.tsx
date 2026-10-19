// Mistake: hand-written keydown listeners instead of registered hotkeys.
import React, { useEffect, useRef } from 'react'
import type { EditorProps } from '../fixture'

export function Editor(props: EditorProps) {
  const latest = useRef(props)
  latest.current = props

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (latest.current.dirty) latest.current.onSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main>
      <ul
        aria-label="Files"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Delete') props.onDeleteSelected()
        }}
      >
        <li>notes.txt</li>
      </ul>
      {props.confirmOpen ? (
        <ConfirmDialog onCancel={props.onCancelConfirm} />
      ) : null}
    </main>
  )
}

function ConfirmDialog({ onCancel }: { onCancel: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div role="dialog" aria-label="Confirm">
      Delete notes.txt?
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}
