---
'@tanstack/hotkeys': patch
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/octane-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/angular-hotkeys': patch
---

App hotkeys now compare hotkeys on the provider's `platform`. Before, providers didn't pass it to the app hotkeys store, which used the detected platform instead. On a server that meant `'linux'`, so `isCustom` from the app hotkey list could differ after hydration when a saved hotkey and its default differ only in how they name the modifier, such as `Meta+S` and `Mod+S`. `findConflicts` and `setCustomHotkey` also compared on the detected platform. The store follows changes to the provider's `platform`, and `AppHotkeysStore.setOptions` notifies subscribers once when the platform changes, after applying any new saved custom hotkeys. Saved custom hotkeys are now compared exactly, so new saved data such as `Meta+S` replaces `Mod+S` even where the two match, and stays correct if the platform changes later.

The formatting guides and `formatForDisplay`'s JSDoc now warn more clearly against using `formatForDisplay` for server-rendered labels. Use your adapter's formatter, such as `useFormatForDisplay`, instead, and set the provider's `platform`, or in Ember the scope's, from the request. Where you can't use one, such as in a React Server Component, or with Lit, Alpine, or `@tanstack/hotkeys` alone, pass `platform` to `formatForDisplay`.
