import React, { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import ReactDOM from 'react-dom/client'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkey,
} from '@tanstack/react-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { ReactNode } from 'react'
import type { Hotkey } from '@tanstack/react-hotkeys'
import './index.css'

const plugins = [hotkeysDevtoolsPlugin()]

// Every hotkey below is a plain `useHotkey` call with no `scope` option. It
// registers in the scope of the nearest `HotkeysProvider` that sets one.

function App() {
  return (
    <>
      <HotkeysProvider>
        <ActivityProvider>
          <div className="app">
            <header>
              <h1>Hotkey scopes</h1>
              <p>
                Each nested <code>HotkeysProvider</code> with a{' '}
                <code>scope</code> is a scope. Its hotkeys fire while it is
                mounted and enabled. Open the hotkeys devtools to see which
                scopes are active, suspended, or allowed.
              </p>
            </header>
            <ScopeFrame>
              <HotkeysProvider scope="palette">
                <ScopeFrame scope="palette">
                  <Palette />
                </ScopeFrame>
              </HotkeysProvider>
              <HotkeysProvider scope="document">
                <ScopeFrame scope="document">
                  <NestedDemo />
                </ScopeFrame>
              </HotkeysProvider>
              <HotkeysProvider scope="mail">
                <ScopeFrame scope="mail">
                  <TabsDemo />
                </ScopeFrame>
              </HotkeysProvider>
              <HotkeysProvider scope="settings">
                <ScopeFrame scope="settings">
                  <DialogDemo />
                </ScopeFrame>
              </HotkeysProvider>
              <ActivityLog />
            </ScopeFrame>
          </div>
        </ActivityProvider>
      </HotkeysProvider>
      <TanStackDevtools plugins={plugins} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Providers drawn as boxes
// ---------------------------------------------------------------------------

type ExclusiveOption = boolean | { allow: ReadonlyArray<string> }

interface ScopeProps {
  scope: string
  exclusive?: ExclusiveOption
  enabled?: boolean
  children: ReactNode
}

/** A box labeled with its provider's props. Render it inside the provider. */
function ScopeFrame({
  scope = 'global',
  exclusive,
  enabled,
  children,
}: Partial<ScopeProps>) {
  const props = [
    scope !== 'global' && `scope="${scope}"`,
    exclusive &&
      `exclusive${exclusive === true ? '' : `={{ allow: [${exclusive.allow.map((s) => `'${s}'`).join(', ')}] }}`}`,
    enabled !== undefined && `enabled={${enabled}}`,
  ].filter(Boolean)
  return (
    <fieldset
      className="scope-frame"
      data-exclusive={!!exclusive}
      data-enabled={enabled !== false}
    >
      <legend>
        <code>{`<HotkeysProvider${props.map((p) => ` ${p}`).join('')}>`}</code>
      </legend>
      {children}
    </fieldset>
  )
}

// ---------------------------------------------------------------------------
// A hotkey in its own scope, so a dialog can allow just this one
// ---------------------------------------------------------------------------

function Palette() {
  const log = useLog()
  const [opened, setOpened] = useState(0)
  useHotkey('Mod+K', () => {
    setOpened((n) => n + 1)
    log('palette', 'Command palette opened')
  })
  return (
    <section className="demo-section">
      <h2>Command palette</h2>
      <p>
        <Key hotkey="Mod+K" /> lives in its own <code>palette</code> scope, so
        an exclusive dialog can allow it without allowing everything else.
      </p>
      <div className="counter">
        Opened {opened} {opened === 1 ? 'time' : 'times'}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Nested scopes beat their ancestors
// ---------------------------------------------------------------------------

function NestedDemo() {
  const log = useLog()
  const [showComments, setShowComments] = useState(true)
  useHotkey('Mod+S', () => log('document', 'Document saved'))

  return (
    <section className="demo-section">
      <h2>Nested scopes</h2>
      <p>
        The document and its comment box both register <Key hotkey="Mod+S" />.
        The comment box is nested, so it wins while it is mounted. Hide it and
        the document handles the key again.
      </p>
      <label>
        <input
          type="checkbox"
          checked={showComments}
          onChange={(e) => setShowComments(e.target.checked)}
        />{' '}
        Show comment box
      </label>
      {showComments && (
        <HotkeysProvider scope="comments">
          <ScopeFrame scope="comments">
            <CommentBox />
          </ScopeFrame>
        </HotkeysProvider>
      )}
    </section>
  )
}

function CommentBox() {
  const log = useLog()
  const [comments, setComments] = useState(0)
  useHotkey('Mod+S', () => {
    setComments((n) => n + 1)
    log('comments', 'Comment posted')
  })
  return (
    <div className="panel">
      <strong>Comments</strong>
      <p>{comments} posted</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// enabled turns a scope off without unmounting it
// ---------------------------------------------------------------------------

const folders = ['Inbox', 'Archive', 'Spam'] as const
type Folder = (typeof folders)[number]

function TabsDemo() {
  const [current, setCurrent] = useState<Folder>('Inbox')
  useHotkey('Alt+[Digit1]', () => setCurrent('Inbox'))
  useHotkey('Alt+[Digit2]', () => setCurrent('Archive'))
  useHotkey('Alt+[Digit3]', () => setCurrent('Spam'))

  return (
    <section className="demo-section">
      <h2>Enabled scopes</h2>
      <p>
        All three folders stay mounted and register <Key hotkey="Alt+N" />. Only
        the selected folder&apos;s provider is <code>enabled</code>, so the key
        adds to that one. Switch with <Key hotkey="Alt+1" />,{' '}
        <Key hotkey="Alt+2" />, and <Key hotkey="Alt+3" />.
      </p>
      <div className="folders">
        {folders.map((name) => (
          <HotkeysProvider
            key={name}
            scope={name.toLowerCase()}
            enabled={current === name}
          >
            <ScopeFrame scope={name.toLowerCase()} enabled={current === name}>
              <FolderPane
                name={name}
                current={current === name}
                onSelect={() => setCurrent(name)}
              />
            </ScopeFrame>
          </HotkeysProvider>
        ))}
      </div>
    </section>
  )
}

function FolderPane({
  name,
  current,
  onSelect,
}: {
  name: Folder
  current: boolean
  onSelect: () => void
}) {
  const log = useLog()
  const [items, setItems] = useState(0)
  useHotkey('Alt+[KeyN]', () => {
    setItems((n) => n + 1)
    log(name.toLowerCase(), `Added to ${name}`)
  })
  return (
    <button className="panel folder" data-current={current} onClick={onSelect}>
      <strong>{name}</strong>
      <span>{items} items</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// exclusive suspends every other scope, except the ones it allows
// ---------------------------------------------------------------------------

const allowOptions = ['global', 'palette'] as const

function DialogDemo() {
  const log = useLog()
  const [open, setOpen] = useState(false)
  const [allow, setAllow] = useState<Array<string>>(['palette'])
  useHotkey('Alt+[KeyD]', () => setOpen(true))

  const exclusive = allow.length > 0 ? { allow } : true

  return (
    <section className="demo-section">
      <h2>Exclusive scopes</h2>
      <p>
        An exclusive provider suspends every other scope while it is mounted,
        including <code>global</code>. Scopes nested inside it keep working.
        List scopes in <code>allow</code> to keep them working too.
      </p>
      <fieldset>
        <legend>Allow while the dialog is open</legend>
        {allowOptions.map((scope) => (
          <label key={scope}>
            <input
              type="checkbox"
              checked={allow.includes(scope)}
              onChange={(e) =>
                setAllow((prev) =>
                  e.target.checked
                    ? [...prev, scope]
                    : prev.filter((s) => s !== scope),
                )
              }
            />{' '}
            <code>{scope}</code>
          </label>
        ))}
      </fieldset>
      <button onClick={() => setOpen(true)}>
        Open dialog <Key hotkey="Alt+D" />
      </button>
      {open && (
        <HotkeysProvider scope="dialog" exclusive={exclusive}>
          <Dialog
            exclusive={exclusive}
            onClose={() => setOpen(false)}
            onSave={() => {
              log('dialog', 'Dialog saved')
              setOpen(false)
            }}
          />
        </HotkeysProvider>
      )}
    </section>
  )
}

function Dialog({
  exclusive,
  onClose,
  onSave,
}: {
  exclusive: ExclusiveOption
  onClose: () => void
  onSave: () => void
}) {
  useHotkey('Escape', onClose)
  useHotkey('Mod+S', onSave)

  // Portaled to the body, outside the boxes above. The scope still comes from
  // the provider around this component, not from where it renders.
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Exclusive dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <ScopeFrame scope="dialog" exclusive={exclusive}>
          <h2>Exclusive dialog</h2>
          <p>
            <Key hotkey="Mod+S" /> saves this dialog instead of the document.{' '}
            <Key hotkey="Escape" /> closes it. The folder hotkeys are suspended,
            and so is anything you did not allow above.
          </p>
          <HotkeysProvider scope="dialog-steps">
            <ScopeFrame scope="dialog-steps">
              <Steps />
            </ScopeFrame>
          </HotkeysProvider>
          <div className="actions">
            <button className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button onClick={onSave}>Save</button>
          </div>
        </ScopeFrame>
      </div>
    </div>,
    document.body,
  )
}

/** Nested in the exclusive scope, so it stays active without being allowed. */
function Steps() {
  const log = useLog()
  const [step, setStep] = useState(1)
  useHotkey('Alt+[KeyN]', () => {
    setStep((n) => (n % 3) + 1)
    log('dialog-steps', 'Next step')
  })
  return (
    <div className="panel">
      Step {step} of 3. <Key hotkey="Alt+N" /> moves to the next step. It is in
      the nested <code>dialog-steps</code> scope, so it still works, and it
      takes the key from the suspended folders.
    </div>
  )
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

interface Entry {
  id: number
  scope: string
  message: string
}

const ActivityContext = createContext<{
  entries: Array<Entry>
  log: (scope: string, message: string) => void
  clear: () => void
} | null>(null)

let nextEntryId = 0

function ActivityProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Array<Entry>>([])
  const log = useCallback((scope: string, message: string) => {
    setEntries((prev) =>
      [{ id: nextEntryId++, scope, message }, ...prev].slice(0, 20),
    )
  }, [])
  const clear = useCallback(() => setEntries([]), [])
  return (
    <ActivityContext value={{ entries, log, clear }}>
      {children}
    </ActivityContext>
  )
}

function useActivity() {
  const activity = useContext(ActivityContext)
  if (!activity) throw new Error('Missing ActivityProvider')
  return activity
}

function useLog() {
  return useActivity().log
}

/** Registered under the root provider, so it is in the `global` scope. */
function ActivityLog() {
  const { entries, clear } = useActivity()
  useHotkey('Alt+[KeyL]', clear)
  return (
    <section className="demo-section">
      <h2>Activity</h2>
      <p>
        <Key hotkey="Alt+L" /> clears the log. It is registered under the root
        provider, so it is in the <code>global</code> scope.
      </p>
      <div className="log">
        {entries.length === 0 ? (
          <div className="hint">Press a hotkey above.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="log-entry">
              <code className="log-scope">{entry.scope}</code>
              {entry.message}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function Key({ hotkey }: { hotkey: Hotkey }) {
  return <kbd>{formatForDisplay(hotkey)}</kbd>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
