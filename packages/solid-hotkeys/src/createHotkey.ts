import { createEffect, onCleanup } from "solid-js";
import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
  type Hotkey,
  type HotkeyCallback,
  type HotkeyOptions,
  type HotkeyRegistrationHandle,
  type RegisterableHotkey,
} from "@tanstack/hotkeys";
import { useDefaultHotkeysOptions } from "./HotkeysProvider";

export interface CreateHotkeyOptions extends Omit<HotkeyOptions, "target"> {
  /**
   * The DOM element to attach the event listener to.
   * Can be a direct DOM element, or null.
   * Defaults to document.
   */
  target?: HTMLElement | Document | Window | null;
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
 *   let editorRef: HTMLDivElement | undefined
 *
 *   // Scoped to a specific element
 *   createHotkey('Mod+S', () => {
 *     save()
 *   }, { target: editorRef })
 *
 *   return <div ref={editorRef}>...</div>
 * }
 * ```
 */
export function createHotkey(
  hotkey: RegisterableHotkey | (() => RegisterableHotkey),
  callback: HotkeyCallback,
  options: CreateHotkeyOptions | (() => CreateHotkeyOptions) = {}
): void {
  const defaultOptions = useDefaultHotkeysOptions();
  const manager = getHotkeyManager();

  let registration: HotkeyRegistrationHandle | null = null;

  createEffect(() => {
    // Resolve reactive values
    const resolvedHotkey =
      typeof hotkey === "function" ? hotkey() : hotkey;
    const resolvedOptions =
      typeof options === "function" ? options() : options;

    const mergedOptions = {
      ...defaultOptions.hotkey,
      ...resolvedOptions,
    } as CreateHotkeyOptions;

    // Normalize to hotkey string
    const platform = mergedOptions.platform ?? detectPlatform();
    const hotkeyString: Hotkey =
      typeof resolvedHotkey === "string"
        ? resolvedHotkey
        : (formatHotkey(
            rawHotkeyToParsedHotkey(resolvedHotkey, platform)
          ) as Hotkey);

    // Resolve target (defaults to document)
    const resolvedTarget =
      mergedOptions.target ??
      (typeof document !== "undefined" ? document : null);

    // Skip if no valid target (SSR)
    if (!resolvedTarget) {
      return;
    }

    // Unregister previous registration if it exists
    if (registration?.isActive) {
      registration.unregister();
      registration = null;
    }

    // Extract options without target (target is handled separately)
    const { target: _target, ...optionsWithoutTarget } = mergedOptions;

    // Register the hotkey
    registration = manager.register(hotkeyString, callback, {
      ...optionsWithoutTarget,
      target: resolvedTarget,
    });

    // Update callback and options on every effect run
    if (registration?.isActive) {
      registration.callback = callback;
      registration.setOptions(optionsWithoutTarget);
    }

    // Cleanup on disposal
    onCleanup(() => {
      if (registration?.isActive) {
        registration.unregister();
        registration = null;
      }
    });
  });
}
