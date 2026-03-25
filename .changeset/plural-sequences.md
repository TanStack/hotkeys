---
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
---

Add plural sequence APIs (`useHotkeySequences`, `createHotkeySequences`, `createHotkeySequencesAttachment`, `injectHotkeySequences`) and align `enabled` across adapters: disabled registrations stay in the manager for devtools, only core dispatch is skipped, and toggling `enabled` updates handles via `setOptions` instead of churning unregister/register.
