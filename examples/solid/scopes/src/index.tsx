import {
  For,
  Show,
  createContext,
  createSignal,
  omit,
  useContext,
} from 'solid-js'
import { Portal, render } from '@solidjs/web'
import {
  HotkeysProvider,
  createHotkey,
  formatForDisplay,
} from '@tanstack/solid-hotkeys'
import type { JSX } from '@solidjs/web'
import type { Hotkey } from '@tanstack/solid-hotkeys'
import './index.css'

// Every hotkey below is a plain `createHotkey` call with no `scope` option. It
// registers in the scope of the nearest `HotkeysProvider` that sets one.

function App() {
  return (
    <>
      <HotkeysProvider>
        <ActivityProvider>
          <div class="app">
            <header>
              <h1>Hotkey scopes</h1>
              <p>
                Each nested <code>HotkeysProvider</code> with a{' '}
                <code>scope</code> is a scope. Its hotkeys fire while it is
                mounted and enabled.
              </p>
            </header>
            <ScopeFrame>
              <Scope scope="palette">
                <Palette />
              </Scope>
              <Scope scope="document">
                <NestedDemo />
              </Scope>
              <Scope scope="mail">
                <TabsDemo />
              </Scope>
              <Scope scope="settings">
                <DialogDemo />
              </Scope>
              <ActivityLog />
            </ScopeFrame>
          </div>
        </ActivityProvider>
      </HotkeysProvider>
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
  children: JSX.Element
}

/** A `HotkeysProvider` with a box around its children, labeled with its props. */
function Scope(props: ScopeProps) {
  const others = omit(props, 'children')
  return (
    <HotkeysProvider {...others}>
      <ScopeFrame {...others}>{props.children}</ScopeFrame>
    </HotkeysProvider>
  )
}

/** The box alone, for content rendered apart from its provider, such as a dialog. */
function ScopeFrame(props: Partial<ScopeProps>) {
  const label = () => {
    const { scope = 'global', exclusive, enabled } = props
    const attributes = [
      scope !== 'global' && `scope="${scope}"`,
      exclusive &&
        `exclusive${exclusive === true ? '' : `={{ allow: [${exclusive.allow.map((s) => `'${s}'`).join(', ')}] }}`}`,
      enabled !== undefined && `enabled={${enabled}}`,
    ].filter(Boolean)
    return `<HotkeysProvider${attributes.map((a) => ` ${a}`).join('')}>`
  }
  return (
    <fieldset
      class="scope-frame"
      data-exclusive={!!props.exclusive}
      data-enabled={props.enabled !== false}
    >
      <legend>
        <code>{label()}</code>
      </legend>
      {props.children}
    </fieldset>
  )
}

// ---------------------------------------------------------------------------
// A hotkey in its own scope, so a dialog can allow just this one
// ---------------------------------------------------------------------------

function Palette() {
  const log = useLog()
  const [opened, setOpened] = createSignal(0)
  createHotkey('Mod+K', () => {
    setOpened((n) => n + 1)
    log('palette', 'Command palette opened')
  })
  return (
    <section class="demo-section">
      <h2>Command palette</h2>
      <p>
        <Key hotkey="Mod+K" /> lives in its own <code>palette</code> scope, so
        an exclusive dialog can allow it without allowing everything else.
      </p>
      <div class="counter">
        Opened {opened()} {opened() === 1 ? 'time' : 'times'}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Nested scopes beat their ancestors
// ---------------------------------------------------------------------------

function NestedDemo() {
  const log = useLog()
  const [showComments, setShowComments] = createSignal(true)
  createHotkey('Mod+S', () => log('document', 'Document saved'))

  return (
    <section class="demo-section">
      <h2>Nested scopes</h2>
      <p>
        The document and its comment box both register <Key hotkey="Mod+S" />.
        The comment box is nested, so it wins while it is mounted. Hide it and
        the document handles the key again.
      </p>
      <label>
        <input
          type="checkbox"
          checked={showComments()}
          onChange={(e) => setShowComments(e.currentTarget.checked)}
        />{' '}
        Show comment box
      </label>
      <Show when={showComments()}>
        <Scope scope="comments">
          <CommentBox />
        </Scope>
      </Show>
    </section>
  )
}

function CommentBox() {
  const log = useLog()
  const [comments, setComments] = createSignal(0)
  createHotkey('Mod+S', () => {
    setComments((n) => n + 1)
    log('comments', 'Comment posted')
  })
  return (
    <div class="panel">
      <strong>Comments</strong>
      <p>{comments()} posted</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// enabled turns a scope off without unmounting it
// ---------------------------------------------------------------------------

const folders = ['Inbox', 'Archive', 'Spam'] as const
type Folder = (typeof folders)[number]

function TabsDemo() {
  const [current, setCurrent] = createSignal<Folder>('Inbox')
  createHotkey('Alt+[Digit1]', () => setCurrent('Inbox'))
  createHotkey('Alt+[Digit2]', () => setCurrent('Archive'))
  createHotkey('Alt+[Digit3]', () => setCurrent('Spam'))

  return (
    <section class="demo-section">
      <h2>Enabled scopes</h2>
      <p>
        All three folders stay mounted and register <Key hotkey="Alt+N" />. Only
        the selected folder's provider is <code>enabled</code>, so the key adds
        to that one. Switch with <Key hotkey="Alt+1" />, <Key hotkey="Alt+2" />,
        and <Key hotkey="Alt+3" />.
      </p>
      <div class="folders">
        <For each={folders}>
          {(name) => (
            <Scope scope={name.toLowerCase()} enabled={current() === name}>
              <FolderPane
                name={name}
                current={current() === name}
                onSelect={() => setCurrent(name)}
              />
            </Scope>
          )}
        </For>
      </div>
    </section>
  )
}

function FolderPane(props: {
  name: Folder
  current: boolean
  onSelect: () => void
}) {
  const log = useLog()
  const [items, setItems] = createSignal(0)
  createHotkey('Alt+[KeyN]', () => {
    setItems((n) => n + 1)
    log(props.name.toLowerCase(), `Added to ${props.name}`)
  })
  return (
    <button
      class="panel folder"
      data-current={props.current}
      onClick={() => props.onSelect()}
    >
      <strong>{props.name}</strong>
      <span>{items()} items</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// exclusive suspends every other scope, except the ones it allows
// ---------------------------------------------------------------------------

const allowOptions = ['global', 'palette'] as const

function DialogDemo() {
  const log = useLog()
  const [open, setOpen] = createSignal(false)
  const [allow, setAllow] = createSignal<Array<string>>(['palette'])
  createHotkey('Alt+[KeyD]', () => setOpen(true))

  const exclusive = (): ExclusiveOption =>
    allow().length > 0 ? { allow: allow() } : true

  return (
    <section class="demo-section">
      <h2>Exclusive scopes</h2>
      <p>
        An exclusive provider suspends every other scope while it is mounted,
        including <code>global</code>. Scopes nested inside it keep working.
        List scopes in <code>allow</code> to keep them working too.
      </p>
      <fieldset>
        <legend>Allow while the dialog is open</legend>
        <For each={allowOptions}>
          {(scope) => (
            <label>
              <input
                type="checkbox"
                checked={allow().includes(scope)}
                onChange={(e) => {
                  const checked = e.currentTarget.checked
                  setAllow((prev) =>
                    checked
                      ? [...prev, scope]
                      : prev.filter((s) => s !== scope),
                  )
                }}
              />{' '}
              <code>{scope}</code>
            </label>
          )}
        </For>
      </fieldset>
      <button onClick={() => setOpen(true)}>
        Open dialog <Key hotkey="Alt+D" />
      </button>
      <Show when={open()}>
        <HotkeysProvider scope="dialog" exclusive={exclusive()}>
          <Dialog
            exclusive={exclusive()}
            onClose={() => setOpen(false)}
            onSave={() => {
              log('dialog', 'Dialog saved')
              setOpen(false)
            }}
          />
        </HotkeysProvider>
      </Show>
    </section>
  )
}

function Dialog(props: {
  exclusive: ExclusiveOption
  onClose: () => void
  onSave: () => void
}) {
  createHotkey('Escape', () => props.onClose())
  createHotkey('Mod+S', () => props.onSave())

  // Portaled to the body, outside the boxes above. The scope still comes from
  // the provider around this component, not from where it renders.
  return (
    <Portal>
      <div class="backdrop" onClick={() => props.onClose()}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Exclusive dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <ScopeFrame scope="dialog" exclusive={props.exclusive}>
            <h2>Exclusive dialog</h2>
            <p>
              <Key hotkey="Mod+S" /> saves this dialog instead of the document.{' '}
              <Key hotkey="Escape" /> closes it. The folder hotkeys are
              suspended, and so is anything you did not allow above.
            </p>
            <Scope scope="dialog-steps">
              <Steps />
            </Scope>
            <div class="actions">
              <button class="secondary" onClick={() => props.onClose()}>
                Cancel
              </button>
              <button onClick={() => props.onSave()}>Save</button>
            </div>
          </ScopeFrame>
        </div>
      </div>
    </Portal>
  )
}

/** Nested in the exclusive scope, so it stays active without being allowed. */
function Steps() {
  const log = useLog()
  const [step, setStep] = createSignal(1)
  createHotkey('Alt+[KeyN]', () => {
    setStep((n) => (n % 3) + 1)
    log('dialog-steps', 'Next step')
  })
  return (
    <div class="panel">
      Step {step()} of 3. <Key hotkey="Alt+N" /> moves to the next step. It is
      in the nested <code>dialog-steps</code> scope, so it still works, and it
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
  entries: () => Array<Entry>
  log: (scope: string, message: string) => void
  clear: () => void
}>()

let nextEntryId = 0

function ActivityProvider(props: { children: JSX.Element }) {
  const [entries, setEntries] = createSignal<Array<Entry>>([])
  const log = (scope: string, message: string) => {
    setEntries((prev) =>
      [{ id: nextEntryId++, scope, message }, ...prev].slice(0, 20),
    )
  }
  const clear = () => setEntries([])
  return (
    <ActivityContext value={{ entries, log, clear }}>
      {props.children}
    </ActivityContext>
  )
}

// A default-less context throws when its provider is missing.
function useActivity() {
  return useContext(ActivityContext)
}

function useLog() {
  return useActivity().log
}

/** Registered under the root provider, so it is in the `global` scope. */
function ActivityLog() {
  const { entries, clear } = useActivity()
  createHotkey('Alt+[KeyL]', clear)
  return (
    <section class="demo-section">
      <h2>Activity</h2>
      <p>
        <Key hotkey="Alt+L" /> clears the log. It is registered under the root
        provider, so it is in the <code>global</code> scope.
      </p>
      <div class="log">
        <Show
          when={entries().length > 0}
          fallback={<div class="hint">Press a hotkey above.</div>}
        >
          <For each={entries()}>
            {(entry) => (
              <div class="log-entry">
                <code class="log-scope">{entry.scope}</code>
                {entry.message}
              </div>
            )}
          </For>
        </Show>
      </div>
    </section>
  )
}

function Key(props: { hotkey: Hotkey }) {
  return <kbd>{formatForDisplay(props.hotkey)}</kbd>
}

render(() => <App />, document.getElementById('root')!)
