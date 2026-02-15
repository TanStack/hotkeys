import { createEffect, onCleanup } from 'solid-js'
import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
} from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
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
   * Can be a direct DOM element, an accessor (for reactive targets that become
   * available after mount), or null. Defaults to document.
   * When using scoped targets, pass an accessor: () => ({ target: elementSignal() })
   * so the hotkey waits for the element to be attached before registering.
   */
  target?: HTMLElement | Document | Window | null
}

/**
 * SolidJS primitive for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * This primitive automatically tracks reactive dependencies and updates
 * the registration when options or the callback change.
 *
 * @param hotkey - The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object (supports `mod` for cross-platform)
 * @param callback - The function to call when the hotkey is pressed
 * @param options - Options for the hotkey behavior
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const [count, setCount] = createSignal(0)
 *
 *   // Callback always has access to latest count value
 *   createHotkey('Mod+S', (event, { hotkey }) => {
 *     console.log(`Save triggered, count is ${count()}`)
 *     handleSave()
 *   })
 *
 *   return <button onClick={() => setCount(c => c + 1)}>Count: {count()}</button>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Modal(props) {
 *   // enabled option is reactive
 *   createHotkey('Escape', () => {
 *     props.onClose()
 *   }, () => ({ enabled: props.isOpen }))
 *
 *   return <Show when={props.isOpen}>
 *     <div class="modal">...</div>
 *   </Show>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const [editorRef, setEditorRef] = createSignal<HTMLDivElement | null>(null)
 *
 *   // Scoped to a specific element - use accessor so hotkey waits for ref
 *   createHotkey('Mod+S', save, () => ({ target: editorRef() }))
 *
 *   return <div ref={setEditorRef}>...</div>
 * }
 * ```
 */
export function createHotkey(
  hotkey: RegisterableHotkey | (() => RegisterableHotkey),
  callback: HotkeyCallback,
  options: CreateHotkeyOptions | (() => CreateHotkeyOptions) = {},
): void {
  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getHotkeyManager()

  let registration: HotkeyRegistrationHandle | null = null

  createEffect(() => {
    // Resolve reactive values
    const resolvedHotkey = typeof hotkey === 'function' ? hotkey() : hotkey
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...defaultOptions.hotkey,
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

    // Resolve target: when explicitly provided (even as null), use it and skip if null.
    // When not provided, default to document. Matches React's ref handling.
    const resolvedTarget =
      'target' in mergedOptions
        ? (mergedOptions.target ?? null)
        : typeof document !== 'undefined'
          ? document
          : null

    if (!resolvedTarget) {
      return
    }

    // Unregister previous registration if it exists
    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }

    // Extract options without target (target is handled separately)
    const { target: _target, ...optionsWithoutTarget } = mergedOptions

    // Register the hotkey
    registration = manager.register(hotkeyString, callback, {
      ...optionsWithoutTarget,
      target: resolvedTarget,
    })

    // Update callback and options on every effect run
    if (registration.isActive) {
      registration.callback = callback
      registration.setOptions(optionsWithoutTarget)
    }

    // Cleanup on disposal
    onCleanup(() => {
      if (registration?.isActive) {
        registration.unregister()
        registration = null
      }
    })
  })
}
