import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { createHotkeys } from './createHotkeys'
import type {
  AppHotkey,
  HotkeyCallback,
  MaybeGetter,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { AlpineHotkeyCommonOptions } from './types'

export function createHotkey(
  scope: HotkeysScope,
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  callback: HotkeyCallback,
  options: MaybeGetter<AlpineHotkeyCommonOptions> = {},
) {
  createHotkeys(scope, () => [
    {
      hotkey: resolveMaybeGetter(hotkey),
      callback,
      options: resolveMaybeGetter(options),
    } as never,
  ])
}
