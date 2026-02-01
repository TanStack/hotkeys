import { useEffect, useRef } from 'react'
import { getHotkeyManager } from '@tanstack/keys'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  ParsedHotkey,
} from '@tanstack/keys'

export interface UseHotkeyOptions extends Omit<HotkeyOptions, 'enabled'> {
  /** Whether the hotkey is enabled. Defaults to true. */
  enabled?: boolean
}

/**
 * React hook for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * @param hotkey - The hotkey string (e.g., 'Mod+S', 'Escape')
 * @param callback - The function to call when the hotkey is pressed
 * @param options - Options for the hotkey behavior
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   useHotkey('Mod+S', (event, { hotkey, parsedHotkey }) => {
 *     console.log(`${hotkey} was pressed`)
 *     handleSave()
 *   }, { preventDefault: true })
 *
 *   return <button>Save</button>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   // Only active when modal is open
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
 *   // Prevent repeated triggering while holding
 *   useHotkey('Mod+S', () => {
 *     save()
 *   }, { preventDefault: true, requireReset: true })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useHotkey(
  hotkey: Hotkey | ParsedHotkey,
  callback: HotkeyCallback,
  options: UseHotkeyOptions = {},
): void {
  const { enabled = true, ...hotkeyOptions } = options

  // Extract options for stable dependencies
  const {
    preventDefault,
    stopPropagation,
    platform,
    eventType,
    requireReset,
  } = hotkeyOptions

  // Use refs to keep callback and hotkey stable across renders
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const hotkeyRef = useRef(hotkey)
  hotkeyRef.current = hotkey

  // Serialize hotkey for dependency comparison
  const hotkeyKey =
    typeof hotkey === 'string' ? hotkey : JSON.stringify(hotkey)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const hotkeyValue = hotkeyRef.current
    const hotkeyString: Hotkey =
      typeof hotkeyValue === 'string'
        ? hotkeyValue
        : formatParsedHotkey(hotkeyValue)

    const manager = getHotkeyManager()

    // Build options object, only including defined values to avoid
    // overwriting manager defaults with undefined
    const registerOptions: HotkeyOptions = { enabled: true }
    if (preventDefault !== undefined)
      registerOptions.preventDefault = preventDefault
    if (stopPropagation !== undefined)
      registerOptions.stopPropagation = stopPropagation
    if (platform !== undefined) registerOptions.platform = platform
    if (eventType !== undefined) registerOptions.eventType = eventType
    if (requireReset !== undefined) registerOptions.requireReset = requireReset

    const unregister = manager.register(
      hotkeyString,
      (event, context) => callbackRef.current(event, context),
      registerOptions,
    )

    return unregister
  }, [
    enabled,
    preventDefault,
    stopPropagation,
    platform,
    eventType,
    requireReset,
    hotkeyKey,
  ])
}

/**
 * Formats a ParsedHotkey back to a hotkey string.
 */
function formatParsedHotkey(parsed: ParsedHotkey): Hotkey {
  const parts: Array<string> = []

  if (parsed.ctrl) parts.push('Control')
  if (parsed.alt) parts.push('Alt')
  if (parsed.shift) parts.push('Shift')
  if (parsed.meta) parts.push('Meta')
  parts.push(parsed.key)

  return parts.join('+') as Hotkey
}
