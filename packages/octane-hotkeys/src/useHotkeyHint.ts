import { getHotkeyManager, getKeyStateTracker } from '@tanstack/hotkeys'
import { isHotkeyHintVisible } from '@tanstack/hotkeys/adapter'
import { useHotkeysContext } from './HotkeysProvider'
import { select, splitSlot, subSlot, useAppHotkeysStore } from './internal'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Reports whether held modifiers reveal a shortcut hint. The hint shows only
 * while the hotkey can fire: some registration of it is enabled and in an
 * active scope. A sequence reveals its hint from its first step, and an app
 * hotkey matches its registrations by id and uses its effective hotkey (false
 * while unbound). No hotkey (`undefined`, `null`, or `''`) returns false. A
 * hotkey on an element counts only while focus is inside it.
 */
export function useHotkeyHint(
  hotkey: RegisterableHotkey | AppHotkey | null | undefined,
  options?: HeldModifierOptions,
): boolean
export function useHotkeyHint(
  hotkey: RegisterableHotkey | AppHotkey | null | undefined,
  ...rest: [options?: HeldModifierOptions, slot?: symbol]
): boolean {
  const [args, slot] = splitSlot(rest)
  const store = useAppHotkeysStore(
    useHotkeysContext()?.appHotkeysStore ?? null,
    subSlot(slot, 'app-hotkeys'),
  )
  const manager = getHotkeyManager()
  // Both selections are booleans, so a registration or held key change
  // re-renders only when the hint flips.
  const active = select(
    manager.registrations,
    () => manager.hasActiveRegistration(hotkey),
    subSlot(slot, 'hint-active'),
  )
  const visible = select(
    getKeyStateTracker().store,
    (state) =>
      isHotkeyHintVisible(
        hotkey,
        state.heldKeys,
        args[0] as HeldModifierOptions | undefined,
        store,
      ),
    subSlot(slot, 'hint'),
  )
  return active && visible
}
