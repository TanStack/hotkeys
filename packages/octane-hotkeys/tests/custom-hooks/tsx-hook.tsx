import { useHotkey } from '@tanstack/octane-hotkeys'

export function useTsxShortcuts(log: Array<string>) {
  useHotkey('K', () => log.push('K'))
  useHotkey('L', () => log.push('L'))
}
