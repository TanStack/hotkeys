// Re-export everything from the core package
export * from '@tanstack/hotkeys'

export * from './createHotkey.svelte'
export * from './createHotkeys.svelte'
export * from './createHotkeySequence.svelte'
export * from './createHotkeyRecorder.svelte'
export * from './createHotkeySequenceRecorder.svelte'
export * from './getHeldKeys.svelte'
export * from './getHeldKeyCodesMap.svelte'
export * from './getIsKeyHeld.svelte'
export { default as HotkeysProvider } from './HotkeysProvider.svelte'
export {
  DEFAULT_OPTIONS,
  getDefaultHotkeysOptions,
  getHotkeysContext,
  setHotkeysContext,
} from './HotkeysCtx'
export type { HotkeysProviderOptions, HotkeysProviderProps } from './HotkeysCtx'
