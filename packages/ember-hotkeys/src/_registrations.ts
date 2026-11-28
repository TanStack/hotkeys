import { getHotkeyManager } from '@tanstack/hotkeys'
import { getHotkeyRegistrationViews } from '@tanstack/hotkeys/adapter'
import { trackedVersion } from './tracked'
import type { HotkeyManager, HotkeyRegistrationView } from '@tanstack/hotkeys'

let watched:
  | { manager: HotkeyManager; changes: { version: number } }
  | undefined

/**
 * The registration views, read so that templates render again when a
 * registration changes. It needs no owner: the subscription follows the
 * current manager and lasts as long as it does.
 */
export function trackedRegistrationViews(): Array<HotkeyRegistrationView> {
  const manager = getHotkeyManager()
  if (watched?.manager !== manager) {
    const changes = trackedVersion()
    manager.registrations.subscribe(() => {
      changes.version++
    })
    watched = { manager, changes }
  }
  void watched.changes.version
  return getHotkeyRegistrationViews(manager.registrations.state)
}
