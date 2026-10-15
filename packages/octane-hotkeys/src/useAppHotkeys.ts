import { useHotkeysContext } from './HotkeysProvider'
import { subSlot, useAppHotkeysStore } from './internal'
import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import type {
  AppHotkeyListItem,
  AppHotkeysStore,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'
import type { HotkeyRegistrationsResult, UseCustomHotkeysResult } from './types'

function useRequiredStore(
  name: string,
  slot: symbol | undefined,
): AppHotkeysStore<RegisteredAppHotkeys> {
  const store = useAppHotkeysStore(
    useHotkeysContext()?.appHotkeysStore ?? null,
    subSlot(slot, `${name}-store`),
  )
  if (!store) {
    throw new Error(`${name} requires a HotkeysProvider with appHotkeys`)
  }
  return store
}

/**
 * Returns the effective app hotkeys from `HotkeysProvider`, typed by
 * `Register`: each declaration with the user's custom hotkey applied.
 */
export function useAppHotkeys(): RegisteredAppHotkeys
export function useAppHotkeys(slot?: symbol): RegisteredAppHotkeys {
  return useRequiredStore('useAppHotkeys', slot).appHotkeys
}

/**
 * Lists every app hotkey with its live status, in declaration order, for
 * cheat sheets and settings screens. App hotkeys whose components have not
 * mounted are `'inactive'`; those without a hotkey are `'unbound'`.
 */
export function useAppHotkeyList(): Array<
  AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>
>
export function useAppHotkeyList(
  slot?: symbol,
): Array<AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>> {
  const store = useRequiredStore('useAppHotkeyList', slot)
  const registrations = (
    useHotkeyRegistrations as (slot: symbol) => HotkeyRegistrationsResult
  )(subSlot(slot, 'registrations'))
  return store.getList(registrations.hotkeys)
}

/**
 * Reads and changes the user's custom hotkeys. Changes apply to every
 * registered app hotkey immediately and are passed to the provider's
 * `onCustomHotkeysChange`, ready to save.
 */
export function useCustomHotkeys(): UseCustomHotkeysResult
export function useCustomHotkeys(slot?: symbol): UseCustomHotkeysResult {
  const store = useRequiredStore('useCustomHotkeys', slot)
  return {
    customHotkeys: store.customHotkeys,
    setCustomHotkey: (id, hotkey) => store.setCustomHotkey(id, hotkey),
    resetCustomHotkey: (id) => store.resetCustomHotkey(id),
    resetCustomHotkeys: () => store.resetCustomHotkeys(),
    findConflicts: (id, hotkey) => store.findConflicts(id, hotkey),
  }
}
