# @tanstack/hotkeys

## 0.1.3

### Patch Changes

- fix: hotkeys not triggering on Brave browser when target is `document` or `window` ([#20](https://github.com/TanStack/hotkeys/pull/20))

  Hotkeys registered on `document` or `window` were not being triggered on Brave browser due to non-standard `event.currentTarget` behavior. Brave sets `currentTarget` to `document.documentElement` instead of `document` when a listener is attached to `document`, likely due to privacy/fingerprinting protections.

  Updated `#isEventForTarget` to accept both `document` and `document.documentElement` as valid `currentTarget` values for cross-browser compatibility.

## 0.1.2

### Patch Changes

- Fix SSR fallback issue in HotkeyManager.register() - return a no-op handle instead of creating a fake Document object when running in SSR environments ([#15](https://github.com/TanStack/hotkeys/pull/15))

## 0.1.1

### Patch Changes

- fix detectPlatform SSR pass on WinterTC runtime with partial navigator implementation (e.g: Deno, Cloudflare workers) ([#14](https://github.com/TanStack/hotkeys/pull/14))

## 0.1.0

### Minor Changes

- feat: smarter ignoreInputs default ([#10](https://github.com/TanStack/hotkeys/pull/10))

## 0.0.2

### Patch Changes

- feat: initial release ([`341d167`](https://github.com/TanStack/hotkeys/commit/341d16731f09709a463343852ae4c0e1b6bc6613))

## 0.0.1

### Patch Changes

- feat: TanStack Hotkeys ([#5](https://github.com/TanStack/hotkeys/pull/5))
