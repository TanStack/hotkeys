// =============================================================================
// Types
// =============================================================================

export type {
  // Modifier types
  Modifier,
  CanonicalModifier,
  // Key types
  LetterKey,
  NumberKey,
  FunctionKey,
  NavigationKey,
  EditingKey,
  PunctuationKey,
  Key,
  HeldKey,
  // Hotkey types
  Hotkey,
  ParsedHotkey,
  // Callback types
  HotkeyCallback,
  HotkeyCallbackContext,
  // Option types
  HotkeyOptions,
  FormatDisplayOptions,
  ValidationResult,
  // Sequence types
  HotkeySequence,
  SequenceOptions,
  // Registration types
  HotkeyRegistration,
  HotkeyRegistrationHandle,
} from './types'

// =============================================================================
// Constants
// =============================================================================

export {
  // Platform detection
  detectPlatform,
  // Key sets
  LETTER_KEYS,
  NUMBER_KEYS,
  FUNCTION_KEYS,
  NAVIGATION_KEYS,
  EDITING_KEYS,
  PUNCTUATION_KEYS,
  ALL_KEYS,
  // Display constants
  MAC_MODIFIER_SYMBOLS,
  STANDARD_MODIFIER_LABELS,
  KEY_DISPLAY_SYMBOLS,
  MODIFIER_ORDER,
} from './constants'

// =============================================================================
// Parsing
// =============================================================================

export { parseHotkey, normalizeHotkey, isModifier } from './parse'

// =============================================================================
// Formatting
// =============================================================================

export { formatHotkey, formatForDisplay, formatWithLabels } from './format'

// =============================================================================
// Matching
// =============================================================================

export {
  matchesKeyboardEvent,
  createHotkeyHandler,
  createMultiHotkeyHandler,
  type CreateHotkeyHandlerOptions,
} from './match'

// =============================================================================
// Validation
// =============================================================================

export { validateHotkey, assertValidHotkey, checkHotkey } from './validate'

// =============================================================================
// Manager (Singleton)
// =============================================================================

export { HotkeyManager, getHotkeyManager } from './manager'

// =============================================================================
// Key State Tracking
// =============================================================================

export {
  KeyStateTracker,
  getKeyStateTracker,
  type KeyStateTrackerState,
  type KeyStateListener,
} from './key-state'

// =============================================================================
// Sequence Matching
// =============================================================================

export {
  SequenceManager,
  getSequenceManager,
  createSequenceMatcher,
} from './sequence'
