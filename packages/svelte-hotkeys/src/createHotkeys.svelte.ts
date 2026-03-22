import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
} from '@tanstack/hotkeys'
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

function normalizeHotkey(
  hotkey: RegisterableHotkey,
  options: CreateHotkeyOptions,
): Hotkey {
  const platform = options.platform ?? detectPlatform()
  return typeof hotkey === 'string'
    ? hotkey
    : (formatHotkey(rawHotkeyToParsedHotkey(hotkey, platform)) as Hotkey)
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
  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const resolvedHotkeys = resolveMaybeGetter(hotkeys)
    const resolvedCommonOptions = resolveMaybeGetter(commonOptions)
    const handles: Array<HotkeyRegistrationHandle> = []

    for (const def of resolvedHotkeys) {
      const resolvedHotkey = resolveMaybeGetter(def.hotkey)
      const resolvedDefOptions = def.options
        ? resolveMaybeGetter(def.options)
        : {}

      const mergedOptions = {
        ...getDefaultHotkeysOptions().hotkey,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as CreateHotkeyOptions

      const handle = getHotkeyManager().register(
        normalizeHotkey(resolvedHotkey, mergedOptions),
        def.callback,
        {
          ...mergedOptions,
          target: document,
        },
      )
      handles.push(handle)
    }

    return () => {
      for (const handle of handles) {
        handle.unregister()
      }
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
    const resolvedHotkeys = resolveMaybeGetter(hotkeys)
    const resolvedCommonOptions = resolveMaybeGetter(commonOptions)
    const handles: Array<HotkeyRegistrationHandle> = []

    for (const def of resolvedHotkeys) {
      const resolvedHotkey = resolveMaybeGetter(def.hotkey)
      const resolvedDefOptions = def.options
        ? resolveMaybeGetter(def.options)
        : {}

      const mergedOptions = {
        ...getDefaultHotkeysOptions().hotkey,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as CreateHotkeyOptions

      const handle = getHotkeyManager().register(
        normalizeHotkey(resolvedHotkey, mergedOptions),
        def.callback,
        {
          ...mergedOptions,
          target: element,
        },
      )
      handles.push(handle)
    }

    return () => {
      for (const handle of handles) {
        handle.unregister()
      }
    }
  }
}
