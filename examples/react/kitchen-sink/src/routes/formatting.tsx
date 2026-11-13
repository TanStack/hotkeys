import { useFormatForDisplay } from '@tanstack/react-hotkeys'
import { createLazyRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { HotkeyPlatform } from '@tanstack/react-hotkeys'

export const Route = createLazyRoute('/formatting')({ component: Formatting })

/** Formatting changes labels, not the binding being registered. */
function Formatting() {
  const formatForDisplay = useFormatForDisplay()
  const [platform, setPlatform] = useState<HotkeyPlatform>('mac')
  const [modifierSymbols, setModifierSymbols] = useState(false)
  const [keySymbols, setKeySymbols] = useState(true)
  const options = {
    platform,
    useSymbols: { modifiers: modifierSymbols, keys: keySymbols },
  }
  return (
    <section>
      <h2>Formatting</h2>
      <label>
        Platform{' '}
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as typeof platform)}
        >
          <option value="mac">macOS</option>
          <option value="windows">Windows</option>
          <option value="linux">Linux</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={modifierSymbols}
          onChange={(e) => setModifierSymbols(e.target.checked)}
        />{' '}
        Modifier symbols
      </label>
      <label>
        <input
          type="checkbox"
          checked={keySymbols}
          onChange={(e) => setKeySymbols(e.target.checked)}
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
            <tr key={hotkey}>
              <td>
                <code>{hotkey}</code>
              </td>
              <td>{formatForDisplay(hotkey, options)}</td>
              <td>
                {formatForDisplay(hotkey, { ...options, parts: true }).map(
                  (part, i) => (
                    <kbd key={i}>{part}</kbd>
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
