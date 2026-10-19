# End-to-end tests

Browser tests for `@tanstack/hotkeys`, run with Playwright against the library source.

| Suite                         | Command                        | Browsers                  | Keys                                            |
| ----------------------------- | ------------------------------ | ------------------------- | ----------------------------------------------- |
| Browser behavior (`browser/`) | `pnpm test:e2e`                | Chromium, Firefox, WebKit | Playwright's simulated keyboard                 |
| Keyboard layouts (`layouts/`) | `pnpm test:e2e:layouts:docker` | Chromium, Firefox         | Real key presses through Linux keyboard layouts |

Run the commands from the repository root or from `e2e/`. Install browsers once with `pnpm --filter @tanstack/hotkeys-e2e exec playwright install`.

## Browser behavior

These tests cover how the library behaves in a real page: matching, `preventDefault`, typing in inputs, targets, sequences, scopes, held keys, and the recorder.

Playwright's keyboard sends key events straight to the browser and uses a built-in US layout. It does not go through the operating system, so it cannot test other keyboard layouts, AltGr, or dead keys. Those belong in the keyboard layout suite.

Use `hk.mod` for the `Mod` key instead of Playwright's `ControlOrMeta`. Playwright's WebKit reports a Mac user agent on Linux, so the page expects Meta there while `ControlOrMeta` presses Control.

## Keyboard layouts

These tests switch the X11 keyboard layout with `setxkbmap` and press physical keys with `xdotool`. The browser receives the same events a user's keyboard would produce on that layout. Cases cover AltGr, AZERTY, QWERTZ, Dvorak, Russian, and dead keys.

- **macOS and Windows:** `pnpm test:e2e:layouts:docker` builds `docker/Dockerfile`, starts browsers and a virtual display in a container, and runs the tests on the host against them. Requires Docker.
- **Linux:** install `xvfb`, `xdotool`, and `x11-xkb-utils`, copy `docker/tanstack.xkb` to `/usr/share/X11/xkb/symbols/tanstack`, and run `xvfb-run -a pnpm test:e2e:layouts`. CI does this.

`tanstack(winno)` is a Norwegian layout that leaves AltGr+F, K, and A empty, as Windows Norwegian does. Linux layouts put a character on almost every AltGr key.

To add a layout case, add an entry to a `describeLayouts` call: the physical keys pressed, the bindings that must match, and what the event parses and records as. Key names are physical positions, listed in `support/x11.ts`.

### Not covered

- Windows and macOS report some keys differently from Linux. For example, Windows browsers can report AltGr as Control+Alt. The unit tests in `packages/hotkeys/tests` cover those event shapes.
- IME composition.
- Safari. Playwright's WebKit is close to Safari but not the same.
