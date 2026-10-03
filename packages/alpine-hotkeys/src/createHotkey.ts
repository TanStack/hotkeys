import { createHotkeys } from './createHotkeys'
import { read } from './scope'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'
import type {
  HotkeyCallback,
  HotkeyOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

export function createHotkey(
  scope: HotkeysScope,
  hotkey: MaybeGetter<RegisterableHotkey>,
  callback: HotkeyCallback,
  options: MaybeGetter<HotkeyOptions> = {},
) {
  createHotkeys(scope, () => [{ hotkey: read(hotkey), callback }], options)
}
