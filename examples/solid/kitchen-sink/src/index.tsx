import {
  Show,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import {
  HotkeysProvider,
  createHeldKeyCodes,
  createHeldKeys,
  createHotkey,
  createHotkeyHint,
  createHotkeyRecorder,
  createHotkeyRegistrations,
  createHotkeySequence,
  createHotkeySequenceRecorder,
  createHotkeySequences,
  createHotkeys,
  createKeyHold,
  formatForDisplay,
} from '@tanstack/solid-hotkeys'
import type {
  Hotkey,
  HotkeySequence,
  RecorderKeyMode,
  RegisterableHotkey,
} from '@tanstack/solid-hotkeys'
import './styles.css'
import type { JSX } from 'solid-js'

const ActivityContext = createContext<(message: string) => void>(() => {})
const pages = [
  { to: '/', label: 'Tickets', shortcut: 'Alt+[Digit1]' },
  { to: '/editor', label: 'Editor', shortcut: 'Alt+[Digit2]' },
  { to: '/sequences', label: 'Sequences', shortcut: 'Alt+[Digit3]' },
  { to: '/recording', label: 'Recording', shortcut: 'Alt+[Digit4]' },
  { to: '/formatting', label: 'Formatting', shortcut: 'Alt+[Digit5]' },
] as const
/** A separate component lets each navigation link or button subscribe to its hint. */
function Hint(props: { hotkey: RegisterableHotkey; enabled?: boolean }) {
  const visible = createHotkeyHint(() => props.hotkey)
  return (
    <Show when={visible() && props.enabled !== false}>
      <kbd>{formatForDisplay(props.hotkey)}</kbd>
    </Show>
  )
}
/** Global shortcuts remain registered while route components mount and unmount. */
function Layout() {
  const [path, setPath] = createSignal(location.hash.slice(1) || '/')
  onMount(() => {
    const update = () => setPath(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', update)
    onCleanup(() => window.removeEventListener('hashchange', update))
  })
  const [showShortcuts, setShowShortcuts] = createSignal(false)
  const [activity, setActivity] = createSignal<Array<string>>([])
  const log = (message: string) => {
    setActivity((items) => [message, ...items].slice(0, 6))
  }
  const keys = createHeldKeys()
  const codes = createHeldKeyCodes()
  const shift = createKeyHold('Shift')
  const { hotkeys, sequences } = createHotkeyRegistrations()
  const registrations = () => [...hotkeys(), ...sequences()]
  const groups = () => [
    ...new Set(
      registrations().map((reg) => reg.options.meta?.group ?? 'Other'),
    ),
  ]
  createHotkeys(
    pages.map((page) => ({
      hotkey: page.shortcut,
      callback: () => {
        location.hash = page.to
      },
      options: { meta: { name: `Open ${page.label}`, group: 'Navigation' } },
    })),
    () => ({ ignoreInputs: true }),
  )
  createHotkey(
    'Alt+Shift+[KeyK]',
    () => setShowShortcuts((value) => !value),
    () => ({
      meta: { name: 'Show shortcuts', group: 'Navigation' },
    }),
  )
  return (
    <ActivityContext.Provider value={log}>
      <header>
        <h1>TanStack Hotkeys kitchen sink</h1>
        <p>
          Hold Alt / Option to see shortcut hints. Change routes to see
          registrations mount and unmount.
        </p>
        <nav aria-label="Examples">
          {pages.map((page) => (
            <a href={`#${page.to}`} class={path() === page.to ? 'active' : ''}>
              {page.label} <Hint hotkey={page.shortcut} />
            </a>
          ))}
        </nav>
        <button
          onClick={() => setShowShortcuts((value) => !value)}
          aria-expanded={showShortcuts()}
        >
          {showShortcuts() ? 'Hide' : 'Show'} shortcuts{' '}
          <Hint hotkey="Alt+Shift+[KeyK]" />
        </button>
      </header>
      {showShortcuts() && (
        <section aria-label="Registered shortcuts">
          <h2>Registered shortcuts</h2>
          <p>
            Global and current-route registrations, including disabled handlers.
            Scoped shortcuts run inside their target.
          </p>
          {groups().map((group) => (
            <div>
              <h3>{group}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Binding</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations()
                    .filter(
                      (reg) => (reg.options.meta?.group ?? 'Other') === group,
                    )
                    .map((reg) => (
                      <tr>
                        <td>
                          {reg.options.meta?.name ?? reg.id}
                          <br />
                          <small>{reg.options.meta?.description}</small>
                        </td>
                        <td>
                          {('hotkey' in reg ? [reg.hotkey] : reg.sequence)
                            .map((step) => formatForDisplay(step))
                            .join(' → ')}
                        </td>
                        <td>
                          {reg.options.enabled === false
                            ? 'Disabled'
                            : `${reg.triggerCount} fired`}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      )}
      <main>
        <Dynamic component={routeComponents[path()] ?? Tickets} />
      </main>
      <section>
        <h2>Key state</h2>
        <p>
          Keys: {keys().join(' + ') || 'None'}
          <br />
          Codes: {Object.values(codes()).join(' + ') || 'None'}
          <br />
          Shift: {shift() ? 'held' : 'released'}
        </p>
        <h2>Activity</h2>
        <button onClick={() => setActivity([])}>Clear log</button>
        <ul aria-live="polite">
          {activity().map((message) => (
            <li>{message}</li>
          ))}
        </ul>
      </section>
      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </ActivityContext.Provider>
  )
}
/** Single shortcuts share handlers with buttons and respect enabled/input policies. */
function Tickets() {
  const log = useContext(ActivityContext)
  const [count, setCount] = createSignal(0)
  const [enabled, setEnabled] = createSignal(true)
  const create = () => {
    setCount((n) => n + 1)
    log('Ticket created')
  }
  const save = () => log('Pending ticket saved')
  createHotkey('Alt+[KeyC]', create, () => ({
    enabled: enabled(),
    ignoreInputs: false,
    meta: {
      name: 'Create ticket',
      description: 'Also works while entering a ticket note',
      group: 'Tickets',
    },
  }))
  createHotkey('Alt+[KeyS]', save, () => ({
    enabled: enabled(),
    meta: { name: 'Save pending ticket', group: 'Tickets' },
  }))
  return (
    <section>
      <h2>Tickets</h2>
      <p>
        Created: {count()}. Hold Alt / Option for hints. Release and press again
        to create another ticket.
      </p>
      <label>
        <input
          type="checkbox"
          checked={enabled()}
          onChange={(e) => setEnabled(e.currentTarget.checked)}
        />{' '}
        Enable ticket actions
      </label>
      <p>
        <button disabled={!enabled()} onClick={create}>
          Create ticket <Hint hotkey="Alt+[KeyC]" enabled={enabled()} />
        </button>
        <button disabled={!enabled()} onClick={save}>
          Save pending <Hint hotkey="Alt+[KeyS]" enabled={enabled()} />
        </button>
      </p>
      <label>
        Ticket note{' '}
        <input placeholder="Try Alt + the physical C key while typing" />
      </label>
      <p>
        Create uses <code>ignoreInputs: false</code>; Save uses the default
        input filtering. The provider supplies <code>requireReset: true</code>.
      </p>
    </section>
  )
}
/** Each editor owns a target ref, so the same shortcuts can be reused independently. */
function EditorPane({ name }: { name: string }) {
  const log = useContext(ActivityContext)
  let target: HTMLFieldSetElement | undefined
  const [text, setText] = createSignal('One shortcut, two independent editors.')
  const [saves, setSaves] = createSignal(0)
  createHotkeys(
    [
      {
        hotkey: 'Mod+[KeyS]',
        callback: () => {
          setSaves((n) => n + 1)
          log(`${name} saved`)
        },
        options: {
          meta: {
            name: `Save ${name}`,
            group: 'Editor',
            description: 'Scoped to this editor',
          },
        },
      },
      {
        hotkey: 'Alt+[Backspace]',
        callback: () => {
          setText('')
          log(`${name} cleared`)
        },
        options: { meta: { name: `Clear ${name}`, group: 'Editor' } },
      },
    ],
    () => ({ target, ignoreInputs: false }),
  )
  return (
    <fieldset ref={target}>
      <legend>
        {name} — {saves()} saves
      </legend>
      <label>
        Editor content
        <textarea
          rows={3}
          value={text()}
          onChange={(e) => setText(e.currentTarget.value)}
        />
      </label>
      <p>
        <kbd>{formatForDisplay('Mod+[KeyS]')}</kbd> Save;{' '}
        <kbd>{formatForDisplay('Alt+[Backspace]')}</kbd> Clear
      </p>
    </fieldset>
  )
}
/** Exercises target scope, repeat/reset, propagation, and keyup options. */
function Editor() {
  const log = useContext(ActivityContext)
  const [repeat, setRepeat] = createSignal(false)
  const [count, setCount] = createSignal(0)
  const [bubble, setBubble] = createSignal(false)
  createHotkey(
    'Alt+[ArrowRight]',
    () => setCount((n) => n + 1),
    () => ({
      requireReset: !repeat(),
      meta: { name: 'Advance counter', group: 'Editor' },
    }),
  )
  let scope: HTMLFieldSetElement | undefined
  createHotkey(
    'Alt+[KeyB]',
    () => log('Scoped B handler'),
    () => ({
      target: scope,
      stopPropagation: !bubble(),
      preventDefault: !bubble(),
      meta: { name: 'Scoped propagation demo', group: 'Editor' },
    }),
  )
  createHotkey(
    'Alt+[KeyB]',
    () => log('Document B handler received the bubbled event'),
    () => ({ meta: { name: 'Document propagation demo', group: 'Editor' } }),
  )
  createHotkey(
    'Alt+[KeyU]',
    () => log('Key released: keyup handler'),
    () => ({
      eventType: 'keyup',
      meta: { name: 'Run on release', group: 'Editor' },
    }),
  )
  return (
    <section>
      <h2>Editor scopes</h2>
      <p>
        Save is registered in both editors. Focus a textarea to choose which
        handler receives it.
      </p>
      <EditorPane name="Draft" />
      <EditorPane name="Notes" />
      <h3>Repeat and keyup</h3>
      <label>
        <input
          type="checkbox"
          checked={repeat()}
          onChange={(e) => setRepeat(e.currentTarget.checked)}
        />{' '}
        Allow key repeat
      </label>
      <p>
        Hold <kbd>{formatForDisplay('Alt+[ArrowRight]')}</kbd> to advance:{' '}
        {count()}. Release <kbd>{formatForDisplay('Alt+[KeyU]')}</kbd> to log a
        keyup event.
      </p>
      <fieldset ref={scope} tabIndex={0}>
        <legend>Propagation</legend>
        <label>
          <input
            type="checkbox"
            checked={bubble()}
            onChange={(e) => setBubble(e.currentTarget.checked)}
          />{' '}
          Allow bubbling and browser defaults
        </label>
        <p>
          Focus this area and press <kbd>{formatForDisplay('Alt+[KeyB]')}</kbd>.
          Activity shows whether the document handler also receives the event.
        </p>
        <button onClick={() => scope?.focus()}>Focus this area</button>
      </fieldset>
    </section>
  )
}
/** Single and bulk sequences share a timeout and expose progress through the registry. */
function Sequences() {
  const log = useContext(ActivityContext)
  const [timeout, setTimeoutValue] = createSignal(1000)
  createHotkeySequence(
    ['[KeyG]', '[KeyG]'],
    () => log('Sequence: go to top'),
    () => ({
      timeout: timeout(),
      meta: { name: 'Go to top', group: 'Sequences' },
    }),
  )
  createHotkeySequences(
    [
      {
        sequence: ['[KeyG]', '[KeyI]'],
        callback: () => log('Sequence: inbox'),
        options: { meta: { name: 'Open inbox', group: 'Sequences' } },
      },
      {
        sequence: ['Shift+[KeyR]', 'Shift+[KeyT]'],
        callback: () => log('Sequence: shifted chord chain'),
        options: { meta: { name: 'Shifted chain', group: 'Sequences' } },
      },
    ],
    () => ({ timeout: timeout() }),
  )
  const { sequences } = createHotkeyRegistrations()
  return (
    <section>
      <h2>Sequences</h2>
      <p>
        Try the physical G position twice, G then I, or hold Shift and press R
        then T.
      </p>
      <label>
        Time between steps: {timeout()} ms{' '}
        <input
          type="range"
          min="300"
          max="2500"
          step="100"
          value={timeout()}
          onChange={(e) => setTimeoutValue(Number(e.currentTarget.value))}
        />
      </label>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Sequence</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {sequences().map((reg) => (
            <tr>
              <td>{reg.options.meta?.name}</td>
              <td>
                {reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}
              </td>
              <td>
                {reg.matchedStepCount}/{reg.sequence.length} steps;{' '}
                {reg.triggerCount} fired
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Wrong keys and timeouts reset progress. Modifier-only presses and
        automatic repeats do not advance a sequence.
      </p>
    </section>
  )
}
/** Recorder output feeds local state; reset and validation are application policy. */
function Recording() {
  const log = useContext(ActivityContext)
  const initial: Hotkey = 'Alt+[KeyR]'
  const [hotkey, setHotkey] = createSignal<Hotkey>(initial)
  const [mode, setMode] = createSignal<RecorderKeyMode>('code')
  const [problem, setProblem] = createSignal('')
  const [sequence, setSequence] = createSignal<HotkeySequence>([
    '[KeyX]',
    '[KeyY]',
  ])
  const [sequenceProblem, setSequenceProblem] = createSignal('')
  const [idle, setIdle] = createSignal(false)
  const [commitOnEnter, setCommitOnEnter] = createSignal(true)
  createHotkey(
    hotkey,
    () => log('Your recorded shortcut fired'),
    () => ({
      meta: { name: 'Recorded action', group: 'Recording' },
    }),
  )
  createHotkeySequence(
    sequence,
    () => log('Your recorded sequence fired'),
    () => ({
      meta: { name: 'Recorded sequence', group: 'Recording' },
    }),
  )
  const recorder = createHotkeyRecorder(() => ({
    recordBy: mode(),
    ignoreInputs: false,
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded action',
    },
    validate: (_, { parsedHotkey }) =>
      parsedHotkey.modifiers.length > 0 ||
      'Include a modifier for this action.',
    onReject: ({ message }) => setProblem(message),
    onRecord: (value) => {
      setHotkey(value)
      setProblem('')
      log(`Recorded ${value}`)
    },
    onClear: () => {
      setHotkey(initial)
      setProblem('')
      log('Restored default shortcut')
    },
    onCancel: () => setProblem('Recording cancelled. Binding unchanged.'),
  }))
  const sequenceRecorder = createHotkeySequenceRecorder(() => ({
    recordBy: mode(),
    ignoreInputs: false,
    idleTimeoutMs: idle() ? 1500 : undefined,
    commitKeys: commitOnEnter() ? 'enter' : 'none',
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded sequence',
    },
    validate: (steps) => steps.length >= 2 || 'Record at least two chords.',
    onRecord: (value) => {
      setSequence(value)
      setSequenceProblem('')
      log(`Recorded sequence ${value.join(' → ')}`)
    },
    onReject: (reason) => setSequenceProblem(reason.message),
    onClear: () => {
      setSequence(['[KeyX]', '[KeyY]'])
      setSequenceProblem('Restored default sequence.')
    },
    onCancel: () => setSequenceProblem('Recording cancelled.'),
  }))
  return (
    <section>
      <h2>Recording</h2>
      <p>
        Recorded bindings go directly into registrations. Changes live in this
        route's local state.
      </p>
      <label>
        Record by{' '}
        <select
          value={mode()}
          disabled={recorder.isRecording() || sequenceRecorder.isRecording()}
          onChange={(e) => setMode(e.currentTarget.value as RecorderKeyMode)}
        >
          <option value="code">Physical code (default)</option>
          <option value="key">Logical character</option>
        </select>
      </label>
      <h3>Single shortcut</h3>
      <p>
        <kbd>{formatForDisplay(hotkey())}</kbd> — stored as{' '}
        <code>{hotkey()}</code>
      </p>
      <button
        disabled={recorder.isRecording() || sequenceRecorder.isRecording()}
        onClick={() => {
          setProblem('')
          recorder.startRecording()
        }}
      >
        {recorder.isRecording() ? 'Listening…' : 'Record shortcut'}
      </button>
      <button
        onClick={() => {
          recorder.stopRecording()
          setHotkey(initial)
          setProblem('')
        }}
      >
        Reset
      </button>
      {recorder.isRecording() && (
        <button onClick={recorder.cancelRecording}>Cancel</button>
      )}
      <p>
        Include a modifier. Try Alt + 1 for a navigation conflict. Escape
        cancels; Backspace restores the initial shortcut.
      </p>
      <p role="status">{problem()}</p>
      <h3>Sequence</h3>
      <p>
        {(sequenceRecorder.isRecording()
          ? sequenceRecorder.steps()
          : sequence()
        )
          .map((step) => formatForDisplay(step))
          .join(' → ') || 'Waiting for the first chord…'}
      </p>
      <label>
        <input
          type="checkbox"
          checked={idle()}
          onChange={(e) => setIdle(e.currentTarget.checked)}
        />{' '}
        Commit after 1.5 seconds idle
      </label>
      <label>
        <input
          type="checkbox"
          checked={commitOnEnter()}
          onChange={(e) => setCommitOnEnter(e.currentTarget.checked)}
        />{' '}
        Enter commits the sequence
      </label>
      <p>
        <button
          disabled={recorder.isRecording() || sequenceRecorder.isRecording()}
          onClick={() => {
            setSequenceProblem('')
            sequenceRecorder.startRecording()
          }}
        >
          Record sequence
        </button>
        <button
          disabled={
            !sequenceRecorder.isRecording() || !sequenceRecorder.steps().length
          }
          onClick={sequenceRecorder.commitRecording}
        >
          Commit
        </button>
        {sequenceRecorder.isRecording() && (
          <button onClick={sequenceRecorder.cancelRecording}>Cancel</button>
        )}
      </p>
      <p>
        Record at least two chords. Backspace removes a step; when empty it
        restores the initial sequence. Rejected steps remain editable.
      </p>
      <p role="status">{sequenceProblem()}</p>
    </section>
  )
}
/** Formatting changes labels, not the binding being registered. */
function Formatting() {
  const [platform, setPlatform] = createSignal<'mac' | 'windows' | 'linux'>(
    'mac',
  )
  const [modifierSymbols, setModifierSymbols] = createSignal(false)
  const [keySymbols, setKeySymbols] = createSignal(true)
  const options = () => ({
    platform: platform(),
    useSymbols: { modifiers: modifierSymbols(), keys: keySymbols() },
  })
  return (
    <section>
      <h2>Formatting</h2>
      <label>
        Platform{' '}
        <select
          value={platform()}
          onChange={(e) =>
            setPlatform(e.currentTarget.value as 'mac' | 'windows' | 'linux')
          }
        >
          <option value="mac">macOS</option>
          <option value="windows">Windows</option>
          <option value="linux">Linux</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={modifierSymbols()}
          onChange={(e) => setModifierSymbols(e.currentTarget.checked)}
        />{' '}
        Modifier symbols
      </label>
      <label>
        <input
          type="checkbox"
          checked={keySymbols()}
          onChange={(e) => setKeySymbols(e.currentTarget.checked)}
        />{' '}
        Key symbols
      </label>
      <table>
        <thead>
          <tr>
            <th>Stored binding</th>
            <th>String</th>
            <th>Parts</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              'Mod+Shift+ArrowUp',
              'Control++',
              'Alt+[KeyS]',
              'Mod+[NumpadAdd]',
            ] as const
          ).map((hotkey) => (
            <tr>
              <td>
                <code>{hotkey}</code>
              </td>
              <td>{formatForDisplay(hotkey, options())}</td>
              <td>
                {formatForDisplay(hotkey, { ...options(), parts: true }).map(
                  (part) => (
                    <kbd>{part}</kbd>
                  ),
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Physical codes use readable fallback labels. Supply a resolved{' '}
        <code>layoutMap</code> or explicit <code>keyLabels</code> for
        layout-specific labels.
      </p>
    </section>
  )
}
// A changed route mounts a new component, so its registrations clean up naturally.
const routeComponents: Record<string, () => JSX.Element> = {
  '/': Tickets,
  '/editor': Editor,
  '/sequences': Sequences,
  '/recording': Recording,
  '/formatting': Formatting,
}
const dispose = render(
  () => (
    <HotkeysProvider defaultOptions={{ hotkey: { requireReset: true } }}>
      <Layout />
    </HotkeysProvider>
  ),
  document.getElementById('root')!,
)
import.meta.hot?.dispose(dispose)
