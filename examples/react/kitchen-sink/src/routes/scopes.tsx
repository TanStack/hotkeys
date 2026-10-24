import { useState } from 'react'
import { createLazyRoute } from '@tanstack/react-router'
import {
  HotkeysProvider,
  useAppHotkeys,
  useHotkey,
  useHotkeyScopesState,
} from '@tanstack/react-hotkeys'
import { Hint, Modal, formatHotkey, useActivity } from '../shared'

export const Route = createLazyRoute('/scopes')({ component: ScopesRoute })

/** Every hotkey on this route registers in the `scopes` scope unless it declares another. */
function ScopesRoute() {
  return (
    <HotkeysProvider scope="scopes">
      <Scopes />
    </HotkeysProvider>
  )
}

const workspaces = ['Inbox', 'Archive'] as const
type Workspace = (typeof workspaces)[number]

/**
 * A document, a dialog that takes over the keyboard, and two workspaces that
 * stay mounted while only one handles hotkeys.
 */
function Scopes() {
  const log = useActivity()
  const appHotkeys = useAppHotkeys()
  const [saves, setSaves] = useState(0)
  const [title, setTitle] = useState('Quarterly report')
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState<Workspace>('Inbox')

  useHotkey(appHotkeys['scopes.save'], () => {
    setSaves((n) => n + 1)
    log('Document saved')
  })
  useHotkey(appHotkeys['scopes.edit'], () => setEditing(true))

  return (
    <section>
      <h2>Scopes</h2>
      <ScopeStatus />
      <p>
        This route renders <code>{'<HotkeysProvider scope="scopes">'}</code>.{' '}
        <kbd>{formatHotkey(appHotkeys['scopes.save'].hotkey)}</kbd> saves the
        document here and the editors on the Editor route, because each route
        has its own scope.
      </p>
      <fieldset>
        <legend>Document — {saves} saves</legend>
        <p>
          Title: <strong>{title}</strong>
        </p>
        <button onClick={() => setEditing(true)}>
          Edit details <Hint id="scopes.edit" />
        </button>
      </fieldset>

      <fieldset>
        <legend>Workspaces</legend>
        <p>
          Both workspaces stay mounted. Each has its own scope, and only the
          selected one is enabled, so{' '}
          <kbd>{formatHotkey(appHotkeys['workspace.add'].hotkey)}</kbd> adds to
          that one.
        </p>
        {workspaces.map((name) => (
          <label key={name}>
            <input
              type="radio"
              name="workspace"
              checked={current === name}
              onChange={() => setCurrent(name)}
            />{' '}
            {name}
          </label>
        ))}
        <div className="workspaces">
          {workspaces.map((name) => (
            <HotkeysProvider
              key={name}
              scope={`workspace-${name.toLowerCase()}`}
              enabled={current === name}
            >
              <WorkspacePane name={name} current={current === name} />
            </HotkeysProvider>
          ))}
        </div>
      </fieldset>

      {editing && (
        <DetailsDialog
          title={title}
          onSave={(next) => {
            setTitle(next)
            setEditing(false)
            log('Details saved')
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  )
}

/** Shows the active scopes. */
function ScopeStatus() {
  const { active, exclusive, suspended } = useHotkeyScopesState()
  return (
    <p className="scope-status">
      Active scopes:
      {['global', ...active].map((scope) => (
        <code
          key={scope}
          data-exclusive={scope === exclusive || undefined}
          data-suspended={suspended.includes(scope) || undefined}
        >
          {scope}
        </code>
      ))}
      {exclusive && (
        <>
          {' '}
          — <code>{exclusive}</code> is exclusive; struck-out scopes are
          suspended
        </>
      )}
    </p>
  )
}

function WorkspacePane({ name, current }: { name: string; current: boolean }) {
  const log = useActivity()
  const appHotkeys = useAppHotkeys()
  const [items, setItems] = useState(0)
  useHotkey(appHotkeys['workspace.add'], () => {
    setItems((n) => n + 1)
    log(`${name}: item added`)
  })
  return (
    <div className="workspace" data-current={current || undefined}>
      <strong>{name}</strong>
      <p>
        {/* Hints follow the app hotkey, which the other pane also registers. */}
        {items} items{current && <Hint id="workspace.add" />}
      </p>
    </div>
  )
}

/**
 * An exclusive modal that allows global hotkeys and the shortcut panel, so
 * navigation and Show shortcuts still work while it is open.
 */
function DetailsDialog({
  title,
  onSave,
  onClose,
}: {
  title: string
  onSave: (title: string) => void
  onClose: () => void
}) {
  return (
    <Modal
      title="Edit details"
      scope="details-dialog"
      exclusive={{ allow: ['global', 'shortcut-panel'] }}
      onClose={onClose}
    >
      <DetailsForm title={title} onSave={onSave} onClose={onClose} />
    </Modal>
  )
}

function DetailsForm({
  title,
  onSave,
  onClose,
}: {
  title: string
  onSave: (title: string) => void
  onClose: () => void
}) {
  const appHotkeys = useAppHotkeys()
  const [draft, setDraft] = useState(title)
  useHotkey(appHotkeys['details.save'], () => onSave(draft))

  return (
    <>
      <label>
        Title
        <input
          data-autofocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <p>
        <kbd>{formatHotkey(appHotkeys['details.save'].hotkey)}</kbd> saves these
        details instead of the document.{' '}
        <kbd>{formatHotkey(appHotkeys['modal.close'].hotkey)}</kbd> closes. This
        dialog is exclusive but allows the <code>global</code> and{' '}
        <code>shortcut-panel</code> scopes, so navigation and{' '}
        <kbd>{formatHotkey(appHotkeys['panel.toggle'].hotkey)}</kbd> still work.
        The page and workspace hotkeys are suspended.
      </p>
      <div className="modal-actions">
        <button onClick={onClose}>Cancel</button>
        <button className="primary" onClick={() => onSave(draft)}>
          Save <Hint id="details.save" />
        </button>
      </div>
    </>
  )
}
