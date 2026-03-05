import type { ParsedHotkey } from './hotkey'

/**
 * Behavior when registering a hotkey/sequence that conflicts with an existing registration.
 *
 * - `'warn'` - Log a warning to the console but allow both registrations (default)
 * - `'error'` - Throw an error and prevent the new registration
 * - `'replace'` - Unregister the existing registration and register the new one
 * - `'allow'` - Allow multiple registrations without warning
 */
export type ConflictBehavior = 'warn' | 'error' | 'replace' | 'allow'

/**
 * Default options for hotkey/sequence registration.
 * Omitted: platform, target (resolved at registration), requireReset (HotkeyManager only).
 */
export const defaultHotkeyOptions = {
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown' as const,
  enabled: true,
  ignoreInputs: true,
  conflictBehavior: 'warn' as ConflictBehavior,
}

/**
 * Computes the default ignoreInputs value based on the hotkey.
 * Ctrl/Meta shortcuts and Escape fire in inputs; single keys and Shift/Alt combos are ignored.
 */
export function getDefaultIgnoreInputs(parsedHotkey: ParsedHotkey): boolean {
  if (parsedHotkey.ctrl || parsedHotkey.meta) return false // Mod+S, Ctrl+C, etc.
  if (parsedHotkey.key === 'Escape') return false // Close modal, etc.
  return true // Single keys, Shift+key, Alt+key
}

/**
 * Checks if an element is an input-like element that should be ignored for hotkeys.
 *
 * This includes:
 * - HTMLInputElement (all input types except button, submit, reset)
 * - HTMLTextAreaElement
 * - HTMLSelectElement
 * - Elements with contentEditable enabled
 *
 * Button-type inputs (button, submit, reset) are excluded so hotkeys like
 * Mod+S and Escape fire when the user has tabbed to a form button.
 */
export function isInputElement(element: EventTarget | null): boolean {
  if (!element) {
    return false
  }

  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase()
    if (type === 'button' || type === 'submit' || type === 'reset') {
      return false
    }
    return true
  }

  if (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return true
  }

  // Check for contenteditable elements (includes "true", "", "plaintext-only",
  // and inherited contenteditable from ancestor elements)
  if (element instanceof HTMLElement && element.isContentEditable) {
    return true
  }

  return false
}

/**
 * Checks if an event is for the given target (originated from or bubbled to it).
 *
 * For document/window targets, also accepts document.documentElement as currentTarget
 * to handle Brave and other browsers where currentTarget may be documentElement
 * instead of document when listeners are attached to document.
 */
export function isEventForTarget(
  event: KeyboardEvent,
  target: HTMLElement | Document | Window,
): boolean {
  // For Document and Window, verify that our handler was indeed called for this target.
  //
  // Browser compatibility note:
  // Per the DOM spec, event.currentTarget should equal the element the listener was
  // attached to. However, some Chromium-based browsers (notably Brave) exhibit
  // non-standard behavior where event.currentTarget is set to document.documentElement
  // (<html>) instead of document when a listener is attached to document.
  // This may be related to privacy/fingerprinting protections.
  //
  // To ensure cross-browser compatibility, we accept both the expected target
  // and document.documentElement as valid currentTarget values.
  // See: https://dom.spec.whatwg.org/#dom-event-currenttarget
  if (target === document || target === window) {
    return (
      event.currentTarget === target ||
      event.currentTarget === document.documentElement
    )
  }

  // For Window, accept window, document, or document.documentElement (browser quirks)
  if (target === window) {
    return (
      event.currentTarget === window ||
      event.currentTarget === document ||
      event.currentTarget === document.documentElement
    )
  }

  // For HTMLElement, check if event originated from or bubbled to the element
  if (target instanceof HTMLElement) {
    // Check if the event's currentTarget is the target (capturing/bubbling)
    if (event.currentTarget === target) {
      return true
    }

    // Check if the event's target is a descendant of our target
    if (event.target instanceof Node && target.contains(event.target)) {
      return true
    }
  }

  return false
}

/**
 * Handles conflicts between registrations based on conflict behavior.
 *
 * @param conflictingId - The ID of the conflicting registration
 * @param keyDisplay - Display string for the conflicting key/sequence (for error messages)
 * @param conflictBehavior - How to handle the conflict
 * @param unregister - Function to unregister by ID
 */
export function handleConflict(
  conflictingId: string,
  keyDisplay: string,
  conflictBehavior: ConflictBehavior,
  unregister: (id: string) => void,
): void {
  if (conflictBehavior === 'allow') {
    return
  }

  if (conflictBehavior === 'warn') {
    console.warn(
      `'${keyDisplay}' is already registered. Multiple handlers will be triggered. ` +
        `Use conflictBehavior: 'replace' to replace the existing handler, ` +
        `or conflictBehavior: 'allow' to suppress this warning.`,
    )
    return
  }

  if (conflictBehavior === 'error') {
    throw new Error(
      `'${keyDisplay}' is already registered. ` +
        `Use conflictBehavior: 'replace' to replace the existing handler, ` +
        `or conflictBehavior: 'allow' to allow multiple registrations.`,
    )
  }

  // At this point, conflictBehavior must be 'replace'
  unregister(conflictingId)
}
