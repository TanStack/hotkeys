import { createRoot, createContext, useCallback, useContext, useEffect, useState } from 'octane'

import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeyCodes,
  useHeldKeys,
  useHotkey,
  useHotkeyHint,
  useHotkeyRecorder,
  useHotkeyRegistrations,
  useHotkeySequence,
  useHotkeySequenceRecorder,
  useHotkeySequences,
  useHotkeys,
  useKeyHold,
} from '@tanstack/octane-hotkeys'

import type {
  Hotkey,
  HotkeySequence,
  RecorderKeyMode,
  RegisterableHotkey,
} from '@tanstack/octane-hotkeys'

import './index.css'

const ActivityContext = createContext<(message: string) => void>(() => {})

const pages = [
  { to: '/', label: 'Tickets', shortcut: 'Alt+[Digit1]' },
  { to: '/editor', label: 'Editor', shortcut: 'Alt+[Digit2]' },
  { to: '/sequences', label: 'Sequences', shortcut: 'Alt+[Digit3]' },
  { to: '/recording', label: 'Recording', shortcut: 'Alt+[Digit4]' },
  { to: '/formatting', label: 'Formatting', shortcut: 'Alt+[Digit5]' },
] as const

function Hint({
  hotkey,
  enabled = true,
}: {
  hotkey: RegisterableHotkey
  enabled?: boolean
}) @{
  const visible = useHotkeyHint(hotkey)
  @if (visible && enabled) { <kbd>{formatForDisplay(hotkey)}</kbd> } @else {  }
}

function Layout() @{
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const navigate = ({ to }: { to: string }) => {
    window.history.pushState({}, '', to)
    setCurrentPath(to)
  }
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [activity, setActivity] = useState<Array<string>>([])
  const log = useCallback((message: string) => {
    setActivity((items) => [message, ...items].slice(0, 6))
  }, [])
  const keys = useHeldKeys()
  const codes = useHeldKeyCodes()
  const shift = useKeyHold('Shift')
  const { hotkeys, sequences } = useHotkeyRegistrations()
  const registrations = [...hotkeys, ...sequences]
  const groups = [
    ...new Set(registrations.map((reg) => reg.options.meta?.group ?? 'Other')),
  ]
  useHotkeys(
    pages.map((page) => ({
      hotkey: page.shortcut,
      callback: () => {
        void navigate({ to: page.to })
      },
      options: { meta: { name: `Open ${page.label}`, group: 'Navigation' } },
    })),
    { ignoreInputs: true },
  )
  useHotkey('Alt+Shift+[KeyK]', () => setShowShortcuts((value) => !value), {
    meta: { name: 'Show shortcuts', group: 'Navigation' },
  })
  <ActivityContext.Provider value={log}>
        <header>
          <h1>TanStack Hotkeys kitchen sink</h1>
          <p>
            Hold Alt / Option to see shortcut hints. Change routes to see
            registrations mount and unmount.
          </p>
          <nav aria-label="Examples">
            @for (const page of pages; key page.to) {
  <a href={page.to} className={currentPath === page.to ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate({ to: page.to }) }}>{page.label} <Hint hotkey={page.shortcut} /></a> }
          </nav>
          <button onClick={() => setShowShortcuts((value) => !value)} aria-expanded={showShortcuts}>
            {showShortcuts ? 'Hide' : 'Show'} shortcuts{' '}
            <Hint hotkey="Alt+Shift+[KeyK]" />
          </button>
        </header>
        @if (showShortcuts) { <section aria-label="Registered shortcuts">
            <h2>Registered shortcuts</h2>
            <p>
              Global and current-route registrations, including disabled handlers.
              Scoped shortcuts run inside their target.
            </p>
            @for (const group of groups; key group) {
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
                    @for (const reg of registrations
                      .filter(
                        (reg) => (reg.options.meta?.group ?? 'Other') === group,
                      ); key reg.id) {
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
                        </tr> }
                  </tbody>
                </table>
              </div> }
          </section> }
        <main>
          @if (currentPath === '/editor') { <Editor /> } @else { @if (currentPath === '/sequences') { <Sequences /> } @else { @if (currentPath === '/recording') { <Recording /> } @else { @if (currentPath === '/formatting') { <Formatting /> } @else { <Tickets /> } } } }
        </main>
        <section>
          <h2>Key state</h2>
          <p>
            Keys: {keys.join(' + ') || 'None'}
            <br />
            Codes: {Object.values(codes).join(' + ') || 'None'}
            <br />
            Shift: {shift ? 'held' : 'released'}
          </p>
          <h2>Activity</h2>
          <button onClick={() => setActivity([])}>Clear log</button>
          <ul aria-live="polite">
            @for (const [i, message] of Array.from(activity.entries()); key i) {
  <li>{message}</li> }
          </ul>
        </section>

      </ActivityContext.Provider>
}

function Tickets() @{
  const log = useContext(ActivityContext)
  const [count, setCount] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const create = () => {
    setCount((n) => n + 1)
    log('Ticket created')
  }
  const save = () => log('Pending ticket saved')
  useHotkey('Alt+[KeyC]', create, {
    enabled,
    ignoreInputs: false,
    meta: {
      name: 'Create ticket',
      description: 'Also works while entering a ticket note',
      group: 'Tickets',
    },
  })
  useHotkey('Alt+[KeyS]', save, {
    enabled,
    meta: { name: 'Save pending ticket', group: 'Tickets' },
  })
  <section>
        <h2>Tickets</h2>
        <p>
          Created: {count}. Hold Alt / Option for hints. Release and press again
          to create another ticket.
        </p>
        <label>
          <input type="checkbox" checked={enabled} onInput={(e) => setEnabled(e.currentTarget.checked)} />{' '}
          Enable ticket actions
        </label>
        <p>
          <button disabled={!enabled} onClick={create}>
            Create ticket <Hint hotkey="Alt+[KeyC]" enabled={enabled} />
          </button>
          <button disabled={!enabled} onClick={save}>
            Save pending <Hint hotkey="Alt+[KeyS]" enabled={enabled} />
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
}

function EditorPane({ name }: { name: string }) @{
  const log = useContext(ActivityContext)
  const [target, setTarget] = useState<HTMLFieldSetElement | null>(null)
  const [text, setText] = useState('One shortcut, two independent editors.')
  const [saves, setSaves] = useState(0)
  useHotkeys(
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
    { target, ignoreInputs: false },
  )
  <fieldset ref={setTarget}>
        <legend>
          {name} — {saves} saves
        </legend>
        <label>
          Editor content
          <textarea rows={3} value={text} onInput={(e) => setText(e.currentTarget.value)} />
        </label>
        <p>
          <kbd>{formatForDisplay('Mod+[KeyS]')}</kbd> Save;{' '}
          <kbd>{formatForDisplay('Alt+[Backspace]')}</kbd> Clear
        </p>
      </fieldset>
}

function Editor() @{
  const log = useContext(ActivityContext)
  const [repeat, setRepeat] = useState(false)
  const [count, setCount] = useState(0)
  const [bubble, setBubble] = useState(false)
  useHotkey('Alt+[ArrowRight]', () => setCount((n) => n + 1), {
    requireReset: !repeat,
    meta: { name: 'Advance counter', group: 'Editor' },
  })
  const [scope, setScope] = useState<HTMLFieldSetElement | null>(null)
  useHotkey('Alt+[KeyB]', () => log('Scoped B handler'), {
    target: scope,
    stopPropagation: !bubble,
    preventDefault: !bubble,
    meta: { name: 'Scoped propagation demo', group: 'Editor' },
  })
  useHotkey(
    'Alt+[KeyB]',
    () => log('Document B handler received the bubbled event'),
    { meta: { name: 'Document propagation demo', group: 'Editor' } },
  )
  useHotkey('Alt+[KeyU]', () => log('Key released: keyup handler'), {
    eventType: 'keyup',
    meta: { name: 'Run on release', group: 'Editor' },
  })
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
          <input type="checkbox" checked={repeat} onInput={(e) => setRepeat(e.currentTarget.checked)} />{' '}
          Allow key repeat
        </label>
        <p>
          Hold <kbd>{formatForDisplay('Alt+[ArrowRight]')}</kbd> to advance:{' '}
          {count}. Release <kbd>{formatForDisplay('Alt+[KeyU]')}</kbd> to log a
          keyup event.
        </p>
        <fieldset ref={setScope} tabIndex={0}>
          <legend>Propagation</legend>
          <label>
            <input type="checkbox" checked={bubble} onInput={(e) => setBubble(e.currentTarget.checked)} />{' '}
            Allow bubbling and browser defaults
          </label>
          <p>
            Focus this area and press <kbd>{formatForDisplay('Alt+[KeyB]')}</kbd>.
            Activity shows whether the document handler also receives the event.
          </p>
          <button onClick={() => scope?.focus()}>Focus this area</button>
        </fieldset>
      </section>
}

function Sequences() @{
  const log = useContext(ActivityContext)
  const [timeout, setTimeoutValue] = useState(1000)
  useHotkeySequence(['[KeyG]', '[KeyG]'], () => log('Sequence: go to top'), {
    timeout,
    meta: { name: 'Go to top', group: 'Sequences' },
  })
  useHotkeySequences(
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
    { timeout },
  )
  const { sequences } = useHotkeyRegistrations()
  <section>
        <h2>Sequences</h2>
        <p>
          Try the physical G position twice, G then I, or hold Shift and press R
          then T.
        </p>
        <label>
          Time between steps: {timeout} ms{' '}
          <input type="range" min="300" max="2500" step="100" value={timeout} onInput={(e) => setTimeoutValue(Number(e.currentTarget.value))} />
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
            @for (const reg of sequences; key reg.id) {
  <tr>
                <td>{reg.options.meta?.name}</td>
                <td>
                  {reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}
                </td>
                <td>
                  {reg.matchedStepCount}/{reg.sequence.length} steps;{' '}
                  {reg.triggerCount} fired
                </td>
              </tr> }
          </tbody>
        </table>
        <p>
          Wrong keys and timeouts reset progress. Modifier-only presses and
          automatic repeats do not advance a sequence.
        </p>
      </section>
}

function Recording() @{
  const log = useContext(ActivityContext)
  const initial: Hotkey = 'Alt+[KeyR]'
  const [hotkey, setHotkey] = useState<Hotkey>(initial)
  const [mode, setMode] = useState<RecorderKeyMode>('code')
  const [problem, setProblem] = useState('')
  const [sequence, setSequence] = useState<HotkeySequence>(['[KeyX]', '[KeyY]'])
  const [sequenceProblem, setSequenceProblem] = useState('')
  const [idle, setIdle] = useState(false)
  const [commitOnEnter, setCommitOnEnter] = useState(true)
  useHotkey(hotkey, () => log('Your recorded shortcut fired'), {
    meta: { name: 'Recorded action', group: 'Recording' },
  })
  useHotkeySequence(sequence, () => log('Your recorded sequence fired'), {
    meta: { name: 'Recorded sequence', group: 'Recording' },
  })
  const recorder = useHotkeyRecorder({
    recordBy: mode,
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
  })
  const sequenceRecorder = useHotkeySequenceRecorder({
    recordBy: mode,
    ignoreInputs: false,
    idleTimeoutMs: idle ? 1500 : undefined,
    commitKeys: commitOnEnter ? 'enter' : 'none',
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
  })
  <section>
        <h2>Recording</h2>
        <p>
          Recorded bindings go directly into registrations. Changes live in this
          page's Octane state.
        </p>
        <label>
          Record by{' '}
          <select value={mode} disabled={recorder.isRecording || sequenceRecorder.isRecording} onInput={(e) => setMode(e.currentTarget.value as RecorderKeyMode)}>
            <option value="code">Physical code (default)</option>
            <option value="key">Logical character</option>
          </select>
        </label>
        <h3>Single shortcut</h3>
        <p>
          <kbd>{formatForDisplay(hotkey)}</kbd> — stored as <code>{hotkey}</code>
        </p>
        <button disabled={recorder.isRecording || sequenceRecorder.isRecording} onClick={() => {
            setProblem('')
            recorder.startRecording()
          }}>
          {recorder.isRecording ? 'Listening…' : 'Record shortcut'}
        </button>
        <button onClick={() => {
            recorder.stopRecording()
            setHotkey(initial)
            setProblem('')
          }}>
          Reset
        </button>
        @if (recorder.isRecording) { <button onClick={recorder.cancelRecording}>Cancel</button> }
        <p>
          Include a modifier. Try Alt + 1 for a navigation conflict. Escape
          cancels; Backspace restores the initial shortcut.
        </p>
        <p role="status">{problem}</p>
        <h3>Sequence</h3>
        <p>
          {(sequenceRecorder.isRecording ? sequenceRecorder.steps : sequence)
            .map((step) => formatForDisplay(step))
            .join(' → ') || 'Waiting for the first chord…'}
        </p>
        <label>
          <input type="checkbox" checked={idle} onInput={(e) => setIdle(e.currentTarget.checked)} />{' '}
          Commit after 1.5 seconds idle
        </label>
        <label>
          <input type="checkbox" checked={commitOnEnter} onInput={(e) => setCommitOnEnter(e.currentTarget.checked)} />{' '}
          Enter commits the sequence
        </label>
        <p>
          <button disabled={recorder.isRecording || sequenceRecorder.isRecording} onClick={() => {
              setSequenceProblem('')
              sequenceRecorder.startRecording()
            }}>
            Record sequence
          </button>
          <button disabled={
              !sequenceRecorder.isRecording || !sequenceRecorder.steps.length
            } onClick={sequenceRecorder.commitRecording}>
            Commit
          </button>
          @if (sequenceRecorder.isRecording) { <button onClick={sequenceRecorder.cancelRecording}>Cancel</button> }
        </p>
        <p>
          Record at least two chords. Backspace removes a step; when empty it
          restores the initial sequence. Rejected steps remain editable.
        </p>
        <p role="status">{sequenceProblem}</p>
      </section>
}

function Formatting() @{
  const [platform, setPlatform] = useState<'mac' | 'windows' | 'linux'>('mac')
  const [modifierSymbols, setModifierSymbols] = useState(false)
  const [keySymbols, setKeySymbols] = useState(true)
  const options = {
    platform,
    useSymbols: { modifiers: modifierSymbols, keys: keySymbols },
  }
  <section>
        <h2>Formatting</h2>
        <label>
          Platform{' '}
          <select value={platform} onInput={(e) => setPlatform(e.currentTarget.value as typeof platform)}>
            <option value="mac">macOS</option>
            <option value="windows">Windows</option>
            <option value="linux">Linux</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={modifierSymbols} onInput={(e) => setModifierSymbols(e.currentTarget.checked)} />{' '}
          Modifier symbols
        </label>
        <label>
          <input type="checkbox" checked={keySymbols} onInput={(e) => setKeySymbols(e.currentTarget.checked)} />{' '}
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
            @for (const hotkey of (
              [
                'Mod+Shift+ArrowUp',
                'Control++',
                'Alt+[KeyS]',
                'Mod+[NumpadAdd]',
              ] as const
            ); key hotkey) {
  <tr>
                <td>
                  <code>{hotkey}</code>
                </td>
                <td>{formatForDisplay(hotkey, options)}</td>
                <td>
                  @for (const [i, part] of Array.from((formatForDisplay(hotkey, { ...options, parts: true })).entries()); key i) {
  <kbd>{part}</kbd> }
                </td>
              </tr> }
          </tbody>
        </table>
        <p>
          Physical codes use readable fallback labels. Supply a resolved{' '}
          <code>layoutMap</code> or explicit <code>keyLabels</code> for
          layout-specific labels.
        </p>
      </section>
}

function Root() @{
<HotkeysProvider defaultOptions={{ hotkey: { requireReset: true } }}><Layout /></HotkeysProvider>
}

const root = createRoot(document.getElementById('root')!)
root.render(Root)
import.meta.hot?.dispose(() => root.unmount())
