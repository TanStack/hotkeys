'use client'

import { Store, useSelector } from '@tanstack/react-store'
import { useHotkeysContext } from './HotkeysProvider'
import type { AppHotkeysState, AppHotkeysStore } from '@tanstack/hotkeys'

const NO_APP_HOTKEYS = new Store<AppHotkeysState | null>(null)

/**
 * The provider's app hotkeys store, re-rendering when app hotkeys or custom
 * hotkeys change. Null outside a provider with `appHotkeys`.
 */
export function useAppHotkeysStoreState(): AppHotkeysStore | null {
  const store = useHotkeysContext()?.appHotkeysStore ?? null
  useSelector(store?.store ?? NO_APP_HOTKEYS, (state) => state)
  return store
}
