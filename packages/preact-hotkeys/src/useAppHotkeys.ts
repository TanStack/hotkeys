import { useAppHotkeysStoreState } from './_appHotkeysStore'
import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import type {
  AppHotkey,
  AppHotkeyListItem,
  AppHotkeysStore,
  CustomHotkeys,
  Hotkey,
  RecordedKeyPresses,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function useRequiredStore(hook: string): AppHotkeysStore<RegisteredAppHotkeys> {
  const store = useAppHotkeysStoreState()
  if (!store) {
    throw new Error(
      `[hotkeys] ${hook} requires a HotkeysProvider with an appHotkeys prop`,
    )
  }
  // Not a no-op once apps augment `Register`.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return store as unknown as AppHotkeysStore<RegisteredAppHotkeys>
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
 *   const formatForDisplay = useFormatForDisplay()
 *   const items = useAppHotkeyList()
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
export function useAppHotkeyList(): Array<
  AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>
> {
  const store = useRequiredStore('useAppHotkeyList')
  const registrations = useHotkeyRegistrations()
  return store.getList(registrations)
}

/** Custom hotkey state and actions returned by `useCustomHotkeys`. */
export interface UseCustomHotkeysResult {
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: CustomHotkeys
  /**
   * Sets the user's hotkey for an app hotkey. `null` unbinds it.
   * Returns conflicting app hotkeys; when any exist, nothing changes. Pass
   * the recorder's `context` for a recorded hotkey, as for `findConflicts`.
   */
  setCustomHotkey: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey | null,
    recordedWith?: RecordedKeyPresses,
  ) => Array<AppHotkey>
  /** Restores the default hotkey for an app hotkey. */
  resetCustomHotkey: (id: keyof RegisteredAppHotkeys & string) => void
  /** Restores every default hotkey. */
  resetCustomHotkeys: () => void
  /**
   * Other app hotkeys that would collide if `id` used `hotkey`. Pass the
   * recorder's `context` for a recorded hotkey: it has the key press, which
   * also finds a hotkey written differently that the same press fires.
   */
  findConflicts: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey,
    recordedWith?: RecordedKeyPresses,
  ) => Array<AppHotkey>
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
    setCustomHotkey: (id, hotkey, recordedWith) =>
      store.setCustomHotkey(id, hotkey, recordedWith),
    resetCustomHotkey: (id) => store.resetCustomHotkey(id),
    resetCustomHotkeys: () => store.resetCustomHotkeys(),
    findConflicts: (id, hotkey, recordedWith) =>
      store.findConflicts(id, hotkey, recordedWith),
  }
}
