import { withAltGraph } from './alt-graph'
import type { HotkeyEventType } from '@tanstack/hotkeys'

/** Options for `keydown` and `keyup`. */
export interface KeyOptions extends KeyboardEventInit {
  /** `KeyboardEvent.key`, such as `a`, `Enter` or `@`. */
  key: string
  /** Whether `getModifierState('AltGraph')` reports AltGr held. Default false. */
  altGraph?: boolean
  /** When set, the event is dispatched on this target before it is returned. */
  target?: EventTarget
}

/**
 * Creates a keyboard event, and dispatches it when `target` is set. Events
 * bubble and are cancelable unless the options say otherwise.
 */
export function keyEvent(
  type: HotkeyEventType,
  options: KeyOptions,
): KeyboardEvent {
  const { altGraph = false, target, ...init } = options
  const event = withAltGraph(
    new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }),
    altGraph,
  )
  target?.dispatchEvent(event)
  return event
}

/** Creates a `keydown` event. See `keyEvent`. */
export function keydown(options: KeyOptions): KeyboardEvent {
  return keyEvent('keydown', options)
}

/** Creates a `keyup` event. See `keyEvent`. */
export function keyup(options: KeyOptions): KeyboardEvent {
  return keyEvent('keyup', options)
}
