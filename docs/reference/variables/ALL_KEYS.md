---
id: ALL_KEYS
title: ALL_KEYS
---

```ts
const ALL_KEYS: Set<
  | "CapsLock"
  | "ContextMenu"
  | "Convert"
  | "KanaMode"
  | "NonConvert"
  | "Help"
  | "Insert"
  | "NumLock"
  | "Fn"
  | "FnLock"
  | "PrintScreen"
  | "ScrollLock"
  | "Pause"
  | "BrowserBack"
  | "BrowserFavorites"
  | "BrowserForward"
  | "BrowserHome"
  | "BrowserRefresh"
  | "BrowserSearch"
  | "BrowserStop"
  | "Eject"
  | "LaunchMail"
  | "MediaPlayPause"
  | "MediaStop"
  | "MediaTrackNext"
  | "MediaTrackPrevious"
  | "Power"
  | "AudioVolumeDown"
  | "AudioVolumeMute"
  | "AudioVolumeUp"
  | "WakeUp"
  | "Hyper"
  | "Super"
  | "Again"
  | "Copy"
  | "Cut"
  | "Find"
  | "Open"
  | "Paste"
  | "Props"
  | "Select"
  | "Undo"
  | "Hiragana"
  | "Katakana"
  | "Clear"
  | "Cancel"
  | "Standby"
  | "LaunchApplication1"
  | "LaunchApplication2"
  | "LaunchMediaPlayer"
  | "HangulMode"
  | "HanjaMode"
  | "Zenkaku"
  | "Hankaku"
  | "ZenkakuHankaku"
  | LetterKey
  | NumberKey
  | FunctionKey
  | NavigationKey
  | EditingKey
| PunctuationKey>;
```

Defined in: [constants.ts:305](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L305)

Set of all valid non-modifier keys.

This is the union of all key type sets (letters, numbers, function keys, navigation,
editing, and punctuation). Used primarily for validation to check if a key string
is recognized and will have type-safe autocomplete support.

## See

 - [LETTER\_KEYS](LETTER_KEYS.md)
 - [NUMBER\_KEYS](NUMBER_KEYS.md)
 - [FUNCTION\_KEYS](FUNCTION_KEYS.md)
 - [NAVIGATION\_KEYS](NAVIGATION_KEYS.md)
 - [EDITING\_KEYS](EDITING_KEYS.md)
 - [PUNCTUATION\_KEYS](PUNCTUATION_KEYS.md)
