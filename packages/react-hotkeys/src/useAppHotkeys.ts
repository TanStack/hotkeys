'use client'

import {
  bindCustomHotkeyActions,
  requireAppHotkeysStore,
} from '@tanstack/hotkeys/adapter'
import { useAppHotkeysStoreState } from './_appHotkeysStore'
import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import type {
  AppHotkeysStore,
  CustomHotkeyActions,
  CustomHotkeys,
  RegisteredAppHotkeyListItem,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function useRequiredStore(hook: string): AppHotkeysStore<RegisteredAppHotkeys> {
  return requireAppHotkeysStore(
    useAppHotkeysStoreState(),
    `${hook} requires a HotkeysProvider with an appHotkeys prop`,
  )
}

/**
 * Returns the effective app hotkeys from `HotkeysProvider`, typed by
 * `Register`: each declaration with the user's custom hotkey applied.
 * Pass an entry to `useHotkey` or `useHotkeys` to register it.
 *
 * @example
 * ```tsx
 * const appHotkeys = useAppHotkeys()
 * useHotkey(appHotkeys['doc.save'], () => save())
 * ```
 */
export function useAppHotkeys(): RegisteredAppHotkeys {
  return useRequiredStore('useAppHotkeys').appHotkeys
}

/**
 * Lists every app hotkey with its live status, in declaration order, for
 * cheat sheets and settings screens. App hotkeys whose components have not
 * mounted are `'inactive'`; those without a hotkey are `'unbound'`.
 *
 * @example
 * ```tsx
 * function CheatSheet() {
 *   const items = useAppHotkeyList()
 *   const formatForDisplay = useFormatForDisplay()
 *
 *   return (
 *     <ul>
 *       {items.map(({ appHotkey, status }) => (
 *         <li key={appHotkey.id} data-status={status}>
 *           {appHotkey.meta?.name}:{' '}
 *           {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useAppHotkeyList(): Array<RegisteredAppHotkeyListItem> {
  const store = useRequiredStore('useAppHotkeyList')
  const registrations = useHotkeyRegistrations()
  return store.getList(registrations)
}

/** Custom hotkey state and actions returned by `useCustomHotkeys`. */
export interface UseCustomHotkeysResult extends CustomHotkeyActions {
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: CustomHotkeys
}

/**
 * Reads and changes the user's custom hotkeys. Changes apply to every
 * registered app hotkey immediately and are passed to the provider's
 * `onCustomHotkeysChange`, ready to save.
 *
 * @example
 * ```tsx
 * const { setCustomHotkey, findConflicts } = useCustomHotkeys()
 * const recorder = useHotkeyRecorder({
 *   maxSteps: Infinity,
 *   validate: (hotkey, context) =>
 *     findConflicts('doc.save', hotkey, context).length === 0 ||
 *     'Already in use',
 *   onRecord: (hotkey, context) => setCustomHotkey('doc.save', hotkey, context),
 * })
 * ```
 */
export function useCustomHotkeys(): UseCustomHotkeysResult {
  const store = useRequiredStore('useCustomHotkeys')
  return {
    customHotkeys: store.customHotkeys,
    ...bindCustomHotkeyActions(() => store),
  }
}
