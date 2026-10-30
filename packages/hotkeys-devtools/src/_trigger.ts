import { HotkeyManager } from '@tanstack/hotkeys'
import type { HotkeyCallbackContext } from '@tanstack/hotkeys'

/**
 * Runs a registration's callback as if its hotkey, or a sequence's last step,
 * was pressed, and counts it like a real press. The event names the physical
 * code for physical bindings and the key otherwise.
 *
 * @returns False when no registration has the id
 */
export function triggerRegistration(
  id: string,
  manager: HotkeyManager = HotkeyManager.getInstance(),
): boolean {
  const registration = manager.registrations.state.get(id)
  if (!registration) return false

  const context: HotkeyCallbackContext =
    registration.kind === 'chord'
      ? {
          kind: 'chord',
          hotkey: registration.hotkey,
          parsedChord: registration.parsedChord,
        }
      : {
          kind: 'sequence',
          hotkey: registration.hotkey,
          parsedSequence: registration.parsedSequence,
        }
  const parsed =
    registration.kind === 'chord'
      ? registration.parsedChord
      : registration.parsedSequence[registration.parsedSequence.length - 1]!
  const event = new KeyboardEvent(registration.options.eventType ?? 'keydown', {
    ...(parsed.code !== undefined
      ? { code: parsed.code }
      : { key: parsed.key }),
    ctrlKey: parsed.ctrl,
    shiftKey: parsed.shift,
    altKey: parsed.alt,
    metaKey: parsed.meta,
    bubbles: true,
    cancelable: true,
  })

  registration.triggerCount++
  if (registration.kind === 'sequence') registration.hasFired = true
  // A new Map with the same registrations, so subscribers see the change
  manager.registrations.setState((prev) => new Map(prev))
  registration.callback(event, context)
  return true
}
