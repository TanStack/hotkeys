import { useRef, useState } from 'react'
import { createLazyRoute } from '@tanstack/react-router'
import {
  formatForDisplay,
  useAppHotkeys,
  useHotkey,
  useHotkeys,
} from '@tanstack/react-hotkeys'
import { formatHotkey, useActivity } from '../shared'

export const Route = createLazyRoute('/editor')({ component: Editor })

/**
 * Each editor registers the same app hotkeys against its own target ref.
 * The shortcut panel shows one row per declaration with two registrations.
 */
function EditorPane({ name }: { name: string }) {
  const log = useActivity()
  const hotkeys = useAppHotkeys()
  const target = useRef<HTMLFieldSetElement>(null)
  const [text, setText] = useState('One shortcut, two independent editors.')
  const [saves, setSaves] = useState(0)
  useHotkeys(
    [
      {
        hotkey: hotkeys['editor.save'],
        callback: () => {
          setSaves((n) => n + 1)
          log(`${name} saved`)
        },
      },
      {
        hotkey: hotkeys['editor.clear'],
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
        <kbd>{formatHotkey(hotkeys['editor.save'].hotkey)}</kbd> Save;{' '}
        <kbd>{formatHotkey(hotkeys['editor.clear'].hotkey)}</kbd> Clear
      </p>
    </fieldset>
  )
}

/** Exercises target scope, repeat/reset, propagation, and keyup options. */
function Editor() {
  const log = useActivity()
  const hotkeys = useAppHotkeys()
  const [repeat, setRepeat] = useState(false)
  const [count, setCount] = useState(0)
  const [bubble, setBubble] = useState(false)
  // Call-site options override the declaration and the provider default.
  useHotkey(hotkeys['editor.advance'], () => setCount((n) => n + 1), {
    requireReset: !repeat,
  })
  useHotkey(hotkeys['editor.release'], () => log('Key released: keyup handler'))

  // Undeclared hotkeys still work. These two intentionally share a binding to
  // demonstrate propagation, so they stay out of the app hotkey declarations
  // and appear in the panel only while this route is mounted.
  const scope = useRef<HTMLFieldSetElement>(null)
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
          checked={repeat}
          onChange={(e) => setRepeat(e.target.checked)}
        />{' '}
        Allow key repeat
      </label>
      <p>
        Hold <kbd>{formatHotkey(hotkeys['editor.advance'].hotkey)}</kbd> to
        advance: {count}. Release{' '}
        <kbd>{formatHotkey(hotkeys['editor.release'].hotkey)}</kbd> to log a
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
