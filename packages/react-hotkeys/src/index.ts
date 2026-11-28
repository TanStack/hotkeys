// Re-export everything from the core package
export * from '@tanstack/hotkeys'

// provider
export * from './HotkeysProvider'
export * from './AppHotkeysProvider'

// React-specific exports
export * from './useHotkey'
export * from './useHotkeys'
export * from './useHotkeyRecorder'
export * from './useHotkeyRegistrations'
export * from './useHotkeyScopesState'
export * from './useHotkeyHint'
export * from './useFormatForDisplay'
export * from './useFormatForAria'
// Replaces the core export, to point components to the hook
export { formatForDisplay } from './formatForDisplay'
export { formatForAria } from './formatForAria'
export * from './useKeyboardLayout'
export * from './useAppHotkeys'
export * from './useHeldKeys'
export * from './useHeldKeyCodes'
export * from './useKeyHold'
