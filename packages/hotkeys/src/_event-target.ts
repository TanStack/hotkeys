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

/** Whether an event reaches a listener on `target`, from any listener's point of view. */
export function eventReachesTarget(
  event: Event,
  target: HTMLElement | Document | Window,
): boolean {
  if (event.target === target) return true
  if (!isNode(event.target)) return false
  const container =
    isWindow(target) || target.nodeType === 9
      ? getTargetDocument(target)
      : target
  return container.contains(event.target)
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

const VERTICAL = ['ArrowUp', 'ArrowDown']
const HORIZONTAL = ['ArrowLeft', 'ArrowRight']
const ARROWS = [...VERTICAL, ...HORIZONTAL]
const EDGES = ['Home', 'End']
const PAGES = ['PageUp', 'PageDown']
const ACTIVATION = ['Enter', 'Space']
// Marks widgets that move focus to the item starting with a typed character
const TYPEAHEAD = 'typeahead'

/**
 * Returns the keys a control handles itself: activation for buttons and
 * links, and navigation for ARIA widgets, following the WAI-ARIA Authoring
 * Practices keyboard patterns (https://www.w3.org/WAI/ARIA/apg/patterns/).
 */
function getOwnedKeys(element: Element): ReadonlyArray<string> {
  const orientation = element.getAttribute('aria-orientation')
  switch (element.getAttribute('role')?.trim().split(/\s+/)[0]) {
    case 'button':
    case 'tab':
    case 'option':
    case 'treeitem':
    case 'menuitem':
    case 'menuitemcheckbox':
    case 'menuitemradio':
      return ACTIVATION
    case 'link':
      return ['Enter']
    case 'checkbox':
    case 'switch':
    case 'radio':
      return ['Space']
    case 'menu':
    case 'menubar':
    case 'tree':
      return [...ARROWS, ...EDGES, ...ACTIVATION, TYPEAHEAD]
    case 'listbox':
      return [
        ...(orientation === 'horizontal' ? HORIZONTAL : VERTICAL),
        ...EDGES,
        ...ACTIVATION,
        TYPEAHEAD,
      ]
    case 'combobox':
      return [...VERTICAL, ...EDGES, ...ACTIVATION, TYPEAHEAD]
    case 'tablist':
      return [
        ...(orientation === 'vertical' ? VERTICAL : HORIZONTAL),
        ...EDGES,
        ...ACTIVATION,
      ]
    case 'toolbar':
      return [...(orientation === 'vertical' ? VERTICAL : HORIZONTAL), ...EDGES]
    case 'grid':
    case 'treegrid':
      return [...ARROWS, ...EDGES, ...PAGES, ...ACTIVATION]
    case 'radiogroup':
      return [...ARROWS, 'Space']
    case 'slider':
      return [...ARROWS, ...EDGES, ...PAGES]
    case 'spinbutton':
      return [...VERTICAL, ...EDGES, ...PAGES]
  }

  switch (element.localName) {
    case 'button':
    case 'summary':
      return ACTIVATION
    case 'input': {
      const type = (element as HTMLInputElement).type
      return type === 'button' || type === 'submit' || type === 'reset'
        ? ACTIVATION
        : []
    }
    case 'a':
    case 'area':
      return element.hasAttribute('href') ? ['Enter'] : []
  }
  return []
}

/**
 * Whether a control handles this key itself. Ctrl, Meta, and Alt combinations
 * are never owned; Enter and Space are owned only without modifiers, while
 * navigation and typeahead keys allow Shift (for example, to extend a selection).
 */
function ownsKey(element: Element, event: KeyboardEvent, key: string): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  const owned = getOwnedKeys(element)
  if (key === 'Enter' || key === 'Space') {
    return !event.shiftKey && owned.includes(key)
  }
  return (
    owned.includes(key) ||
    (owned.includes(TYPEAHEAD) && /^\S$/u.test(event.key))
  )
}

/**
 * Whether the focused element or an element on the event's path passes `test`.
 * Only elements inside the registration target count: walking outward from
 * the event's origin stops at the registration target, so a hotkey targeted
 * at a control, or at an element inside it, is not blocked by that control.
 */
function someElementInsideTarget(
  event: KeyboardEvent,
  listenerTarget: HTMLElement | Document | Window,
  registrationTarget: HTMLElement | Document | Window,
  test: (element: Element) => boolean,
): boolean {
  const scoped =
    !isWindow(registrationTarget) && registrationTarget.nodeType !== 9
  const focused = getActiveElementForListenerTarget(listenerTarget)
  if (
    focused &&
    focused !== registrationTarget &&
    (!scoped || (registrationTarget as HTMLElement).contains(focused)) &&
    test(focused)
  ) {
    return true
  }

  // The composed path includes elements inside open shadow roots. It is empty
  // once dispatch has finished, so fall back to the event target.
  const path = event.composedPath()
  for (const element of path.length > 0 ? path : [event.target]) {
    if (element === registrationTarget) break
    if (isElement(element) && test(element)) return true
  }
  return false
}

/**
 * Returns whether a hotkey should skip an event because a focused control
 * inside the registration target handles the key itself:
 * - text inputs, textareas, selects, and contenteditable elements (typing)
 * - buttons, links, and `<summary>` elements (Enter and Space activation)
 * - ARIA widgets such as menus, listboxes, tabs, and grids (navigation keys)
 */
export function shouldIgnoreInputEvent(
  event: KeyboardEvent,
  listenerTarget: HTMLElement | Document | Window,
  registrationTarget: HTMLElement | Document | Window,
): boolean {
  const key = normalizeKeyName(event.key)
  return someElementInsideTarget(
    event,
    listenerTarget,
    registrationTarget,
    (element) => isInputElement(element) || ownsKey(element, event, key),
  )
}

/**
 * Returns whether an event comes from a text input, textarea, select, or
 * contenteditable element in the target's document. Unlike
 * `shouldIgnoreInputEvent`, buttons, links, and ARIA widgets don't count.
 */
export function isTypingEvent(
  event: KeyboardEvent,
  target: HTMLElement | Document | Window,
): boolean {
  return someElementInsideTarget(event, target, target, isInputElement)
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
