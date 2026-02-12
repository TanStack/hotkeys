---
id: "@tanstack/hotkeys"
title: "@tanstack/hotkeys"
---

# @tanstack/hotkeys

## Classes

- [HotkeyManager](classes/HotkeyManager.md)
- [HotkeyRecorder](classes/HotkeyRecorder.md)
- [KeyStateTracker](classes/KeyStateTracker.md)
- [SequenceManager](classes/SequenceManager.md)

## Interfaces

- [CreateHotkeyHandlerOptions](interfaces/CreateHotkeyHandlerOptions.md)
- [FormatDisplayOptions](interfaces/FormatDisplayOptions.md)
- [FormatKeyDebuggingOptions](interfaces/FormatKeyDebuggingOptions.md)
- [HotkeyCallbackContext](interfaces/HotkeyCallbackContext.md)
- [HotkeyOptions](interfaces/HotkeyOptions.md)
- [HotkeyRecorderOptions](interfaces/HotkeyRecorderOptions.md)
- [HotkeyRecorderState](interfaces/HotkeyRecorderState.md)
- [HotkeyRegistration](interfaces/HotkeyRegistration.md)
- [HotkeyRegistrationHandle](interfaces/HotkeyRegistrationHandle.md)
- [KeyStateTrackerState](interfaces/KeyStateTrackerState.md)
- [ParsedHotkey](interfaces/ParsedHotkey.md)
- [RawHotkey](interfaces/RawHotkey.md)
- [SequenceOptions](interfaces/SequenceOptions.md)
- [ValidationResult](interfaces/ValidationResult.md)

## Type Aliases

- [CanonicalModifier](type-aliases/CanonicalModifier.md)
- [ConflictBehavior](type-aliases/ConflictBehavior.md)
- [EditingKey](type-aliases/EditingKey.md)
- [FunctionKey](type-aliases/FunctionKey.md)
- [HeldKey](type-aliases/HeldKey.md)
- [Hotkey](type-aliases/Hotkey.md)
- [HotkeyCallback](type-aliases/HotkeyCallback.md)
- [HotkeySequence](type-aliases/HotkeySequence.md)
- [Key](type-aliases/Key.md)
- [LetterKey](type-aliases/LetterKey.md)
- [Modifier](type-aliases/Modifier.md)
- [NavigationKey](type-aliases/NavigationKey.md)
- [NumberKey](type-aliases/NumberKey.md)
- [PunctuationKey](type-aliases/PunctuationKey.md)
- [RegisterableHotkey](type-aliases/RegisterableHotkey.md)

## Variables

- [ALL\_KEYS](variables/ALL_KEYS.md)
- [EDITING\_KEYS](variables/EDITING_KEYS.md)
- [FUNCTION\_KEYS](variables/FUNCTION_KEYS.md)
- [KEY\_DISPLAY\_SYMBOLS](variables/KEY_DISPLAY_SYMBOLS.md)
- [LETTER\_KEYS](variables/LETTER_KEYS.md)
- [MAC\_MODIFIER\_SYMBOLS](variables/MAC_MODIFIER_SYMBOLS.md)
- [MODIFIER\_ALIASES](variables/MODIFIER_ALIASES.md)
- [MODIFIER\_KEYS](variables/MODIFIER_KEYS.md)
- [MODIFIER\_ORDER](variables/MODIFIER_ORDER.md)
- [NAVIGATION\_KEYS](variables/NAVIGATION_KEYS.md)
- [NUMBER\_KEYS](variables/NUMBER_KEYS.md)
- [PUNCTUATION\_KEYS](variables/PUNCTUATION_KEYS.md)
- [STANDARD\_MODIFIER\_LABELS](variables/STANDARD_MODIFIER_LABELS.md)

## Functions

- [assertValidHotkey](functions/assertValidHotkey.md)
- [checkHotkey](functions/checkHotkey.md)
- [convertToModFormat](functions/convertToModFormat.md)
- [createHotkeyHandler](functions/createHotkeyHandler.md)
- [createMultiHotkeyHandler](functions/createMultiHotkeyHandler.md)
- [createSequenceMatcher](functions/createSequenceMatcher.md)
- [detectPlatform](functions/detectPlatform.md)
- [formatForDisplay](functions/formatForDisplay.md)
- [formatHotkey](functions/formatHotkey.md)
- [formatKeyForDebuggingDisplay](functions/formatKeyForDebuggingDisplay.md)
- [formatWithLabels](functions/formatWithLabels.md)
- [getHotkeyManager](functions/getHotkeyManager.md)
- [getKeyStateTracker](functions/getKeyStateTracker.md)
- [getSequenceManager](functions/getSequenceManager.md)
- [hasNonModifierKey](functions/hasNonModifierKey.md)
- [isModifier](functions/isModifier.md)
- [isModifierKey](functions/isModifierKey.md)
- [keyboardEventToHotkey](functions/keyboardEventToHotkey.md)
- [matchesKeyboardEvent](functions/matchesKeyboardEvent.md)
- [normalizeHotkey](functions/normalizeHotkey.md)
- [normalizeKeyName](functions/normalizeKeyName.md)
- [parseHotkey](functions/parseHotkey.md)
- [parseKeyboardEvent](functions/parseKeyboardEvent.md)
- [rawHotkeyToParsedHotkey](functions/rawHotkeyToParsedHotkey.md)
- [resolveModifier](functions/resolveModifier.md)
- [validateHotkey](functions/validateHotkey.md)
