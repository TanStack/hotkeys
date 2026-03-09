import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
} from '@tanstack/hotkeys'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import type { ResolvedTarget, Target } from './HotkeysCtx'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

export interface CreateHotkeyOptions extends Omit<HotkeyOptions, 'target'> {
  /**
   * The DOM element to attach the event listener to.
   * Can be a Svelte ref, direct DOM element, or null.
   * Defaults to document.
   */
  target?: Target
}

function resolveTarget(target: Target): ResolvedTarget {
  if (typeof target === 'function') {
    return target() ?? null
  }

  return target
}

/**
 * Svelte function for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * This function syncs the callback and options on every render to avoid
 * stale closures. This means
 * callbacks that reference Svelte state will always have access to
 * the latest values.
 *
 * @example
 * ```svelte
 *
 * <script lang="ts">
 *   import { createHotkey } from '@tanstack/svelte-hotkeys'
 *
 *   let ref = $state<HTMLButtonElement | null>(null)
 *
 *   createHotkey('Mod+S', () => {
 *     console.log('Mod+S pressed')
 *   }, { target: ref })
 * </script>
 *
 * <div bind:this={ref}>
 *   ....
 * </div>
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkey } from '@tanstack/svelte-hotkeys'
 *
 *   let ref = $state<HTMLDivElement | null>(null)
 *   let count = $state(0)
 *
 *   createHotkey('Mod+S', () => {
 *     console.log('Mod+S pressed')
 *     count++
 *   }, { target: ref })
 * </script>
 *
 * <div bind:this={ref}>
 *   Count: {count}
 * </div>
 * ```
 */

export function createHotkey(
  hotkey: RegisterableHotkey | (() => RegisterableHotkey),
  callback: HotkeyCallback,
  options: CreateHotkeyOptions | (() => CreateHotkeyOptions) = {},
): void {
  const manager = getHotkeyManager()

  // Stable ref for registration handle
  let registrationRef: HotkeyRegistrationHandle | null = null

  // Refs to capture current values for use in effect without adding dependencies
  let callbackRef = callback
  let managerRef = manager

  $effect(() => {
    callbackRef = callback
    managerRef = manager
  })

  // Track previous target and hotkey to detect changes requiring re-registration
  let prevTargetRef: ResolvedTarget = null
  let prevHotkeyRef: string | null = null

  $effect(() => {
    // Resolve reactive values (support getters for dynamic shortcuts)
    const resolvedHotkey = typeof hotkey === 'function' ? hotkey() : hotkey
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...getDefaultHotkeysOptions().hotkey,
      ...resolvedOptions,
    } as CreateHotkeyOptions

    // Normalize to hotkey string
    const platform = mergedOptions.platform ?? detectPlatform()
    const hotkeyString: Hotkey =
      typeof resolvedHotkey === 'string'
        ? resolvedHotkey
        : (formatHotkey(
            rawHotkeyToParsedHotkey(resolvedHotkey, platform),
          ) as Hotkey)

    // Resolve target inside the effect so refs are already attached after mount
    const resolvedTarget = mergedOptions.target
      ? resolveTarget(mergedOptions.target)
      : typeof document !== 'undefined'
        ? document
        : null

    // Skip if no valid target (SSR or ref still null)
    if (!resolvedTarget) {
      return
    }

    // Extract options without target (target is handled separately)
    const { target: _target, ...optionsWithoutTarget } = mergedOptions

    // Check if we need to re-register (target or hotkey changed)
    const targetChanged =
      prevTargetRef !== null && prevTargetRef !== resolvedTarget
    const hotkeyChanged =
      prevHotkeyRef !== null && prevHotkeyRef !== hotkeyString

    // If we have an active registration and target/hotkey changed, unregister first
    if (registrationRef?.isActive && (targetChanged || hotkeyChanged)) {
      registrationRef.unregister()
      registrationRef = null
    }

    // Register if needed (no active registration)
    if (!registrationRef || !registrationRef.isActive) {
      registrationRef = managerRef.register(hotkeyString, callbackRef, {
        ...optionsWithoutTarget,
        target: resolvedTarget,
      })
    }

    // Update callback and options
    if (registrationRef.isActive) {
      registrationRef.callback = callbackRef
      registrationRef.setOptions(optionsWithoutTarget)
    }

    // Update tracking refs
    prevTargetRef = resolvedTarget
    prevHotkeyRef = hotkeyString

    // Cleanup on unmount
    return () => {
      if (registrationRef?.isActive) {
        registrationRef.unregister()
        registrationRef = null
      }
    }
  })
}
