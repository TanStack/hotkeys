# End-to-end tests

Browser tests for `@tanstack/hotkeys`, run with Playwright against the library source.

| Suite                           | Command                        | Browsers                        | Keys                                            |
| ------------------------------- | ------------------------------ | ------------------------------- | ----------------------------------------------- |
| Browser behavior (`browser/`)   | `pnpm test:e2e`                | Chromium, Firefox, WebKit       | Playwright's simulated keyboard                 |
| Adapters (`adapters/`)          | `pnpm test:e2e:adapters`       | Chromium, Firefox, WebKit       | Playwright's simulated keyboard                 |
| Keyboard layouts (`layouts/`)   | `pnpm test:e2e:layouts:docker` | Chromium, Firefox               | Real key presses through Linux keyboard layouts |
| Server rendering (`ssr/`)       | `pnpm test:e2e:ssr`            | Chromium                        | Playwright's simulated keyboard                 |
| Real input, nightly (`native/`) | `pnpm test:e2e:native`         | Chromium, Edge, Chrome, Firefox | Real key presses on Windows, Wayland, and ibus  |

Run the commands from the repository root or from `e2e/`. Install browsers once with `pnpm --filter @tanstack/hotkeys-e2e exec playwright install`.

## Browser behavior

These tests cover how the library behaves in a real page: matching, `preventDefault`, typing in inputs, targets, sequences, scopes, held keys, and the recorder.

Playwright's keyboard sends key events straight to the browser and uses a built-in US layout. It does not go through the operating system, so it cannot test other keyboard layouts, AltGr, or dead keys. Those belong in the keyboard layout suite.

CI runs this suite on Linux for every pull request. After each merge to `main`, it also runs on macOS (Chromium, Firefox, WebKit) and Windows (Chromium, Firefox, Edge). On Windows, Playwright adds an `msedge` project that uses the installed Edge.

Use `hk.mod` for the `Mod` key instead of Playwright's `ControlOrMeta`. Playwright's WebKit reports a Mac user agent on Linux, so the page expects Meta there while `ControlOrMeta` presses Control.

## Adapters

These tests run every framework adapter in a real browser. Each adapter has a small Vite app in `adapters/apps/<adapter>` that renders the same UI and publishes the same controls on `window.fixture` (see `adapters/shared/fixture.ts`). One spec, `adapters/adapters.spec.ts`, runs against each app:

- A hotkey fires once per press.
- Unmounting the component unregisters its hotkey, and a remount registers it exactly once.
- Toggling `enabled` and changing the hotkey string at runtime update the registration.
- A sequence fires.
- The recorder records a chord.
- Key hold and held keys follow the keyboard.

React also runs everything under `StrictMode` (`?strict`), which mounts, unmounts and remounts each effect. Preact's `StrictMode` is a Fragment, so its `?strict` run matches the plain one.

The apps use the adapters' built `dist` output, as an app would. Run `pnpm test:e2e:adapters` from the repository root: it builds the packages and the apps, then runs the tests. Run `pnpm --filter @tanstack/hotkeys-e2e test:e2e:adapters` to skip the build. Playwright serves each app's `dist` folder from `http://adapters.test/<adapter>/`, so no server starts.

To add an adapter, add an app that follows the contract in `adapters/shared/fixture.ts`, and add it to `adapterApps` in `adapters/apps.ts`. A test that fails because of a suspected adapter bug goes in that app's `knownBugs` with its GitHub issue number, which skips it under that number.

## Server rendering

These tests run the server-rendered cheat sheet examples (`examples/*/*FormatForDisplay-*`) from their production builds, each on its own port (4301 to 4319, listed in `ssr/examples.ts`). Playwright starts the servers. Run `pnpm test:e2e:ssr` from the repository root: it builds the examples, then runs the tests. Run `pnpm --filter @tanstack/hotkeys-e2e test:e2e:ssr` to skip the build.

For each example and for a Mac and a Windows user agent, the tests check that:

- The server's HTML has the platform's labels, such as `⌘ S` or `Ctrl+S`. The static VitePress example has no labels in its HTML.
- The page hydrates without console errors or warnings, and without changing any label. Most frameworks fix a mismatched label in production without logging anything, so the tests watch the labels for changes after the HTML is parsed.
- Hotkeys and format options work after hydration.

To add an example, add it to `ssr/examples.ts` with an unused port and the command that starts its production server.

## Keyboard layouts

These tests switch the X11 keyboard layout with `setxkbmap` and press physical keys with `xdotool`. The browser receives the same events a user's keyboard would produce on that layout. Cases cover AltGr, AZERTY, QWERTZ, Dvorak, Russian (alone and with a US group), dead keys, Turkish dotless i, the Czech digit row, the ISO and JIS extra keys (UK, Brazilian ABNT2, Japanese), and the numpad with NumLock on and off.

- **macOS and Windows:** `pnpm test:e2e:layouts:docker` builds `docker/Dockerfile`, starts browsers and a virtual display in a container, and runs the tests on the host against them. Requires Docker.
- **Linux:** install `xvfb`, `xdotool`, `x11-xkb-utils`, `x11-xserver-utils`, and `xterm`, copy `docker/tanstack.xkb` to `/usr/share/X11/xkb/symbols/tanstack`, and run `xvfb-run -a pnpm test:e2e:layouts`. CI does this.

`tanstack(winno)` is a Norwegian layout that leaves AltGr+F, K, and A empty, as Windows Norwegian does. Linux layouts put a character on almost every AltGr key.

The suite also holds real keys down:

- `key-repeat.spec.ts` holds a key past the auto-repeat delay and checks `event.repeat`, `requireReset`, and sequences.
- `focus-loss.spec.ts` moves keyboard focus to an xterm while keys are held, releases them there, and checks that no key stays held. Playwright makes pages report focus even when their window doesn't have it. Chromium can turn this off per page; Playwright's Firefox can't, so Firefox never sees the blur.

To add a layout case, add an entry to a `describeLayouts` call: the physical keys pressed, the bindings that must match, and what the event parses and records as. Cases can also check the recording with `recordBy: 'key'` and the recorded binding's display label, with and without Chromium's `getLayoutMap()`. Key names are physical positions, listed in `support/x11.ts`.

- For a layout with two groups, such as Russian with US, put the layout under test first (`'ru,us'`). xdotool resets the active group on every press.
- Pass `numLock: true` to `describeLayouts` to run its cases with NumLock on.
- Mark a case that shows a suspected library bug with `bug: '#123'`, the GitHub issue that tracks it. It's skipped and its name starts with the issue number.

### Not covered

- Windows and macOS report some keys differently from Linux. For example, Windows browsers can report AltGr as Control+Alt. The unit tests in `packages/hotkeys/tests` and the nightly Windows job cover those event shapes.
- IME composition. The nightly ibus job covers it.
- Safari. Playwright's WebKit is close to Safari but not the same.

## Flaky tests

In CI, each suite retries a failed test once and then fails the run if the retry passed, so a flaky test is reported instead of hidden. Every Monday, a scheduled workflow (`e2e-flaky.yml`) runs the browser and keyboard layout suites five times each. Run it on demand from the Actions tab.

## Real input (nightly)

These tests send key presses through the operating system, in environments the per-PR workflow doesn't have. `.github/workflows/nightly.yml` runs them every night and on manual dispatch. Each job writes the events the browsers reported (`key`, `code`, `keyCode`, modifiers, `getModifierState('AltGraph')`, `isComposing`, composition events) to its job summary, from `test-results/native-events.jsonl`. Run `node scripts/native-report.ts` to print that table locally.

| Projects                                                | Machine                                                          | Keys                                                                                                                                                                                                                          |
| ------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `windows-chromium`, `windows-msedge`, `windows-firefox` | Windows                                                          | `native/windows/SendInput.cs`, compiled with the .NET Framework `csc.exe` that ships with Windows. It sends scan codes with `SendInput` and switches layouts with `LoadKeyboardLayout`: US, German, and Polish (Programmers). |
| `wayland-chromium`, `wayland-chrome`                    | Linux, inside `native/wayland/run.sh`                            | `native/wayland/vkbd.c`, a virtual keyboard for headless sway. It uploads a real xkb keymap, so browsers see real `code` values. Browsers run with the Wayland backend and no X display.                                      |
| `ibus-chromium`, `ibus-firefox`                         | Linux, inside Xvfb, `dbus-run-session`, and `native/ibus/run.sh` | xdotool, with the ibus Chinese pinyin input method (`ibus-libpinyin`) on. Set `E2E_IBUS_ENGINE` to try another engine.                                                                                                        |

Firefox isn't in the Wayland job. Under headless sway it never receives the virtual keyboard's keys, so every test fails before the first press.

Run one environment's projects at a time, for example `pnpm test:e2e:native --project 'windows-*'`. The workflow lists the packages each Linux job installs.
