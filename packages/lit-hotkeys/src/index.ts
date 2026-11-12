// Re-export everything from the core package
export * from '@tanstack/hotkeys'

// Lit-specific exports
export * from './decorators'
export * from './controllers'
// Replaces the core export, to point elements to the controller
export { formatForDisplay } from './format-for-display'
