export * from '@tanstack/hotkeys'

export * from './createHotkeysScope'
// Replaces the core export, to point components to the scope's function
export { formatForDisplay } from './formatForDisplay'
export * from './hotkeysPlugin'
export { createHotkeyRecorder } from './createHotkeyRecorder'
export * from './hotkeyRecorderPlugin'

export * from './types'
