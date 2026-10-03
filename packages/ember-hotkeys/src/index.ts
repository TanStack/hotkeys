export * from '@tanstack/hotkeys'
export type {
  HotkeyDefinition,
  HotkeySequenceDefinition,
} from '@tanstack/hotkeys/adapter'
export { UseHotkey as useHotkey } from './useHotkey'
export { UseHotkeys as useHotkeys } from './useHotkeys'
export { UseHotkeySequence as useHotkeySequence } from './useHotkeySequence'
export { UseHotkeySequences as useHotkeySequences } from './useHotkeySequences'

export type { MaybeGetter } from './utils'
export * from './useHeldKeys'
export * from './useHeldKeyCodes'
export * from './useKeyHold'
export * from './useHotkeyHint'
export * from './useHotkeyRegistrations'
export * from './useHotkeyRecorder'
export * from './useHotkeySequenceRecorder'

export * from './types'
export * from './createHotkeysScope'

export { OnHotkey as onHotkey } from './onHotkey'
export { OnHotkeys as onHotkeys } from './onHotkeys'
export type { ElementHotkeyOptions } from './onHotkeys'
