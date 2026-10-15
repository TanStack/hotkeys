import { useHotkeys } from './useHotkeys'
import { splitSlot, subSlot } from './internal'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
  Target,
} from '@tanstack/hotkeys'
import type {
  AdapterAppHotkeyOptions,
  AdapterChordOptions,
  AdapterCommonOptions,
  AdapterHotkeyOptions,
  AdapterOptionsFor,
  AdapterSequenceOptions,
} from '@tanstack/hotkeys/adapter'
import type { UseHotkeyDefinition } from './useHotkeys'

/** The element to listen on. A `null` target skips registration until it is set. */
export type UseHotkeyTarget = Target | null

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

/** Call-site options for an app hotkey, typed by its declared default kind. */
export type UseAppHotkeyOptions<T extends AppHotkey = AppHotkey> =
  AdapterAppHotkeyOptions<T, UseHotkeyTarget>

/**
 * Registers one hotkey: a chord such as `'Mod+S'`, a sequence such as
 * `['G', 'G']`, or an app hotkey from `defineAppHotkeys`. The callback and
 * options are refreshed after every commit.
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
  ...rest: [options?: UseHotkeyCommonOptions, slot?: symbol]
): void {
  const [args, slot] = splitSlot(rest)
  const register = useHotkeys as (
    definitions: ReadonlyArray<UseHotkeyDefinition>,
    options: undefined,
    slot: symbol,
  ) => void
  register(
    [
      {
        hotkey,
        callback,
        options: args[0] as UseHotkeyCommonOptions | undefined,
      } as UseHotkeyDefinition,
    ],
    undefined,
    subSlot(slot, 'hotkey'),
  )
}
