import { useHotkeySequences } from './useHotkeySequences'
import { splitSlot, subSlot } from './internal'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
} from '@tanstack/hotkeys'
import type { HotkeySequenceDefinition } from '@tanstack/hotkeys/adapter'

/** Registers one multi-chord shortcut. Empty sequences do not register. */
export function useHotkeySequence(
  sequence: HotkeySequence,
  callback: HotkeyCallback,
  options?: SequenceOptions,
): void
export function useHotkeySequence(
  sequence: HotkeySequence,
  callback: HotkeyCallback,
  ...rest: [options?: SequenceOptions, slot?: symbol]
): void {
  const [args, slot] = splitSlot(rest)
  const register = useHotkeySequences as (
    definitions: Array<HotkeySequenceDefinition>,
    options: SequenceOptions | undefined,
    slot: symbol,
  ) => void
  register(
    [{ sequence, callback }],
    args[0] as SequenceOptions | undefined,
    subSlot(slot, 'sequence'),
  )
}
