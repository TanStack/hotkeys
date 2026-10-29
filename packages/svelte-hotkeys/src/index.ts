// Re-export everything from the core package
export * from '@tanstack/hotkeys'

export * from './createHotkey.svelte.js'
export * from './createHotkeys.svelte.js'
export * from './createHotkeyRecorder.svelte.js'
export * from './getHeldKeys.svelte.js'
export * from './getHotkeyRegistrations.svelte.js'
export * from './getHotkeyScopesState.svelte.js'
export * from './getHeldKeyCodesMap.svelte.js'
export * from './getIsKeyHeld.svelte.js'
export * from './getAppHotkeys.svelte.js'
export { default as HotkeysProvider } from './HotkeysProvider.svelte'
export {
  DEFAULT_OPTIONS,
  getDefaultHotkeysOptions,
  getHotkeysContext,
  setHotkeysContext,
} from './HotkeysCtx.js'
export type {
  HotkeysContextOptions,
  HotkeysProviderOptions,
  HotkeysProviderProps,
} from './HotkeysCtx.js'
export * from './getHotkeyHint.svelte.js'
