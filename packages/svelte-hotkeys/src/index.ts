// Re-export everything from the core package
export * from '@tanstack/hotkeys'

export * from './createHotkey.svelte'
export * from './createHotkeys.svelte'
export * from './createHotkeyRecorder.svelte'
export * from './getHeldKeys.svelte'
export * from './getHotkeyRegistrations.svelte'
export * from './getHotkeyScopesState.svelte'
export * from './getHeldKeyCodesMap.svelte'
export * from './getIsKeyHeld.svelte'
export * from './getAppHotkeys.svelte'
export { default as HotkeysProvider } from './HotkeysProvider.svelte'
export {
  DEFAULT_OPTIONS,
  getDefaultHotkeysOptions,
  getHotkeysContext,
  setHotkeysContext,
} from './HotkeysCtx'
export type {
  HotkeysContextOptions,
  HotkeysProviderOptions,
  HotkeysProviderProps,
} from './HotkeysCtx'
export * from './getHotkeyHint.svelte'
