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
 * Returns the focused element for the document associated with where hotkey
 * listeners are attached (listener root). Use this instead of the global
 * `document.activeElement` so registrations scoped to an iframe (or another
 * document) read focus from the correct tree.
 */
export function getActiveElementForListenerTarget(
  target: HTMLElement | Document | Window,
): Element | null {
  if (typeof document === 'undefined') {
    return null
  }

  // Document first (nodeType covers environments where `document instanceof Document` is false)
  if (
    (typeof Document !== 'undefined' && target instanceof Document) ||
    (typeof Node !== 'undefined' &&
      (target as Node).nodeType === Node.DOCUMENT_NODE)
  ) {
    return (target as Document).activeElement
  }

  if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
    return target.ownerDocument.activeElement ?? null
  }

  // Window (global or iframe): avoid relying on `instanceof Window` alone (test DOM quirks)
  return (target as Window).document.activeElement ?? null
}

/**
 * Returns whether an event should be ignored because it originated from an
 * input-like element other than the registration target.
 *
 * This checks:
 * - the currently focused element for the listener target
 * - the event's composed path (for shadow DOM)
 * - the event target as a final fallback
 */
export function shouldIgnoreInputEvent(
  event: KeyboardEvent,
  listenerTarget: HTMLElement | Document | Window,
  registrationTarget: HTMLElement | Document | Window,
): boolean {
  const focused = getActiveElementForListenerTarget(listenerTarget)
  if (focused && isInputElement(focused) && focused !== registrationTarget) {
    return true
  }

  if (
    event
      .composedPath()
      .some(
        (element) => isInputElement(element) && element !== registrationTarget,
      )
  ) {
    return true
  }

  return isInputElement(event.target) && event.target !== registrationTarget
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
