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

## Adapter conformance suite

`@tanstack/hotkeys-test-utils/conformance` holds cases every framework adapter should pass: held keys and key hold, registrations, single hotkeys and the list form, sequences, unset values, provider scopes and defaults, app hotkeys, the recorder, hints and format for display. Each adapter runs them from `tests/conformance.test.*` (Ember: `tests/integration/conformance.test.gts`) through a small harness that mounts views with the adapter's own API.

```ts
import { runConformanceSuite } from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'

runConformanceSuite(vitestRunner(), harness)
```

A harness implements `ConformanceHarness`:

- `mountHotkeys`, `mountHeldKeys`, `mountRegistrations` and the optional `mountRecorder`, `mountHint` and `mountFormat` render a view and wait for it to settle. Their handles read values and apply updates.
- `act` runs a change, such as a key event, and waits for the adapter to settle. `setup` and `cleanup` run around each case.
- `unsupported` lists features the adapter doesn't have, with the reason. The suite skips those cases and puts the reason in the test name.
- `knownBugs` maps a case key (`'group > title'`) to a bug ID. The case is skipped and named after the bug.

Cases take the runner's `describe`, `it` and `expect`, so QUnit can run them too: Ember passes `createExpect()`, a small `expect` that throws on failure.

Cases use `Mod` and read the platform from core `detectPlatform()`, so they pass on every platform:

```sh
HOTKEYS_TEST_PLATFORM=windows pnpm --filter @tanstack/vue-hotkeys test:lib
```

To check that every known bug still fails, run with `HOTKEYS_CONFORMANCE_BUGS=fail`. Known-bug cases then run as `it.fails`.

Framework lifecycle tests, such as StrictMode, KeepAlive, zones, effect roots, Lit reconnects and SSR, stay in each adapter's own tests.
