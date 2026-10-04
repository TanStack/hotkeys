import { useHotkeys } from './useHotkeys'
import { splitSlot, subSlot } from './internal'
import type {
  HotkeyCallback,
  HotkeyOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { HotkeyDefinition } from '@tanstack/hotkeys/adapter'

/** Registers one shortcut. Callback and options are refreshed after every commit. */
export function useHotkey(
  hotkey: RegisterableHotkey,
  callback: HotkeyCallback,
  options?: HotkeyOptions,
): void
export function useHotkey(
  hotkey: RegisterableHotkey,
  callback: HotkeyCallback,
  ...rest: [options?: HotkeyOptions, slot?: symbol]
): void {
  const [args, slot] = splitSlot(rest)
  const register = useHotkeys as (
    definitions: Array<HotkeyDefinition>,
    options: HotkeyOptions | undefined,
    slot: symbol,
  ) => void
  register(
    [{ hotkey, callback }],
    args[0] as HotkeyOptions | undefined,
    subSlot(slot, 'hotkey'),
  )
}
