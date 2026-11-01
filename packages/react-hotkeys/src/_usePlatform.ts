'use client'

import { useSyncExternalStore } from 'react'
import { detectPlatform } from '@tanstack/hotkeys'
import { getServerPlatformSnapshot } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type { HotkeyPlatform } from '@tanstack/hotkeys'

const subscribe = () => () => {}

/**
 * The provider's platform, or the detected one. Without a provider platform,
 * server rendering and hydration use 'linux', then the client re-renders
 * with the detected platform.
 */
export function usePlatform(): HotkeyPlatform {
  const platform = useDefaultHotkeysOptions().platform
  // The provider's platform also goes in the server snapshot, so a server
  // render with a platform does not warn.
  return useSyncExternalStore(
    subscribe,
    () => platform ?? detectPlatform(),
    () => platform ?? getServerPlatformSnapshot(),
  )
}
