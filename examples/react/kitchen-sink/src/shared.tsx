import { createContext, useContext, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  HotkeysProvider,
  formatForDisplay,
  useAppHotkeys,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/react-hotkeys'
import type { ReactNode } from 'react'
import type { AppHotkeyId, Hotkey } from '@tanstack/react-hotkeys'

export const ActivityContext = createContext<(message: string) => void>(
  () => {},
)

export function useActivity() {
  return useContext(ActivityContext)
}

/** Formats a chord or sequence, or reports that none is assigned. */
export function formatHotkey(hotkey: Hotkey | null): string {
  return hotkey
    ? formatForDisplay(hotkey, { sequenceSeparator: ' → ' })
    : 'Unassigned'
}

/**
 * Shows an app hotkey's current hotkey while its modifiers are held and it can
 * fire. The provider resolves custom hotkeys, so hints stay correct after
 * rebinding. Disabled and suspended hotkeys show no hint.
 */
export function Hint({ id }: { id: AppHotkeyId }) {
  const appHotkey = useAppHotkeys()[id]
  const visible = useHotkeyHint(appHotkey)
  return visible && appHotkey.hotkey ? (
    <kbd>{formatHotkey(appHotkey.hotkey)}</kbd>
  ) : null
}

interface ModalProps {
  title: string
  /** Hotkey scope for everything inside the modal. */
  scope: string
  /** Suspend other scopes while open. Defaults to true. */
  exclusive?: boolean | { allow: ReadonlyArray<string> }
  wide?: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * A native modal dialog, rendered in a portal under document.body. Its
 * provider still scopes the hotkeys inside it, because scopes follow the
 * component tree rather than the DOM.
 */
export function Modal({ scope, exclusive = true, ...props }: ModalProps) {
  return createPortal(
    <HotkeysProvider scope={scope} exclusive={exclusive}>
      <ModalDialog {...props} />
    </HotkeysProvider>,
    document.body,
  )
}

function ModalDialog({
  title,
  wide,
  onClose,
  children,
}: Omit<ModalProps, 'scope' | 'exclusive'>) {
  const appHotkeys = useAppHotkeys()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  // Registered in this modal's scope, so each open modal closes itself.
  useHotkey(appHotkeys['modal.close'], onClose)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      // React's autoFocus runs before the dialog opens, so focus here instead.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={ref}
      className="modal"
      data-wide={wide || undefined}
      aria-labelledby={titleId}
      // Escape is the modal.close hotkey; keep the browser from closing it first.
      onCancel={(e) => e.preventDefault()}
      // A click on the backdrop targets the dialog element itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-body">
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
