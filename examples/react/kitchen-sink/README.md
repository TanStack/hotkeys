# Hotkeys kitchen sink

A TanStack Router application demonstrating shortcuts owned by the components that use them. Run `pnpm dev` from this directory after building the workspace packages.

| Location   | Features                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout     | `HotkeysProvider` defaults, global bulk hotkeys, physical code strings, held-modifier hints, live hotkey/sequence registration views grouped by `meta.group`, devtools                        |
| Tickets    | `useHotkey`, enabled state, shared button/shortcut handlers, `ignoreInputs`, modifier hints                                                                                                   |
| Editor     | `useHotkeys`, ref targets, duplicate bindings in independent scopes, `preventDefault`, `stopPropagation`, `requireReset`, keyup events                                                        |
| Sequences  | Single/bulk sequences, progress, configurable timeout                                                                                                                                         |
| Recording  | Single/sequence recorders, code/key modes, conflict exclusions, custom validation and rejection, cancellation, Backspace editing/clear, manual/Enter/idle commit, local-state rebinding/reset |
| Formatting | Platform overrides, independent symbols, parts/keycaps, logical/physical bindings and literal plus                                                                                            |
| Footer     | Held logical keys, physical codes, `useKeyHold`, activity log                                                                                                                                 |

Opening the shortcut panel retains the current route's registrations. Changing routes removes local registrations and keeps layout registrations. Disabled entries stay visible. Group metadata does not change execution scope.

Bindings are controlled by ordinary React state. Reset uses a constant. Unmounting the recording route discards its customizations. An application can persist that state if needed; no second registry or preferences framework is required.

Physical bindings use bracketed code tokens, such as `Alt+[KeyS]`. Display shortens Key/Digit prefixes and preserves numpad labels. Supply a resolved layoutMap for layout-specific labels. Browser/OS shortcuts can intercept events before the application receives them.

## Interaction checklist

- Hold Option/Alt to reveal relevant hints. Release or blur to hide them; extra unrelated modifiers hide them too.
- Create a ticket with the button or Alt + physical KeyC. Disable actions and inspect their disabled registry entries.
- Focus one editor and press Mod + physical KeyS. Only that editor's save count changes.
- Navigate routes, open the shortcut panel, and verify only global/current-route registrations remain.
- Start recording: Alt+1 rejects a navigation conflict without navigating. A bare letter fails custom validation. Option+S records `Alt+[KeyS]`; replay fires only after recording finishes. Reset restores `Alt+[KeyR]`.
- Record one sequence step and commit: it remains editable after rejection. Add a second, commit, and replay. Backspace removes steps; empty Backspace restores the default.
- Compare `Control++` keycaps: the plus key is its own token.
