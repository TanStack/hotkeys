# Testing hotkeys

- **Set the platform.** Test DOMs don't report a real platform (happy-dom on macOS detects `windows`), so `Mod` changes meaning between machines. Pass `platform: 'mac'` in the provider's `defaultOptions.hotkey`, or on the hotkey.
- **Reset between tests.** Call `HotkeyManager.resetInstance()`, plus `KeyStateTracker.resetInstance()` for held-key tests, in `afterEach`. Registrations and scope activations otherwise outlive a test that fails before unmounting.
- **Dispatch real events.** Use `new KeyboardEvent('keydown', { key: 's', code: 'KeyS', metaKey: true, bubbles: true, cancelable: true })`. Physical bindings such as `[KeyS]` match only `code`. Check `event.defaultPrevented` to assert the browser action was blocked.
- **Dispatch where focus is.** For a hotkey with a `target`, or to test typing in a field, focus the element and dispatch on it with `bubbles: true`.
- **Repeats and sequences.** `repeat: true` simulates holding a key; it fires chords again unless they set `requireReset`, and it never advances a sequence. Use fake timers to test a sequence's `timeout` (1000 ms by default).
