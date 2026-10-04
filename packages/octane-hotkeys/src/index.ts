export * from '@tanstack/hotkeys'
export type {
  HotkeyDefinition,
  HotkeySequenceDefinition,
} from '@tanstack/hotkeys/adapter'

export {
  HotkeysProvider,
  useHotkeysContext,
  useDefaultHotkeysOptions,
} from './HotkeysProvider'
export type {
  DefaultHotkeysOptions,
  HotkeysProviderOptions,
  HotkeysProviderProps,
} from './HotkeysProvider'
export * from './useHotkeys'
export * from './useHotkey'
export * from './useHotkeySequences'
export * from './useHotkeySequence'
export * from './useHeldKeys'
export * from './useHeldKeyCodes'
export * from './useKeyHold'
export * from './useHotkeyHint'
export * from './useHotkeyRegistrations'
export * from './useHotkeyRecorder'
export * from './useHotkeySequenceRecorder'

export * from './types'
