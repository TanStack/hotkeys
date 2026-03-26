import { createEffect, onCleanup } from 'solid-js'
import {
  detectPlatform,
  getHotkeyManager,
  normalizeRegisterableHotkey,
} from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type { CreateHotkeyOptions } from './createHotkey'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * A single hotkey definition for use with `createHotkeys`.
 */
export interface CreateHotkeyDefinition {
  /** The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object */
  hotkey: RegisterableHotkey
  /** The function to call when the hotkey is pressed */
  callback: HotkeyCallback
  /** Per-hotkey options (merged on top of commonOptions) */
  options?: CreateHotkeyOptions
}

/**
 * SolidJS primitive for registering multiple keyboard hotkeys at once.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * Accepts a dynamic array of hotkey definitions, making it safe to use
 * with variable-length lists.
 *
 * Options are merged in this order:
 * HotkeysProvider defaults < commonOptions < per-definition options
 *
 * @param hotkeys - Array of hotkey definitions, or accessor returning them
 * @param commonOptions - Shared options applied to all hotkeys, or accessor
 *
 * @example
 * ```tsx
 * function Editor() {
 *   createHotkeys([
 *     { hotkey: 'Mod+S', callback: () => save() },
 *     { hotkey: 'Mod+Z', callback: () => undo() },
 *     { hotkey: 'Escape', callback: () => close() },
 *   ])
 * }
 * ```
 *
 * @example
 * ```tsx
 * function MenuShortcuts(props) {
 *   createHotkeys(
 *     () => props.items.map((item) => ({
 *       hotkey: item.shortcut,
 *       callback: item.action,
 *       options: { enabled: item.enabled },
 *     })),
 *     { preventDefault: true },
 *   )
 * }
 * ```
 */
export function createHotkeys(
  hotkeys:
    | Array<CreateHotkeyDefinition>
    | (() => Array<CreateHotkeyDefinition>),
  commonOptions: CreateHotkeyOptions | (() => CreateHotkeyOptions) = {},
): void {
  type RegistrationRecord = {
    handle: HotkeyRegistrationHandle
    target: Document | HTMLElement | Window
  }

  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getHotkeyManager()

  const registrations = new Map<string, RegistrationRecord>()

  // Clean up only when this component/scope disposes — not before every effect
  // re-run. An inner `onCleanup` inside `createEffect` runs whenever reactive
  // deps change (e.g. dynamic hotkey list), which unregistered every hotkey and
  // re-registered them, flooding the manager store and could freeze the tab.
  onCleanup(() => {
    for (const { handle } of registrations.values()) {
      if (handle.isActive) {
        handle.unregister()
      }
    }
    registrations.clear()
  })

  createEffect(() => {
    const resolvedHotkeys = typeof hotkeys === 'function' ? hotkeys() : hotkeys
    const resolvedCommonOptions =
      typeof commonOptions === 'function' ? commonOptions() : commonOptions

    const nextKeys = new Set<string>()
    const prepared: Array<{
      registrationKey: string
      def: CreateHotkeyDefinition
      mergedOptions: CreateHotkeyOptions
      hotkeyString: Hotkey
      resolvedTarget: Document | HTMLElement | Window
    }> = []

    for (let i = 0; i < resolvedHotkeys.length; i++) {
      const def = resolvedHotkeys[i]!
      const resolvedDefOptions = def.options ?? {}

      const mergedOptions = {
        ...defaultOptions.hotkey,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as CreateHotkeyOptions

      const platform = mergedOptions.platform ?? detectPlatform()
      const hotkeyString = normalizeRegisterableHotkey(def.hotkey, platform)

      const resolvedTarget =
        'target' in mergedOptions
          ? (mergedOptions.target ?? null)
          : typeof document !== 'undefined'
            ? document
            : null

      if (!resolvedTarget) {
        continue
      }

      const registrationKey = `${i}:${hotkeyString}`
      nextKeys.add(registrationKey)
      prepared.push({
        registrationKey,
        def,
        mergedOptions,
        hotkeyString,
        resolvedTarget,
      })
    }

    // Drop stale keys first so list index shifts don't briefly double-register
    // the same hotkey+target (conflictBehavior: 'warn' + devtools can loop).
    for (const [key, record] of [...registrations.entries()]) {
      if (!nextKeys.has(key)) {
        if (record.handle.isActive) {
          record.handle.unregister()
        }
        registrations.delete(key)
      }
    }

    for (const p of prepared) {
      const existing = registrations.get(p.registrationKey)
      if (existing?.handle.isActive && existing.target === p.resolvedTarget) {
        existing.handle.callback = p.def.callback
        const { target: _target, ...optionsWithoutTarget } = p.mergedOptions
        existing.handle.setOptions(optionsWithoutTarget)
        continue
      }

      if (existing) {
        if (existing.handle.isActive) {
          existing.handle.unregister()
        }
        registrations.delete(p.registrationKey)
      }

      const { target: _target, ...optionsWithoutTarget } = p.mergedOptions
      const handle = manager.register(p.hotkeyString, p.def.callback, {
        ...optionsWithoutTarget,
        target: p.resolvedTarget,
      })
      registrations.set(p.registrationKey, {
        handle,
        target: p.resolvedTarget,
      })
    }
  })
}
