import { normalizeKeyName } from './constants'

type Target = HTMLElement | Document | Window

// Nodes and windows can come from another frame (a same-origin iframe or a
// popup window), whose DOM classes differ from this window's. These helpers
// check `nodeType`, `localName`, and properties instead of using `instanceof`,
// which is false for every object from another frame.

function isElement(node: unknown): node is Element {
  return (node as Node | null)?.nodeType === 1 // Node.ELEMENT_NODE
}

/** Whether a target is a document or window, which receive every key press in their document. */
export function isDocumentLevel(target: Target): target is Document | Window {
  return 'document' in target || target.nodeType === 9 // Node.DOCUMENT_NODE
}

/** Returns the document a listener target belongs to, in any frame. */
export function getTargetDocument(target: Target): Document {
  // A document has no owner document
  return 'document' in target
    ? target.document
    : (target.ownerDocument ?? target)
}

// Focus

/** The focused element, looking inside open shadow roots. */
function getDeepActiveElement(doc: Document): Element | null {
  let active = doc.activeElement
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement
  }
  return active
}

/** The next node a key event bubbles to: a slot, a shadow host, or the parent. */
function composedParent(node: Node): Node | null {
  return (
    (node as Element).assignedSlot ??
    node.parentNode ??
    // A shadow root has no parent node; continue from its host.
    ((node as Partial<ShadowRoot>).host || null)
  )
}

/**
 * Whether key presses reach a listener on `target` right now. Document and
 * window listeners receive every key press in their document. An element
 * receives them only while focus is inside it, including inside a shadow
 * root it contains or on content slotted into it.
 */
export function targetHasFocus(target: Target): boolean {
  if (isDocumentLevel(target)) return true
  for (
    let node: Node | null = getDeepActiveElement(target.ownerDocument);
    node;
    node = composedParent(node)
  ) {
    if (node === target) return true
  }
  return false
}

// What blocks a key

// Plain array literals, not spreads, so bundlers can drop lists a build doesn't use
const VERTICAL = ['ArrowUp', 'ArrowDown']
const HORIZONTAL = ['ArrowLeft', 'ArrowRight']
const ENTER = ['Enter']
const SPACE = ['Space']
const ACTIVATION = ['Enter', 'Space']
// Marks widgets that move focus to the item starting with a typed character
const TYPEAHEAD = 'typeahead'
const MENU = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'Enter',
  'Space',
  TYPEAHEAD,
]
const COMBOBOX = [
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'Enter',
  'Space',
  TYPEAHEAD,
]
const GRID = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter',
  'Space',
]
const RADIOS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']
const NAVIGATION = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]
const SPIN = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']
// Read-only text inputs still move the caret and select text
const CARET = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

/**
 * Input types that aren't text fields, with the keys each one keeps. Browsers
 * report unknown types as `'text'`.
 */
const INPUT_KEYS: Record<string, ReadonlyArray<string> | undefined> = {
  button: ACTIVATION,
  submit: ACTIVATION,
  reset: ACTIVATION,
  image: ACTIVATION,
  color: ACTIVATION,
  file: ACTIVATION,
  checkbox: SPACE,
  radio: RADIOS,
  range: NAVIGATION,
}

function getRole(element: Element): string | undefined {
  return element.getAttribute('role')?.trim().split(/\s+/)[0]
}

/**
 * Checks if an element is a text field that hotkeys should not type over:
 * - text-entry `<input>` types (text, number, date, and similar) that aren't read-only
 * - `<textarea>` elements that aren't read-only, and `<select>` elements
 * - elements with `role="textbox"` or `role="searchbox"`
 * - contenteditable elements
 *
 * Checkbox, radio, range, color, file, and button-type inputs are not text
 * fields. Hotkeys skip only the keys those controls use themselves.
 */
export function isInputElement(element: EventTarget | null): boolean {
  if (!isElement(element)) return false
  switch (element.localName) {
    case 'input': {
      const input = element as HTMLInputElement
      return !INPUT_KEYS[input.type] && !input.readOnly
    }
    case 'textarea':
      return !(element as HTMLTextAreaElement).readOnly
    case 'select':
      return true
  }
  const role = getRole(element)
  return (
    role === 'textbox' ||
    role === 'searchbox' ||
    // Includes "plaintext-only" and contenteditable inherited from an ancestor
    (element as HTMLElement).isContentEditable
  )
}

/**
 * Whether the focused custom element may be a text field whose contents can't
 * be seen from outside:
 * - a host with focus inside a closed shadow root. Without a `tabindex` it
 *   can't hold focus itself, and an open root would have shown the focused
 *   element inside it.
 * - a form-associated element without a `role` attribute naming another control
 */
function isHiddenTextField(element: Element): boolean {
  if (!element.localName.includes('-')) return false
  return (element.constructor as { formAssociated?: unknown })
    .formAssociated === true
    ? !element.hasAttribute('role')
    : !element.hasAttribute('tabindex')
}

/**
 * Returns the keys a control handles itself: activation for buttons and
 * links, and navigation for ARIA widgets, following the WAI-ARIA Authoring
 * Practices keyboard patterns (https://www.w3.org/WAI/ARIA/apg/patterns/).
 * Editable text fields never get here: they block every key that types text.
 */
function getOwnedKeys(element: Element): ReadonlyArray<string> {
  const orientation = element.getAttribute('aria-orientation')
  switch (getRole(element)) {
    case 'button':
    case 'tab':
    case 'option':
    case 'treeitem':
    case 'menuitem':
    case 'menuitemcheckbox':
    case 'menuitemradio':
      return ACTIVATION
    case 'link':
      return ENTER
    case 'checkbox':
    case 'switch':
    case 'radio':
      return SPACE
    case 'menu':
    case 'menubar':
    case 'tree':
      return MENU
    case 'listbox':
      return [
        ...(orientation === 'horizontal' ? HORIZONTAL : VERTICAL),
        'Home',
        'End',
        'Enter',
        'Space',
        TYPEAHEAD,
      ]
    case 'combobox':
      return COMBOBOX
    case 'tablist':
      return [
        ...(orientation === 'vertical' ? VERTICAL : HORIZONTAL),
        'Home',
        'End',
        'Enter',
        'Space',
      ]
    case 'toolbar':
      return [
        ...(orientation === 'vertical' ? VERTICAL : HORIZONTAL),
        'Home',
        'End',
      ]
    case 'grid':
    case 'treegrid':
      return GRID
    case 'radiogroup':
      return RADIOS
    case 'slider':
      return NAVIGATION
    case 'spinbutton':
      return SPIN
  }

  switch (element.localName) {
    case 'button':
    case 'summary':
      return ACTIVATION
    case 'input':
      // Only read-only text inputs aren't listed
      return INPUT_KEYS[(element as HTMLInputElement).type] ?? CARET
    case 'textarea':
      // Only read-only textareas
      return NAVIGATION
    case 'a':
    case 'area':
      return element.hasAttribute('href') ? ENTER : []
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
    owned.includes(key) || (owned.includes(TYPEAHEAD) && /^.$/u.test(event.key))
  )
}

// The walk

interface Blocker {
  /** The elements the event passes through, starting where it began. */
  elements: Array<Element>
  /** Index of the first element that blocks the key, or -1. */
  index: number
}

/**
 * Finds the first element on the event's way out that blocks it, walking out
 * from the focused element. A key event starts there in a browser. One sent
 * by a test may start at an ancestor of the focused element or at the
 * document, and the walk from focus passes through those too. Only an event
 * that starts where focus can't be seen, such as inside a closed shadow root,
 * uses its own path.
 */
function findBlocker(
  event: KeyboardEvent,
  doc: Document,
  test: (element: Element) => boolean,
): Blocker {
  const focused = getDeepActiveElement(doc)
  let elements: Array<Element> = []
  for (let node: Node | null = focused; node; node = composedParent(node)) {
    if (isElement(node)) elements.push(node)
  }
  // The path is empty once dispatch has finished.
  const origin = event.composedPath()[0]
  if (isElement(origin) && !elements.includes(origin)) {
    elements = event.composedPath().filter(isElement)
  }
  const index = elements.findIndex(
    (element) =>
      test(element) ||
      // Only the focused element itself: its ancestors are often custom elements too
      (element === focused && isHiddenTextField(element)),
  )
  return { elements, index }
}

/** Whether the blocking element is inside `target`. A target never blocks itself. */
function blocks({ elements, index }: Blocker, target: Target): boolean {
  return (
    index >= 0 && (isDocumentLevel(target) || index < elements.indexOf(target))
  )
}

// Every registration the event reaches asks about the same event.
const ignoreCache = new WeakMap<KeyboardEvent, Blocker>()

/**
 * Returns whether a hotkey on `target` should skip an event because a control
 * inside the target handles the key itself:
 * - text fields, including ARIA text roles and custom elements that hide one (typing)
 * - buttons, links, `<summary>`, and button-like inputs (Enter and Space activation)
 * - checkbox, radio, and range inputs, and ARIA widgets such as menus,
 *   listboxes, tabs, and grids (the keys they use)
 *
 * A hotkey targeted at a control receives that control's keys.
 */
export function shouldIgnoreInputEvent(
  event: KeyboardEvent,
  target: Target,
): boolean {
  let blocker = ignoreCache.get(event)
  if (!blocker) {
    const key = normalizeKeyName(event.key)
    blocker = findBlocker(
      event,
      getTargetDocument(target),
      (element) => isInputElement(element) || ownsKey(element, event, key),
    )
    ignoreCache.set(event, blocker)
  }
  return blocks(blocker, target)
}

/**
 * Returns whether an event comes from a text field inside `target`, as
 * `isInputElement` and hidden custom text fields define them. Buttons, links,
 * and other controls don't count.
 */
export function isTypingEvent(event: KeyboardEvent, target: Target): boolean {
  return blocks(
    findBlocker(event, getTargetDocument(target), isInputElement),
    target,
  )
}
