// Re-export everything from the core package
export * from '@tanstack/hotkeys'

// Provider
export * from './hotkeys-provider'

// Angular-specific primitives
export * from './injectHotkey'
export * from './injectHotkeySequence'
export * from './injectHeldKeys'
export * from './injectHeldKeyCodes'
export * from './injectKeyHold'
export * from './injectHotkeyRecorder'
