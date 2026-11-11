import { LOGICAL_ONLY_NAMED_KEYS, SHARED_NAMED_KEYS } from '../src/_named-keys'
import type {
  EditingKey,
  FunctionKey,
  LetterKey,
  NavigationKey,
  NumberKey,
  PunctuationKey,
} from '../src'

// The library has no runtime table of key names, so tests list them here.
// Each group is written as an object that must have exactly the keys of its
// type: adding a key to a type, or removing one, fails the type check here.

/** The names in a group, in the order they are written. */
const names = <TKey extends string>(group: Record<TKey, 0>) =>
  Object.keys(group) as Array<TKey>

// prettier-ignore
export const LETTER_KEY_NAMES = names<LetterKey>({
  A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: 0, K: 0, L: 0, M: 0,
  N: 0, O: 0, P: 0, Q: 0, R: 0, S: 0, T: 0, U: 0, V: 0, W: 0, X: 0, Y: 0, Z: 0,
})

// prettier-ignore
export const NUMBER_KEY_NAMES = names<NumberKey>({
  0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
})

// prettier-ignore
export const FUNCTION_KEY_NAMES = names<FunctionKey>({
  F1: 0, F2: 0, F3: 0, F4: 0, F5: 0, F6: 0, F7: 0, F8: 0, F9: 0, F10: 0,
  F11: 0, F12: 0, F13: 0, F14: 0, F15: 0, F16: 0, F17: 0, F18: 0, F19: 0,
  F20: 0, F21: 0, F22: 0, F23: 0, F24: 0,
})

// prettier-ignore
export const NAVIGATION_KEY_NAMES = names<NavigationKey>({
  ArrowUp: 0, ArrowDown: 0, ArrowLeft: 0, ArrowRight: 0,
  Home: 0, End: 0, PageUp: 0, PageDown: 0,
})

// prettier-ignore
export const EDITING_KEY_NAMES = names<EditingKey>({
  Enter: 0, Escape: 0, Space: 0, Tab: 0, Backspace: 0, Delete: 0,
})

// prettier-ignore
export const PUNCTUATION_KEY_NAMES = names<PunctuationKey>({
  '/': 0, '[': 0, ']': 0, '\\': 0, '=': 0, '-': 0, ',': 0, '.': 0, ';': 0,
  '`': 0, "'": 0, '+': 0, '?': 0, '!': 0, '@': 0, '#': 0, '$': 0, '%': 0,
  '^': 0, '&': 0, '*': 0, '(': 0, ')': 0, '_': 0, '{': 0, '}': 0, '|': 0,
  ':': 0, '"': 0, '<': 0, '>': 0, '~': 0,
})

/**
 * Every logical key the hotkey types accept by name: letters, digits, function
 * keys, navigation, editing, punctuation, and the other named keys.
 */
export const TYPED_KEYS: ReadonlyArray<string> = [
  ...LETTER_KEY_NAMES,
  ...NUMBER_KEY_NAMES,
  ...FUNCTION_KEY_NAMES,
  ...NAVIGATION_KEY_NAMES,
  ...EDITING_KEY_NAMES,
  ...PUNCTUATION_KEY_NAMES,
  ...SHARED_NAMED_KEYS,
  ...LOGICAL_ONLY_NAMED_KEYS,
]
