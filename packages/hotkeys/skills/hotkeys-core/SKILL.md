---
name: hotkeys-core
description: >-
  Use when adding, fixing, or reviewing keyboard shortcuts with TanStack
  Hotkeys: replacing keydown listeners or another shortcut library, deciding
  when a hotkey works (enabled, scopes, targets), dialogs that own the
  keyboard, sequences, or testing hotkeys. Load the framework adapter's skill
  with it.
metadata:
  purpose: >-
    Framework-neutral rules for TanStack Hotkeys: the work the library already
    does, how hotkeys turn on and off, and the pitfalls that don't surface as
    errors.
  type: core
  library: '@tanstack/hotkeys'
  library_version: '0.16.0'
sources:
  - src/hotkey-manager.ts
  - src/match.ts
  - TanStack/hotkeys:docs/guides/sensible-defaults.md
  - TanStack/hotkeys:docs/framework/react/guides/hotkeys.md
  - TanStack/hotkeys:docs/framework/react/guides/sequences.md
  - TanStack/hotkeys:docs/framework/react/guides/hotkeys-provider-and-scopes.md
  - 'TanStack/hotkeys:packages/react-hotkeys/tests/skills/editor-shortcuts/**'
---

# TanStack Hotkeys

The library owns the keyboard. Register every shortcut with your framework adapter's hotkey API, such as `useHotkey`, `createHotkey`, `injectHotkey`, or `@hotkey`, in the component that owns the action. Import everything from the adapter package; it re-exports `@tanstack/hotkeys`. The adapter's skill covers its bindings.

## Use the library instead of rebuilding it

| Instead of                                                            | Use                                                                                                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A `keydown` listener that checks `event.key`, `metaKey`, or `ctrlKey` | A registered hotkey such as `'Mod+S'`. Inside a widget's own key handler, `matchesKeyboardEvent(event, 'Mod+Enter')`.                         |
| `isMac` checks and `⌘`/`Ctrl` label maps                              | `Mod` in the hotkey, and the adapter's label primitive, such as `useFormatForDisplay()`, for labels of hotkeys and of held keys as `{ key }`  |
| Skipping events from text fields, calling `preventDefault`            | The defaults: single keys and Shift/Alt chords are skipped while typing, `Mod` chords and `Escape` still fire, and matched keys are prevented |
| A shortcut registry, service, context, or wrapper hook                | The adapter API, called where each action lives. For one list of every shortcut, load `@tanstack/hotkeys#app-hotkeys`.                        |
| A "shortcuts enabled" flag or topmost-dialog tracking                 | Scopes, with `exclusive` for dialogs                                                                                                          |
| A hand-written shortcut list for a help dialog                        | `meta: { name }` and the adapter's registrations list, or app hotkeys                                                                         |
| `keydown`/`keyup` state that tracks held keys                         | The adapter's held-key and hint APIs                                                                                                          |
| Capturing the next key press for a settings screen                    | The adapter's recorder                                                                                                                        |

A workaround loses what the library tracks: scopes stop suspending it, recorders stop pausing it, devtools stop listing it, and layout and platform handling disappear.

## Turn hotkeys on and off

Use the first mechanism that fits:

1. **Lifetime.** A hotkey registered in a component exists while that component is mounted. A dialog's `Escape` belongs in the dialog.
2. **`enabled`.** A condition inside a mounted component.
3. **Scope.** A group that turns on and off together, such as a dialog, pane, or tab. An `exclusive` scope suspends every other scope, including global hotkeys, while it is active.
4. **`target`.** Only while focus is on one element or inside it. If nothing there can take focus, give the element `tabindex="0"`.

When nesting scopes, stacking dialogs, or keeping some hotkeys working during an exclusive scope, read [scopes](references/scopes.md).

## Pitfalls

- **A disabled hotkey doesn't block the browser.** With `enabled: false`, `Mod+S` opens the Save Page dialog. Add `preventDefault: 'always'` to keep the action blocked while the hotkey can't fire, whether it's disabled or its scope is off. Skip it for hotkeys turned off to give the key back to the browser, such as `Mod+C`, `Mod+Z`, `Tab`, or single keys behind a user's off switch. Don't keep the hotkey enabled and return early from the callback; the hotkey would also stay `active` in app hotkey lists and show its hint.
- **Modifiers match exactly.** `ArrowDown` never fires while Shift is held, so register `Shift+ArrowDown` instead of checking `event.shiftKey`. Shift that a symbol needs is the exception: `?` matches Shift+/. With Command held, macOS reports the unshifted character, so write the Shift there: `Mod+Shift+/` for Cmd+?, not `Mod+?`, and `Mod+Shift+=` beside `Mod+=` for zooming in with Cmd++.
- **Chords repeat while held.** Set `requireReset: true` on toggles, or holding the keys flickers them.
- **Key names are case-sensitive.** Write `Escape`, `ArrowUp`, `F1`, and `+` as the types spell them; `escape`, `Esc`, `f1`, and `Plus` never match. Only letters match in any case. Hotkeys from plain JavaScript or saved data skip the types, so check them with `validateHotkey`. Its errors and warnings are reason codes such as `{ reason: 'unknown-key', part: 'escape' }`, not text, so map them to your own messages. A modifier-only hotkey, or one with an unknown modifier such as `Ctl+K`, registers nothing.
- **Letters follow the typed character.** For position-based controls such as WASD, use physical bindings such as `'[KeyW]'`. Keep letters for mnemonic commands such as `Mod+S`.
- **Keys of other layouts need a registration.** Hotkey strings accept US QWERTY punctuation, so `Mod+Ö` is a type error. Don't cast it: augment `Register` in the adapter module with `keys`, such as `keys: UsKeys | GermanKeys`. It changes types only, not matching. The sets replace the US keys, so keep `UsKeys` unless the app drops US punctuation. A-Z, 0-9, named keys and physical codes always type-check. Prefer the US binding for a key everyone has: `Mod+;` already fires on German Ctrl+Ö.
- **Each open exclusive scope needs its own name.** A reusable dialog with a fixed scope name breaks when one dialog opens another: both share one scope and both handle `Escape`. Build the name per instance.
- **A chord on a sequence's first key runs every time the sequence starts.** With `G` and `['G', 'G']`, the first `G` runs the chord. Later keys belong to the sequence. To show "waiting for the next key", read `matchedStepCount` from the adapter's registrations list.
- **A sequence that starts a longer one doesn't wait for it.** With `['G', 'G']` and `['G', 'G', 'G']`, three G presses run both, with no warning. Pick sequences where neither one starts the other.
- **Escape goes to the innermost overlay.** Hotkeys outside an open overlay skip Escape, so the overlay closes and the hotkey doesn't run. Overlays are a native modal `<dialog>` (not with `closedby="none"`), a non-modal one with `closedby="any"` or `"closerequest"`, an open popover (not `popover="manual"`), and, around focus, an element with `role="dialog"`, `"alertdialog"` or `"menu"`, an expanded combobox, or a popup button with `aria-expanded="true"`. A hotkey targeted inside the overlay keeps Escape. So:
  - Build your own dialogs and popovers on `<dialog>` with `showModal()` and on `popover` or `popover="auto"`, and don't register `Escape` to close them; the browser does. A `popover="manual"` popover doesn't close on Escape, so close it with an `Escape` hotkey targeted at it. For a dialog users can't dismiss, use `<dialog closedby="none">`, not `role="dialog"`, and also call `preventDefault()` on its `cancel` event for browsers without `closedby`.
  - When your code closes an overlay, target its `Escape` at the overlay element. A global `Escape` skips the overlay it means to close, with no error. Registering it in an ARIA dialog's own scope also works.
  - Use a global `Escape` only for actions that apply when nothing is open, such as clearing a selection. Turn it off with `enabled: !open`, or give the overlay an exclusive scope, while an overlay without focus inside or without one of these roles is open. Keep its default `preventDefault`: with `'always'`, it still prevents Escape while it's off, and an overlay that checks `defaultPrevented` stays open.
  - Keep `Escape` out of page-section scopes and sequences. While focus is in a `role="dialog"` or `"alertdialog"` element, any hotkey in a named scope keeps Escape, whatever its target, so a section's `Escape` takes it from a library's dialog. An open combobox or menu inside the dialog still closes first, and native dialogs and popovers get Escape before every hotkey outside them, whatever its scope.
- **Libraries that prevent keys first.** For keys other than Escape that libraries such as Radix UI handle and prevent before the hotkey runs, set `ignoreDefaultPrevented: true` in the adapter's shared defaults (on each hotkey in Lit).
- **Single-character shortcuts need an off switch.** For WCAG 2.1.4, `K`, `?`, and `['G', 'H']` need a user setting passed as `enabled`, or an app hotkey users can remap.
- **react-hotkeys-hook names don't carry over.** `useHotkeys` and `HotkeysProvider` share names, not signatures: there's no dependency array, `preventDefault` is on by default, and sequences are arrays. Remove the old library, so two libraries don't handle the same keys.
- **Install only the adapter.** A separately installed `@tanstack/hotkeys` at another version is a second copy, and scopes don't apply across copies.
- **A changed array or element in `meta` doesn't re-render lists on its own.** Registration lists re-render when a new `meta` changes a string, number, or boolean field. Editing a `meta` object already passed doesn't. A new array, object, element, or function replaces the old one without re-rendering them, which is what lets `meta` be written inline. To show a changed icon or keyword list, also change a primitive field.
- **Server-rendered labels need the user's platform.** A server renders Linux labels without a platform, because it can't see the user's OS. Read the request's `User-Agent` header, pass `detectPlatform(userAgent)` as the platform of the adapter's provider or scope, and format labels with the adapter's formatter, such as `useFormatForDisplay`. Those pages then depend on the user agent, so keep them out of shared caches or add the platform to the cache key.

When writing tests for hotkeys, read [testing](references/testing.md).

## API discovery

Read the installed declarations for exact signatures: the adapter's `dist/*.d.ts`, then the core's `hotkey.types.d.ts` (hotkey strings) and `hotkey-manager.d.ts` (`HotkeyOptions`). With pnpm, the core package sits beside the adapter: `ls "$(realpath node_modules/@tanstack/react-hotkeys)/../hotkeys/dist"`, using your adapter's name.
