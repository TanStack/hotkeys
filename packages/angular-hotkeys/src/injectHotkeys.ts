import { DestroyRef, effect, inject } from '@angular/core'
import {
  detectPlatform,
  getHotkeyManager,
  normalizeRegisterableHotkey,
} from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type { InjectHotkeyOptions } from './injectHotkey'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * A single hotkey definition for use with `injectHotkeys`.
 */
export interface InjectHotkeyDefinition {
  /** The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object */
  hotkey: RegisterableHotkey | (() => RegisterableHotkey)
  /** The function to call when the hotkey is pressed */
  callback: HotkeyCallback
  /** Per-hotkey options (merged on top of commonOptions) */
  options?: InjectHotkeyOptions | (() => InjectHotkeyOptions)
}

/**
 * Angular inject-based API for registering multiple keyboard hotkeys at once.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * Accepts a dynamic array of hotkey definitions.
 *
 * Call in an injection context (e.g. constructor or field initializer).
 * Uses effect() to track reactive dependencies and update registrations
 * when options or the callback change.
 *
 * Options are merged in this order:
 * provideHotkeys defaults < commonOptions < per-definition options
 *
 * @param hotkeys - Array of hotkey definitions, or getter returning them
 * @param commonOptions - Shared options for all hotkeys, or getter
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class EditorComponent {
 *   constructor() {
 *     injectHotkeys([
 *       { hotkey: 'Mod+S', callback: () => this.save() },
 *       { hotkey: 'Mod+Z', callback: () => this.undo() },
 *       { hotkey: 'Escape', callback: () => this.close() },
 *     ])
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class DynamicShortcuts {
 *   shortcuts = signal([...])
 *
 *   constructor() {
 *     injectHotkeys(
 *       () => this.shortcuts().map((s) => ({
 *         hotkey: s.key,
 *         callback: s.action,
 *       })),
 *     )
 *   }
 * }
 * ```
 */
export function injectHotkeys(
  hotkeys:
    | Array<InjectHotkeyDefinition>
    | (() => Array<InjectHotkeyDefinition>),
  commonOptions: InjectHotkeyOptions | (() => InjectHotkeyOptions) = {},
): void {
  type RegistrationRecord = {
    handle: HotkeyRegistrationHandle
    target: Document | HTMLElement | Window
  }

  const defaultOptions = injectDefaultHotkeysOptions()
  const manager = getHotkeyManager()
  const destroyRef = inject(DestroyRef)

  const registrations = new Map<string, RegistrationRecord>()

  destroyRef.onDestroy(() => {
    for (const { handle } of registrations.values()) {
      if (handle.isActive) {
        handle.unregister()
      }
    }
    registrations.clear()
  })

  effect(() => {
    const resolvedHotkeys = typeof hotkeys === 'function' ? hotkeys() : hotkeys
    const resolvedCommonOptions =
      typeof commonOptions === 'function' ? commonOptions() : commonOptions

    const nextKeys = new Set<string>()
    const prepared: Array<{
      registrationKey: string
      def: InjectHotkeyDefinition
      mergedOptions: InjectHotkeyOptions
      hotkeyString: Hotkey
      resolvedTarget: Document | HTMLElement | Window
    }> = []

    for (let i = 0; i < resolvedHotkeys.length; i++) {
      const def = resolvedHotkeys[i]!
      const resolvedHotkey =
        typeof def.hotkey === 'function' ? def.hotkey() : def.hotkey
      const resolvedDefOptions =
        typeof def.options === 'function' ? def.options() : (def.options ?? {})

      const mergedOptions = {
        ...defaultOptions.hotkey,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as InjectHotkeyOptions

      const platform = mergedOptions.platform ?? detectPlatform()
      const hotkeyString = normalizeRegisterableHotkey(resolvedHotkey, platform)

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
