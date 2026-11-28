// Re-export everything from the core package
export * from '@tanstack/hotkeys'

// Provider
export * from './HotkeysProvider'
export * from './HotkeysProviderContext'

// Vue-specific composables
export * from './useHotkey'
export * from './useHotkeys'
export * from './useHeldKeys'
export * from './useHeldKeyCodes'
export * from './useKeyHold'
export * from './useHotkeyRecorder'
export * from './useHotkeyRegistrations'
export * from './useHotkeyScopesState'
export * from './useHotkeyHint'
export * from './useFormatForDisplay'
export * from './useFormatForAria'
// Replaces the core export, to point components to the composable
export { formatForDisplay } from './formatForDisplay'
export { formatForAria } from './formatForAria'
export * from './useKeyboardLayout'
export * from './useAppHotkeys'
