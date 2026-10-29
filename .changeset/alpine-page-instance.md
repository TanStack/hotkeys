---
'@tanstack/alpine-hotkeys': minor
---

The adapter no longer imports `alpinejs`. It uses the Alpine instance passed to `Alpine.plugin(hotkeysPlugin)`, or `window.Alpine` without the plugin. Install the plugin before `Alpine.start()`; using a scope with neither throws an error that says so.

Before, a page that loaded Alpine from a script tag and the adapter from a CDN got a second copy of Alpine, so held keys and getter options stopped updating with no error. Importing the package in Node also threw `MutationObserver is not defined`, even for helpers such as `formatForDisplay`.
