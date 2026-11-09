# @tanstack/hotkeys-test-utils

Private test helpers shared by every package's Vitest suite. Not published.

## Setup

Each package lists `@tanstack/hotkeys-test-utils/setup` first in `setupFiles`. In happy-dom it:

- Makes `getModifierState('AltGraph')` true only for events created with `modifierAltGraph: true` or marked with `withAltGraph()`. happy-dom 21 returns `altKey` there, which made every Alt chord look like AltGr.
- Pins `navigator.userAgent` (and `navigator.platform`) to Linux, so `detectPlatform()` gives the same answer on a Mac and in CI.

Files that use `@vitest-environment node` are left alone.

To run a suite as another platform, set `HOTKEYS_TEST_PLATFORM` to `mac`, `windows` or `linux`:

```sh
HOTKEYS_TEST_PLATFORM=mac pnpm --filter @tanstack/hotkeys test:lib
```

## Keyboard events

```ts
import { keydown, keyup } from '@tanstack/hotkeys-test-utils'

keydown({ key: 's', code: 'KeyS', ctrlKey: true })
keydown({ key: '@', code: 'KeyQ', ctrlKey: true, altKey: true, altGraph: true })
keydown({ key: 'Enter', target: input }) // dispatches on input
keyup({ key: 's', code: 'KeyS' })
```

Options are `KeyboardEventInit` plus `altGraph` and `target`. Events bubble and are cancelable by default.

## Coverage

`pnpm test:coverage` runs every package with coverage and fails below the thresholds in each `vitest.config.ts`. Ember runs in a real browser through testem, and Octane's tests import the built package, so neither reports coverage.
