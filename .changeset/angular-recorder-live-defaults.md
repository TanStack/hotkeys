---
'@tanstack/angular-hotkeys': patch
---

`injectHotkeyRecorder` now follows changes to the provider's `hotkeyRecorder` defaults, such as signal-driven `defaultOptions`, instead of keeping the defaults from when it was injected. The docs now say to put a scoped `provideHotkeys` in a component's `providers` rather than `Route.providers`, because the router keeps a route's injector, and its scope, after navigation unless the app uses `withAutoCleanupInjectors()`.
