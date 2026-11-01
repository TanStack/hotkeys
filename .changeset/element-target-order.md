---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/octane-hotkeys': minor
---

Run element-target hotkeys after the framework's own key handlers in React, Svelte, Solid, and Octane. An `onKeyDown` handler inside the target, such as an autocomplete that closes on Escape, now runs first and can stop the hotkey. Before, the hotkey ran first and its default `stopPropagation` kept the key from those handlers.

These adapters set the new `afterDelegatedHandlers` option, so an element target listens on its document. Framework handlers outside the target also run before the hotkey now, and key events dispatched on an element that isn't in a document no longer reach its hotkeys. In Solid, a stop by an `onKeyDown` handler also skips document hotkeys, even when the hotkey registered before the first component that uses `onKeyDown` loaded.
