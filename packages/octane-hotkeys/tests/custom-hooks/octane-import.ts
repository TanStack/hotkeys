import { useState } from 'octane'
import { useHotkey } from '@tanstack/octane-hotkeys'

export function useImportShortcuts(log: Array<string>) {
  const [count, setCount] = useState(0)
  useHotkey('G', () => {
    log.push('G')
    setCount(count + 1)
  })
  useHotkey('H', () => log.push('H'))
}
