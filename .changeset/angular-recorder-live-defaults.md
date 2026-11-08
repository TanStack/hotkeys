---
'@tanstack/angular-hotkeys': patch
---

`injectHotkeyRecorder` now follows changes to the provider's `hotkeyRecorder` defaults, such as signal-driven `defaultOptions`, instead of keeping the defaults from when it was injected. A default or getter option that is later removed now goes back to the recorder's default instead of keeping its old value. The docs now say to put a scoped `provideHotkeys` in a component's `providers` rather than `Route.providers`, because by default the router keeps a route's injector, and its scope, after navigation.
