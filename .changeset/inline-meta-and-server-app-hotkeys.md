---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': patch
'@tanstack/octane-hotkeys': patch
---

Inline `meta` with arrays, objects, elements, or functions no longer re-renders forever next to `useHotkeyRegistrations`. React threw "Maximum update depth exceeded", and Preact froze the tab. A changed string, number, or boolean field of `meta` still re-renders registration lists. A new array, object, element, or function replaces the old one but doesn't re-render them on its own.

Add `AppHotkeysProvider` to `@tanstack/react-hotkeys`. A React Server Component, such as a Next.js `app/layout.tsx`, can render it with `appHotkeys` from a server module. `HotkeysProvider` threw there, because `defineAppHotkeys` ran only on the server, and it now says to use `AppHotkeysProvider`. `HotkeysProvider` bundles without app hotkeys stay the same size.
