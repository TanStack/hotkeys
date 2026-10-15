import { normalizeKeyName } from './constants'

// Nodes and windows can come from another frame (a same-origin iframe or a
// popup window), whose DOM classes differ from this window's. These helpers
// check `nodeType`, `localName`, and properties instead of using `instanceof`,
// which is false for every object from another frame.

function isNode(target: EventTarget | null): target is Node {
  return typeof (target as Node | null)?.nodeType === 'number'
}

function isElement(target: EventTarget | null): target is Element {
  return isNode(target) && target.nodeType === 1 // Node.ELEMENT_NODE
}

function isWindow(target: HTMLElement | Document | Window): target is Window {
  return 'document' in target
}

/** Returns the document a listener target belongs to, in any frame. */
export function getTargetDocument(
  target: HTMLElement | Document | Window,
): Document {
  if (isWindow(target)) return target.document
  if (target.nodeType === 9) return target as Document // Node.DOCUMENT_NODE
  return (target as HTMLElement).ownerDocument
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
  if (!isElement(element)) {
    return false
  }

  if (element.localName === 'input') {
    const type = (element as HTMLInputElement).type.toLowerCase()
    return type !== 'button' && type !== 'submit' && type !== 'reset'
  }

  if (element.localName === 'textarea' || element.localName === 'select') {
    return true
  }

  // Check for contenteditable elements (includes "true", "", "plaintext-only",
  // and inherited contenteditable from ancestor elements)
  return (element as HTMLElement).isContentEditable === true
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

  return getTargetDocument(target).activeElement
}

/** Native buttons use Space/Enter; links only use Enter for activation. */
function isNativeActivationElement(
  element: EventTarget | null,
  key: string,
): boolean {
  if (!isElement(element)) return false
  if (element.localName === 'button') return true
  if (element.localName === 'input') {
    const type = (element as HTMLInputElement).type
    return type === 'button' || type === 'submit' || type === 'reset'
  }
  return (
    key === 'Enter' &&
    (element.localName === 'a' || element.localName === 'area') &&
    element.hasAttribute('href')
  )
}

/**
 * Returns whether an event should be ignored because it originated from an
 * input-like element other than the registration target. Document/window
 * registrations also leave unmodified native control activation keys alone.
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
  const key = normalizeKeyName(event.key)
  const preserveActivation =
    (isWindow(registrationTarget) || registrationTarget.nodeType === 9) &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey &&
    (key === 'Space' || key === 'Enter')
  const shouldIgnore = (element: EventTarget | null) =>
    element !== registrationTarget &&
    (isInputElement(element) ||
      (preserveActivation && isNativeActivationElement(element, key)))

  const focused = getActiveElementForListenerTarget(listenerTarget)
  if (shouldIgnore(focused)) {
    return true
  }

  if (event.composedPath().some(shouldIgnore)) {
    return true
  }

  return shouldIgnore(event.target)
}

/**
 * Checks if an event is for the given target (originated from or bubbled to it).
 *
 * For document/window targets, also accepts the document's root element as
 * currentTarget to handle Brave and other browsers where currentTarget may be
 * documentElement instead of document when listeners are attached to document.
 */
export function isEventForTarget(
  event: KeyboardEvent,
  target: HTMLElement | Document | Window,
): boolean {
  if (event.currentTarget === target) {
    return true
  }

  // Browser compatibility note:
  // Per the DOM spec, event.currentTarget should equal the element the listener was
  // attached to. However, some Chromium-based browsers (notably Brave) exhibit
  // non-standard behavior where event.currentTarget is set to document.documentElement
  // (<html>) instead of document when a listener is attached to document.
  // This may be related to privacy/fingerprinting protections.
  // See: https://dom.spec.whatwg.org/#dom-event-currenttarget
  if (isWindow(target) || target.nodeType === 9) {
    return event.currentTarget === getTargetDocument(target).documentElement
  }

  // For an element, accept events that originated inside it
  return isNode(event.target) && target.contains(event.target)
}
