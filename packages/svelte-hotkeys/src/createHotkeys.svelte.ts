import {
  detectPlatform,
  getHotkeyManager,
  normalizeRegisterableHotkey,
} from '@tanstack/hotkeys'
import { onDestroy } from 'svelte'
import { SvelteMap, SvelteSet } from 'svelte/reactivity'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { resolveMaybeGetter } from './internal.svelte'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { CreateHotkeyOptions } from './createHotkey.svelte'
import type { MaybeGetter } from './internal.svelte'
import type { Attachment } from 'svelte/attachments'

/**
 * A single hotkey definition for use with `createHotkeys`.
 */
export interface CreateHotkeyDefinition {
  /** The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object */
  hotkey: MaybeGetter<RegisterableHotkey>
  /** The function to call when the hotkey is pressed */
  callback: HotkeyCallback
  /** Per-hotkey options (merged on top of commonOptions) */
  options?: MaybeGetter<CreateHotkeyOptions>
}

type RegistrationRecord = {
  handle: HotkeyRegistrationHandle
  target: Document | HTMLElement | Window
}

function cleanupRegistrations(
  registrations:
    | Map<string, RegistrationRecord>
    | SvelteMap<string, RegistrationRecord>,
) {
  for (const { handle } of registrations.values()) {
    if (handle.isActive) {
      handle.unregister()
    }
  }
  registrations.clear()
}

/**
 * Register multiple global hotkeys for the current component.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeys } from '@tanstack/svelte-hotkeys'
 *
 *   createHotkeys([
 *     { hotkey: 'Mod+S', callback: () => save() },
 *     { hotkey: 'Mod+Z', callback: () => undo() },
 *     { hotkey: 'Escape', callback: () => close() },
 *   ])
 * </script>
 * ```
 */
export function createHotkeys(
  hotkeys: MaybeGetter<Array<CreateHotkeyDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeyOptions> = {},
): void {
  const registrations = new SvelteMap<string, RegistrationRecord>()

  onDestroy(() => {
    cleanupRegistrations(registrations)
  })

  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const resolvedHotkeys = resolveMaybeGetter(hotkeys)
    const resolvedCommonOptions = resolveMaybeGetter(commonOptions)
    const nextKeys = new SvelteSet<string>()
    const prepared: Array<{
      registrationKey: string
      def: CreateHotkeyDefinition
      mergedOptions: CreateHotkeyOptions
      hotkeyString: Hotkey
      resolvedTarget: Document | HTMLElement | Window
    }> = []

    for (let i = 0; i < resolvedHotkeys.length; i++) {
      const def = resolvedHotkeys[i]!
      const resolvedHotkey = resolveMaybeGetter(def.hotkey)
      const resolvedDefOptions = def.options
        ? resolveMaybeGetter(def.options)
        : {}

      const mergedOptions = {
        ...getDefaultHotkeysOptions().hotkey,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as CreateHotkeyOptions

      const resolvedTarget =
        mergedOptions.target ??
        (typeof document !== 'undefined' ? document : null)

      if (!resolvedTarget) {
        continue
      }

      const hotkeyString = normalizeRegisterableHotkey(
        resolvedHotkey,
        mergedOptions.platform ?? detectPlatform(),
      )
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
      const { target: _target, ...optionsWithoutTarget } = p.mergedOptions

      if (existing?.handle.isActive && existing.target === p.resolvedTarget) {
        existing.handle.callback = p.def.callback
        existing.handle.setOptions(optionsWithoutTarget)
        continue
      }

      if (existing?.handle.isActive) {
        existing.handle.unregister()
      }
      if (existing) {
        registrations.delete(p.registrationKey)
      }

      const handle = getHotkeyManager().register(
        p.hotkeyString,
        p.def.callback,
        {
          ...optionsWithoutTarget,
          target: p.resolvedTarget,
        },
      )
      registrations.set(p.registrationKey, {
        handle,
        target: p.resolvedTarget,
      })
    }
  })
}

/**
 * Create an attachment for element-scoped multi-hotkey registration.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeysAttachment } from '@tanstack/svelte-hotkeys'
 *
 *   const editorKeys = createHotkeysAttachment([
 *     { hotkey: 'Mod+S', callback: () => save() },
 *     { hotkey: 'Mod+Z', callback: () => undo() },
 *   ])
 * </script>
 *
 * <div tabindex="0" {@attach editorKeys}>
 *   Editor content
 * </div>
 * ```
 */
export function createHotkeysAttachment(
  hotkeys: MaybeGetter<Array<CreateHotkeyDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeyOptions> = {},
): Attachment<HTMLElement> {
  return (element) => {
    const registrations = new SvelteMap<string, RegistrationRecord>()

    $effect(() => {
      const resolvedHotkeys = resolveMaybeGetter(hotkeys)
      const resolvedCommonOptions = resolveMaybeGetter(commonOptions)
      const nextKeys = new SvelteSet<string>()
      const prepared: Array<{
        registrationKey: string
        def: CreateHotkeyDefinition
        mergedOptions: CreateHotkeyOptions
        hotkeyString: Hotkey
      }> = []

      for (let i = 0; i < resolvedHotkeys.length; i++) {
        const def = resolvedHotkeys[i]!
        const resolvedHotkey = resolveMaybeGetter(def.hotkey)
        const resolvedDefOptions = def.options
          ? resolveMaybeGetter(def.options)
          : {}

        const mergedOptions = {
          ...getDefaultHotkeysOptions().hotkey,
          ...resolvedCommonOptions,
          ...resolvedDefOptions,
        } as CreateHotkeyOptions

        const hotkeyString = normalizeRegisterableHotkey(
          resolvedHotkey,
          mergedOptions.platform ?? detectPlatform(),
        )
        const registrationKey = `${i}:${hotkeyString}`
        nextKeys.add(registrationKey)
        prepared.push({
          registrationKey,
          def,
          mergedOptions,
          hotkeyString,
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
        const { target: _target, ...optionsWithoutTarget } = p.mergedOptions

        if (existing?.handle.isActive) {
          existing.handle.callback = p.def.callback
          existing.handle.setOptions(optionsWithoutTarget)
          continue
        }

        if (existing?.handle.isActive) {
          existing.handle.unregister()
        }
        if (existing) {
          registrations.delete(p.registrationKey)
        }

        const handle = getHotkeyManager().register(
          p.hotkeyString,
          p.def.callback,
          {
            ...optionsWithoutTarget,
            target: element,
          },
        )
        registrations.set(p.registrationKey, { handle, target: element })
      }
    })

    return () => {
      cleanupRegistrations(registrations)
    }
  }
}
