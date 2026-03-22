import { useEffect, useRef } from 'preact/hooks'
import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
} from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { isRef } from './utils'
import type { UseHotkeyOptions } from './useHotkey'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * A single hotkey definition for use with `useHotkeys`.
 */
export interface UseHotkeyDefinition {
  /** The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object */
  hotkey: RegisterableHotkey
  /** The function to call when the hotkey is pressed */
  callback: HotkeyCallback
  /** Per-hotkey options (merged on top of commonOptions) */
  options?: UseHotkeyOptions
}

/**
 * Preact hook for registering multiple keyboard hotkeys at once.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * Accepts a dynamic array of hotkey definitions, making it safe to use
 * with variable-length lists without violating the rules of hooks.
 *
 * Options are merged in this order:
 * HotkeysProvider defaults < commonOptions < per-definition options
 *
 * Callbacks and options are synced on every render to avoid stale closures.
 *
 * @param hotkeys - Array of hotkey definitions to register
 * @param commonOptions - Shared options applied to all hotkeys (overridden by per-definition options)
 *
 * @example
 * ```tsx
 * function Editor() {
 *   useHotkeys([
 *     { hotkey: 'Mod+S', callback: () => save() },
 *     { hotkey: 'Mod+Z', callback: () => undo() },
 *     { hotkey: 'Escape', callback: () => close() },
 *   ])
 * }
 * ```
 *
 * @example
 * ```tsx
 * function MenuShortcuts({ items }) {
 *   // Dynamic hotkeys from data -- safe because it's a single hook call
 *   useHotkeys(
 *     items.map((item) => ({
 *       hotkey: item.shortcut,
 *       callback: item.action,
 *       options: { enabled: item.enabled },
 *     })),
 *     { preventDefault: true },
 *   )
 * }
 * ```
 */
export function useHotkeys(
  hotkeys: Array<UseHotkeyDefinition>,
  commonOptions: UseHotkeyOptions = {},
): void {
  const defaultOptions = useDefaultHotkeysOptions().hotkey
  const manager = getHotkeyManager()
  const platform =
    commonOptions.platform ?? defaultOptions?.platform ?? detectPlatform()

  const registrationsRef = useRef<Map<string, HotkeyRegistrationHandle>>(
    new Map(),
  )
  const hotkeysRef = useRef(hotkeys)
  const commonOptionsRef = useRef(commonOptions)
  const defaultOptionsRef = useRef(defaultOptions)
  const managerRef = useRef(manager)

  hotkeysRef.current = hotkeys
  commonOptionsRef.current = commonOptions
  defaultOptionsRef.current = defaultOptions
  managerRef.current = manager

  const hotkeyStrings = hotkeys.map((def) =>
    typeof def.hotkey === 'string'
      ? def.hotkey
      : (formatHotkey(rawHotkeyToParsedHotkey(def.hotkey, platform)) as Hotkey),
  )

  const hotkeyKey = hotkeyStrings.join('\0')
  const enabledKey = hotkeys
    .map((def) => {
      const merged = {
        ...defaultOptions,
        ...commonOptions,
        ...def.options,
      }
      return merged.enabled ?? true
    })
    .join('\0')

  useEffect(() => {
    const prevRegistrations = registrationsRef.current
    const nextRegistrations = new Map<string, HotkeyRegistrationHandle>()

    const rows: Array<{
      registrationKey: string
      def: (typeof hotkeysRef.current)[number]
      hotkeyStr: Hotkey
      mergedOptions: UseHotkeyOptions
      resolvedTarget: Document | HTMLElement | Window
    }> = []

    for (let i = 0; i < hotkeysRef.current.length; i++) {
      const def = hotkeysRef.current[i]!
      const hotkeyStr = hotkeyStrings[i]!
      const mergedOptions = {
        ...defaultOptionsRef.current,
        ...commonOptionsRef.current,
        ...def.options,
      } as UseHotkeyOptions

      const resolvedTarget = isRef(mergedOptions.target)
        ? mergedOptions.target.current
        : (mergedOptions.target ??
          (typeof document !== 'undefined' ? document : null))

      if (!resolvedTarget) {
        continue
      }

      const registrationKey = `${i}:${hotkeyStr}`
      rows.push({
        registrationKey,
        def,
        hotkeyStr,
        mergedOptions,
        resolvedTarget,
      })
    }

    const nextKeys = new Set(rows.map((r) => r.registrationKey))

    for (const [key, handle] of prevRegistrations) {
      if (!nextKeys.has(key) && handle.isActive) {
        handle.unregister()
      }
    }

    for (const row of rows) {
      const { registrationKey, def, hotkeyStr, mergedOptions, resolvedTarget } =
        row

      const existing = prevRegistrations.get(registrationKey)
      if (existing?.isActive) {
        nextRegistrations.set(registrationKey, existing)
        continue
      }

      const handle = managerRef.current.register(hotkeyStr, def.callback, {
        ...mergedOptions,
        target: resolvedTarget,
      })
      nextRegistrations.set(registrationKey, handle)
    }

    registrationsRef.current = nextRegistrations

    return () => {
      for (const handle of registrationsRef.current.values()) {
        if (handle.isActive) {
          handle.unregister()
        }
      }
      registrationsRef.current = new Map()
    }
  }, [hotkeyKey, enabledKey, hotkeyStrings])

  for (let i = 0; i < hotkeys.length; i++) {
    const def = hotkeys[i]!
    const hotkeyStr = hotkeyStrings[i]!
    const registrationKey = `${i}:${hotkeyStr}`
    const handle = registrationsRef.current.get(registrationKey)

    if (handle?.isActive) {
      handle.callback = def.callback
      const mergedOptions = {
        ...defaultOptions,
        ...commonOptions,
        ...def.options,
      } as UseHotkeyOptions
      const { target: _target, ...optionsWithoutTarget } = mergedOptions
      handle.setOptions(optionsWithoutTarget)
    }
  }
}
