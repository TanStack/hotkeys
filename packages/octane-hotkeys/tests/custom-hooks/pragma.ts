/** @jsxImportSource octane */
import { useHotkey } from '@tanstack/octane-hotkeys'

export function usePragmaShortcuts(log: Array<string>) {
  useHotkey('I', () => log.push('I'))
  useHotkey('J', () => log.push('J'))
}
