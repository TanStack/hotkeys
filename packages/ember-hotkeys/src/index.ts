// Re-export everything from the core package
export * from '@tanstack/hotkeys';

// Ember-specific helpers
export { default as OnHotkeyHelper } from './helpers/on-hotkey';
export type { OnHotkeyOptions, OnHotkeySignature } from './helpers/on-hotkey';

export { default as OnHotkeySequenceHelper } from './helpers/on-hotkey-sequence';
export type {
  OnHotkeySequenceOptions,
  OnHotkeySequenceSignature,
} from './helpers/on-hotkey-sequence';

// Template registry
export type { default as Registry } from './template-registry';
