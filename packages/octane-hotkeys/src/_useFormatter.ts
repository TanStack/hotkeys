import { detectPlatform } from '@tanstack/hotkeys'
import {
  createFormatter,
  getServerPlatformSnapshot,
} from '@tanstack/hotkeys/adapter'
import { useCallback, useSyncExternalStore } from 'octane'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { subSlot } from './internal'
import { useKeyboardLayout } from './useKeyboardLayout'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'

const subscribe = () => () => {}

/**
 * `format`, such as `formatForDisplay`, bound to the provider's platform, or the
 * detected one, and the keyboard layout. `tag` keeps each formatter's slots
 * apart when a component uses both. Without a provider platform, server
 * rendering and hydration use 'linux', then the client re-renders with the
 * detected platform.
 */
export function useFormatter<
  TFormat extends Parameters<typeof createFormatter>[0],
>(format: TFormat, tag: string, slot?: symbol): TFormat {
  const provided = useDefaultHotkeysOptions().platform
  // The provider's platform also goes in the server snapshot, so a server
  // render with a platform does not warn.
  const platform = useSyncExternalStore(
    subscribe,
    () => provided ?? detectPlatform(),
    () => provided ?? getServerPlatformSnapshot(),
    subSlot(slot, `${tag}platform`),
  )
  const layoutMap = (
    useKeyboardLayout as (slot: symbol) => KeyboardLayoutMap | null
  )(subSlot(slot, `${tag}layout`))
  return useCallback(
    createFormatter(
      format,
      () => platform,
      () => layoutMap,
    ),
    [platform, layoutMap],
    subSlot(slot, `${tag}format`),
  )
}
