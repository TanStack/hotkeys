import { getHotkeyManager } from '@tanstack/hotkeys'
import type { AppHotkeysStore } from '@tanstack/hotkeys'

export { subscribePublishedAppHotkeys as subscribeAppHotkeys } from '@tanstack/hotkeys/adapter'

/** The app hotkeys store published by `provideAppHotkeys`, if any. */
export function getAppHotkeysStore(): AppHotkeysStore | null {
  return getHotkeyManager().appHotkeys.state
}
