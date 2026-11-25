---
'@tanstack/react-hotkeys': patch
---

Hotkeys and provider scopes now stop while a Suspense boundary hides content it already showed, and start again when the content comes back. Before, a hotkey behind the fallback kept firing, and an exclusive `HotkeysProvider` behind it kept other hotkeys suspended. `useHotkey`, `useHotkeys`, and the provider's scope now register in a layout effect, as the Preact adapter already does, so they also register before the browser paints.
