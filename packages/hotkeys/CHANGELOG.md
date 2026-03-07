# @tanstack/hotkeys

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
