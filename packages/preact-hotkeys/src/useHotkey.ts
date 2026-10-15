import { useHotkeys } from './useHotkeys'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type {
  AdapterAppHotkeyOptions,
  AdapterChordOptions,
  AdapterCommonOptions,
  AdapterHotkeyOptions,
  AdapterOptionsFor,
  AdapterSequenceOptions,
} from '@tanstack/hotkeys/adapter'

import type { RefObject } from 'preact'

/** A Preact ref, element, document, or window to listen on. */
export type UseHotkeyTarget =
  RefObject<HTMLElement | null> | HTMLElement | Document | Window | null

/** Options shared by chords and sequences. */
export type UseHotkeyOptions = AdapterHotkeyOptions<UseHotkeyTarget>

/** Options for a chord such as `'Mod+S'`. */
export type UseHotkeyChordOptions = AdapterChordOptions<UseHotkeyTarget>

/** Options for a sequence such as `['G', 'G']`. */
export type UseHotkeySequenceOptions = AdapterSequenceOptions<UseHotkeyTarget>

/** Options applied to every hotkey, such as provider defaults. Each applies to the kinds that support it. */
export type UseHotkeyCommonOptions = AdapterCommonOptions<UseHotkeyTarget>

/** The options type for a hotkey: chord options for chords, sequence options for sequences. */
export type UseHotkeyOptionsFor<T extends RegisterableHotkey> =
  AdapterOptionsFor<T, UseHotkeyTarget>

/**
 * Options for an app hotkey at the call site. `meta` comes from the declaration.
 * Kind-specific options follow the declared default: `requireReset` for a chord,
 * `timeout` for a sequence, both for an app hotkey without a default. If the
 * user rebinds it to the other kind, options for the old kind no longer apply.
 */
export type UseAppHotkeyOptions<T extends AppHotkey = AppHotkey> =
  AdapterAppHotkeyOptions<T, UseHotkeyTarget>

/**
 * Preact hook for registering a hotkey: a chord such as `'Mod+S'`, a sequence
 * such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
 *
 * Uses the singleton HotkeyManager for efficient event handling. The callback
 * and options sync on every render, so callbacks that reference Preact state
 * always see the latest values. `enabled: false` keeps the registration
 * (visible in devtools) and only suppresses firing.
 *
 * Chords accept `requireReset`; sequences accept `timeout`. A one-step
 * sequence registers as its chord. An app hotkey uses its effective hotkey
 * from `HotkeysProvider` (including the user's custom hotkey) and its declared
 * meta and options, and registers nothing while unbound.
 *
 * Options merge in this order: provider defaults, app hotkey declaration,
 * call-site options.
 *
 * @param hotkey - A chord string, RawHotkey object, sequence, or app hotkey
 * @param callback - The function to call when the hotkey is pressed
 * @param options - Options for the hotkey behavior
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const [count, setCount] = useState(0)
 *
 *   useHotkey('Mod+S', () => save(count))
 *   useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
 *   useHotkey('Escape', () => close(), { enabled: isOpen })
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Toolbar() {
 *   const hotkeys = useAppHotkeys()
 *   useHotkey(hotkeys['doc.save'], () => save())
 * }
 * ```
 */
export function useHotkey<T extends AppHotkey>(
  hotkey: T,
  callback: HotkeyCallback,
  options?: UseAppHotkeyOptions<T>,
): void
export function useHotkey<T extends RegisterableHotkey>(
  hotkey: T,
  callback: HotkeyCallback,
  options?: UseHotkeyOptionsFor<T>,
): void
export function useHotkey(
  hotkey: RegisterableHotkey | AppHotkey,
  callback: HotkeyCallback,
  options?: UseHotkeyCommonOptions,
): void {
  useHotkeys([{ hotkey, callback, options } as never])
}
