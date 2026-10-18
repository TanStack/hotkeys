import { useRef, useState } from 'react'
import { createLazyRoute } from '@tanstack/react-router'
import {
  HotkeysProvider,
  formatForDisplay,
  useAppHotkeys,
  useHotkey,
  useHotkeys,
} from '@tanstack/react-hotkeys'
import { formatHotkey, useActivity } from '../shared'

export const Route = createLazyRoute('/editor')({ component: EditorRoute })

/** The route's hotkeys fire only while this provider's scope is mounted. */
function EditorRoute() {
  return (
    <HotkeysProvider scope="editor">
      <Editor />
    </HotkeysProvider>
  )
}

/**
 * Each editor registers the same app hotkeys against its own target ref.
 * The shortcut panel shows one row per declaration with two registrations.
 */
function EditorPane({ name }: { name: string }) {
  const log = useActivity()
  const appHotkeys = useAppHotkeys()
  const target = useRef<HTMLFieldSetElement>(null)
  const [text, setText] = useState('One shortcut, two independent editors.')
  const [saves, setSaves] = useState(0)
  useHotkeys(
    [
      {
        hotkey: appHotkeys['editor.save'],
        callback: () => {
          setSaves((n) => n + 1)
          log(`${name} saved`)
        },
      },
      {
        hotkey: appHotkeys['editor.clear'],
        callback: () => {
          setText('')
          log(`${name} cleared`)
        },
      },
    ],
    { target },
  )
  return (
    <fieldset ref={target}>
      <legend>
        {name} — {saves} saves
      </legend>
      <label>
        Editor content
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <p>
        <kbd>{formatHotkey(appHotkeys['editor.save'].hotkey)}</kbd> Save;{' '}
        <kbd>{formatHotkey(appHotkeys['editor.clear'].hotkey)}</kbd> Clear
      </p>
    </fieldset>
  )
}

/** Exercises targets, repeat/reset, propagation, and keyup options. */
function Editor() {
  const log = useActivity()
  const appHotkeys = useAppHotkeys()
  const [repeat, setRepeat] = useState(false)
  const [count, setCount] = useState(0)
  const [bubble, setBubble] = useState(false)
  // Call-site options override the declaration and the provider default.
  useHotkey(appHotkeys['editor.advance'], () => setCount((n) => n + 1), {
    requireReset: !repeat,
  })
  useHotkey(appHotkeys['editor.release'], () =>
    log('Key released: keyup handler'),
  )

  // Undeclared hotkeys still work. These two intentionally share a binding to
  // demonstrate propagation, so they stay out of the app hotkey declarations
  // and appear in the panel only while this route is mounted.
  const scope = useRef<HTMLFieldSetElement>(null)
  useHotkey('Alt+[KeyB]', () => log('Target B handler'), {
    target: scope,
    stopPropagation: !bubble,
    preventDefault: !bubble,
    meta: { name: 'Target propagation demo', group: 'Editor' },
  })
  useHotkey(
    'Alt+[KeyB]',
    () => log('Document B handler received the bubbled event'),
    { meta: { name: 'Document propagation demo', group: 'Editor' } },
  )

  return (
    <section>
      <h2>Editor targets</h2>
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
          checked={repeat}
          onChange={(e) => setRepeat(e.target.checked)}
        />{' '}
        Allow key repeat
      </label>
      <p>
        Hold <kbd>{formatHotkey(appHotkeys['editor.advance'].hotkey)}</kbd> to
        advance: {count}. Release{' '}
        <kbd>{formatHotkey(appHotkeys['editor.release'].hotkey)}</kbd> to log a
        keyup event.
      </p>
      <fieldset ref={scope} tabIndex={0}>
        <legend>Propagation</legend>
        <label>
          <input
            type="checkbox"
            checked={bubble}
            onChange={(e) => setBubble(e.target.checked)}
          />{' '}
          Allow bubbling and browser defaults
        </label>
        <p>
          Focus this area and press <kbd>{formatForDisplay('Alt+[KeyB]')}</kbd>.
          Activity shows whether the document handler also receives the event.
        </p>
        <button onClick={() => scope.current?.focus()}>Focus this area</button>
      </fieldset>
    </section>
  )
}
