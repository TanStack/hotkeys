---
'@tanstack/hotkeys': minor
'@tanstack/hotkeys-devtools': minor
'@tanstack/react-hotkeys': minor
'@tanstack/react-hotkeys-devtools': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/preact-hotkeys-devtools': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/vue-hotkeys-devtools': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/solid-hotkeys-devtools': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/svelte-hotkeys-devtools': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/angular-hotkeys-devtools': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
---

Server-rendered hotkey labels can match the user's platform.

- `detectPlatform(userAgent)` detects the platform from a user agent string, such as a request's `User-Agent` header.
- Without a user agent, `detectPlatform()` returns `'linux'` on Node, Deno, Bun, and Cloudflare Workers instead of the server's own OS.
- In development, formatting a label on the server without a platform warns once.
- Providers accept `defaultOptions.platform`, which is also the default platform for their hotkeys and recorders.
- Adapters that render on the server add a formatter hook that uses the provider's platform: `useFormatForDisplay` (React, Preact, Octane, Vue, Ember), `createFormatForDisplay` (Solid), `getFormatForDisplay` (Svelte), and `injectFormatForDisplay` (Angular).
