import { createHotkeys } from './createHotkeys'
import { read } from './scope'
import type { HotkeysScope } from './scope'
import type { AlpineHotkeyCommonOptions, MaybeGetter } from './types'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

export function createHotkey(
  scope: HotkeysScope,
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  callback: HotkeyCallback,
  options: MaybeGetter<AlpineHotkeyCommonOptions> = {},
) {
  createHotkeys(scope, () => [
    { hotkey: read(hotkey), callback, options: read(options) } as never,
  ])
}
