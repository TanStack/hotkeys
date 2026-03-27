# @tanstack/hotkeys

## 0.6.3

### Patch Changes

- Add `separatorToken` option to `formatForDisplay` to allow customizing the separator between keys ([#92](https://github.com/TanStack/hotkeys/pull/92))

## 0.6.2

### Patch Changes

- fix: use `document.activeElement` instead of `event.target` for `ignoreInputs` option ([#89](https://github.com/TanStack/hotkeys/pull/89))

  Switched from checking `event.target` to checking `document.activeElement` when determining if hotkeys should be ignored in input elements. This more accurately reflects whether the user is currently typing in an input, and fixes issues with libraries that intercept and re-dispatch keyboard events.

## 0.6.1

### Patch Changes

- chore: upgrade tanstack store version ([`19a960f`](https://github.com/TanStack/hotkeys/commit/19a960fb07655db28b6ec967cba7f957ece66edb))

## 0.6.0

### Minor Changes

- Refactor hotkey normalization and display formatting APIs in `@tanstack/hotkeys`, align framework packages and devtools, and update display-related constants. ([#85](https://github.com/TanStack/hotkeys/pull/85))

## 0.5.0

### Minor Changes

- Align sequence recording with hotkey-prefixed public API: `HotkeySequenceRecorder`, framework hooks `useHotkeySequenceRecorder` / `createHotkeySequenceRecorder` / `injectHotkeySequenceRecorder`, and provider defaults under `hotkeySequenceRecorder`. ([#78](https://github.com/TanStack/hotkeys/pull/78))

## 0.4.3

### Patch Changes

- Fix useHotkeySequence resets progress when modifier key is pressed before a key combo e.g. zA (Vim-like hotkeys) ([#74](https://github.com/TanStack/hotkeys/pull/74))

- fix: add jsdoc for combos in hotkey sequences ([`4e29eec`](https://github.com/TanStack/hotkeys/commit/4e29eec1eab57c7b2b59ccda84ce32dcb5f9fd8c))

## 0.4.2

### Patch Changes

- Fix Alt+punctuation hotkeys not firing on macOS due to Option key character composition ([#64](https://github.com/TanStack/hotkeys/pull/64))

  On macOS, the Option (Alt) key acts as a character composer for punctuation keys (e.g., Option+- produces an en-dash '–'), causing `event.key` to differ from the expected character. Added an `event.code` fallback for punctuation keys (Minus, Equal, Slash, BracketLeft, BracketRight, Backslash, Comma, Period, Backquote, Semicolon), matching the existing fallback pattern for letter and digit keys.

## 0.4.1

### Patch Changes

- fix: option+letter combos on mac layouts ([#61](https://github.com/TanStack/hotkeys/pull/61))

## 0.4.0

### Minor Changes

- add angular adapter and upgrade packages ([#31](https://github.com/TanStack/hotkeys/pull/31))

## 0.3.3

### Patch Changes

- fix: respect keyboard layout in event.code fallback for non-QWERTY layouts ([#53](https://github.com/TanStack/hotkeys/pull/53))

  The `matchesKeyboardEvent` function's `event.code` fallback now only activates when `event.key` is not a standard ASCII letter. Previously, the fallback would match based on physical key position even when `event.key` was a valid letter from a non-QWERTY layout (Dvorak, Colemak, AZERTY, etc.), causing hotkeys to trigger on wrong key presses.

## 0.3.2

### Patch Changes

- fix(isInputElement): recognize contenteditable="plaintext-only" and inherited contenteditable ([#51](https://github.com/TanStack/hotkeys/pull/51))

## 0.3.1

### Patch Changes

- fix: handle dead keys in `matchesKeyboardEvent` ([#40](https://github.com/TanStack/hotkeys/pull/40))

  When `event.key` is `'Dead'` (length 4), the existing `event.code` fallback—gated behind `eventKey.length === 1`—was never reached, causing hotkeys to silently fail.

  This most commonly affects macOS, where `Option+letter` combinations like `Option+E`, `Option+I`, `Option+U`, and `Option+N` produce dead keys for accent composition. It also affects Windows and Linux users with international keyboard layouts (e.g., US-International, German, French) where certain key combinations produce dead keys.

  Added an early check: when `event.key` normalizes to `'Dead'`, immediately fall back to `event.code` to extract the physical key via the `Key*`/`Digit*` prefixes. Punctuation dead keys (e.g., `'` on US-International, where `event.code` is `'Quote'`) correctly return `false` since their codes don't match letter or digit patterns.

## 0.3.0

### Minor Changes

- feat: overhaul sequence-manager and hooks to be in feature parity with hotkey-manager. ([#21](https://github.com/TanStack/hotkeys/pull/21))

## 0.2.0

### Minor Changes

- feat: upgrade tanstack store version ([#35](https://github.com/TanStack/hotkeys/pull/35))

## 0.1.3

### Patch Changes

- fix: hotkeys not triggering on Brave browser when target is `document` or `window` ([#20](https://github.com/TanStack/hotkeys/pull/20))

  Hotkeys registered on `document` or `window` were not being triggered on Brave browser due to non-standard `event.currentTarget` behavior. Brave sets `currentTarget` to `document.documentElement` instead of `document` when a listener is attached to `document`, likely due to privacy/fingerprinting protections.

  Updated `#isEventForTarget` to accept both `document` and `document.documentElement` as valid `currentTarget` values for cross-browser compatibility.

## 0.1.2

### Patch Changes

- Fix SSR fallback issue in HotkeyManager.register() - return a no-op handle instead of creating a fake Document object when running in SSR environments ([#15](https://github.com/TanStack/hotkeys/pull/15))

## 0.1.1

### Patch Changes

- fix detectPlatform SSR pass on WinterTC runtime with partial navigator implementation (e.g: Deno, Cloudflare workers) ([#14](https://github.com/TanStack/hotkeys/pull/14))

## 0.1.0

### Minor Changes

- feat: smarter ignoreInputs default ([#10](https://github.com/TanStack/hotkeys/pull/10))

## 0.0.2

### Patch Changes

- feat: initial release ([`341d167`](https://github.com/TanStack/hotkeys/commit/341d16731f09709a463343852ae4c0e1b6bc6613))

## 0.0.1

### Patch Changes

- feat: TanStack Hotkeys ([#5](https://github.com/TanStack/hotkeys/pull/5))
