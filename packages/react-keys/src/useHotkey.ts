import { useEffect, useRef } from 'react'
import { formatHotkey, getHotkeyManager } from '@tanstack/keys'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  ParsedHotkey,
} from '@tanstack/keys'

export interface UseHotkeyOptions extends Omit<HotkeyOptions, 'target'> {
  /**
   * The DOM element to attach the event listener to.
   * Can be a React ref, direct DOM element, or null.
   * Defaults to document.
   */
  target?:
  | React.RefObject<HTMLElement | null>
  | HTMLElement
  | Document
  | Window
  | null
}

/**
 * React hook for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * This hook syncs the callback and options on every render to avoid
 * stale closures, similar to TanStack Pacer's pattern. This means
 * callbacks that reference React state will always have access to
 * the latest values.
 *
 * @param hotkey - The hotkey string (e.g., 'Mod+S', 'Escape') or ParsedHotkey object
 * @param callback - The function to call when the hotkey is pressed
 * @param options - Options for the hotkey behavior
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const [count, setCount] = useState(0)
 *
 *   // Callback always has access to latest count value
 *   useHotkey('Mod+S', (event, { hotkey }) => {
 *     console.log(`Save triggered, count is ${count}`)
 *     handleSave()
 *   }, { preventDefault: true })
 *
 *   return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   // enabled option is synced on every render
 *   useHotkey('Escape', () => {
 *     onClose()
 *   }, { enabled: isOpen })
 *
 *   if (!isOpen) return null
 *   return <div className="modal">...</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const editorRef = useRef<HTMLDivElement>(null)
 *
 *   // Scoped to a specific element
 *   useHotkey('Mod+S', () => {
 *     save()
 *   }, { target: editorRef, preventDefault: true })
 *
 *   return <div ref={editorRef}>...</div>
 * }
 * ```
 */
export function useHotkey(
  hotkey: Hotkey | ParsedHotkey,
  callback: HotkeyCallback,
  options: UseHotkeyOptions = {},
): void {
  const manager = getHotkeyManager()

  // Stable ref for registration handle
  const registrationRef = useRef<HotkeyRegistrationHandle | null>(null)

  // Refs to capture current values for use in effect without adding dependencies
  // This follows TanStack Pacer's pattern - values are synced on every render
  const callbackRef = useRef(callback)
  const optionsRef = useRef(options)
  const managerRef = useRef(manager)

  // Update refs on every render
  callbackRef.current = callback
  optionsRef.current = options
  managerRef.current = manager

  // Track previous target and hotkey to detect changes requiring re-registration
  const prevTargetRef = useRef<HTMLElement | Document | Window | null>(null)
  const prevHotkeyRef = useRef<string | null>(null)

  // Resolve target - unwrap React refs
  const resolvedTarget = isRef(options.target)
    ? options.target.current
    : (options.target ?? (typeof document !== 'undefined' ? document : null))

  // Format hotkey string
  const hotkeyString: Hotkey =
    typeof hotkey === 'string' ? hotkey : (formatHotkey(hotkey) as Hotkey)

  // Extract options without target (target is handled separately)
  const { target: _target, ...optionsWithoutTarget } = options

  useEffect(() => {
    // Skip if no valid target (ref not attached yet, or SSR)
    if (!resolvedTarget) {
      return
    }

    // Check if we need to re-register (target or hotkey changed)
    const targetChanged =
      prevTargetRef.current !== null && prevTargetRef.current !== resolvedTarget
    const hotkeyChanged =
      prevHotkeyRef.current !== null && prevHotkeyRef.current !== hotkeyString

    // If we have an active registration and target/hotkey changed, unregister first
    if (registrationRef.current?.isActive && (targetChanged || hotkeyChanged)) {
      registrationRef.current.unregister()
      registrationRef.current = null
    }

    // Register if needed (no active registration)
    // Use refs to access current values without adding them to dependencies
    if (!registrationRef.current || !registrationRef.current.isActive) {
      registrationRef.current = managerRef.current.register(
        hotkeyString,
        callbackRef.current,
        {
          ...optionsRef.current,
          target: resolvedTarget,
        },
      )
    }

    // Update tracking refs
    prevTargetRef.current = resolvedTarget
    prevHotkeyRef.current = hotkeyString

    // Cleanup on unmount
    return () => {
      if (registrationRef.current?.isActive) {
        registrationRef.current.unregister()
        registrationRef.current = null
      }
    }
  }, [resolvedTarget, hotkeyString])

  // Sync callback and options on EVERY render (outside useEffect)
  // This avoids stale closures - the callback always has access to latest state
  // Similar to TanStack Pacer's pattern: debouncer.fn = fn; debouncer.setOptions(options)
  if (registrationRef.current?.isActive) {
    registrationRef.current.callback = callback
    registrationRef.current.setOptions(optionsWithoutTarget)
  }
}

/**
 * Type guard to check if a value is a React ref-like object.
 */
function isRef(
  value: unknown,
): value is React.RefObject<HTMLElement | null> {
  return value !== null && typeof value === 'object' && 'current' in value
}
