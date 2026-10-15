---
title: Sensible Defaults
id: sensible-defaults
---

Register `Mod+S` with no options and it behaves the way users expect: Command+S on macOS, Control+S elsewhere, the browser's Save dialog stays closed, it still works while the user is typing in a text field, and it works on any keyboard layout. TanStack Hotkeys chooses its defaults so the common case needs no configuration.

This guide describes each default, why it was chosen, and how to change it.

## At a glance

| Behavior | Default | Change it with |
| --- | --- | --- |
| `Mod` modifier | Command on macOS, Control on Windows and Linux | `platform` |
| Key identity | The character the key types (`event.key`), with a fallback to the key's position | `[KeyS]` physical bindings |
| Modifiers | Must match exactly | List every modifier in the binding |
| Typing in inputs | Single keys and `Shift`/`Alt` chords are ignored; `Control`/`Meta` chords and `Escape` fire | `ignoreInputs` |
| Browser behavior | Prevented, and the event stops propagating | `preventDefault`, `stopPropagation` |
| When a chord fires | On keydown, and again on each automatic repeat while held | `eventType`, `requireReset` |
| Where listeners attach | `document` | `target` |
| When hotkeys run | After the keyboard handlers of widgets inside the target (bubble phase) | `capture` |
| Time between sequence steps | 1 second | `timeout` |
| Duplicate registrations | Allowed, with a console warning | `conflictBehavior` |
| Recording | Records key positions; Escape cancels | `recordBy`, recorder options |
| Display | Symbols on macOS (`⇧ ⌘ S`), text elsewhere (`Ctrl+Shift+S`) | `formatForDisplay` options |

## `Mod` follows the platform

`Mod` is the platform's primary shortcut modifier: Command (`Meta`) on macOS and Control on Windows and Linux. Write `Mod+S` once and each user gets the save shortcut their operating system has trained them to use. The platform is detected from `navigator`. During server rendering, where there is no `navigator`, it is `linux`.

Hotkeys are stored in a canonical form, so equivalent spellings are the same binding. On Windows and Linux, `Control+S` and `ctrl+s` are stored as `Mod+S`. On macOS, `Control+S` remains `Control+S`, because Control is not the primary modifier there. This is why two spellings conflict on one platform and not on another.

Pass `platform: 'mac' | 'windows' | 'linux'` to override detection, for example in tests or to preview another platform's shortcuts.

## Keys match the character the user types

A logical binding such as `Mod+S` or `?` matches `event.key`, the character the key produces on the active keyboard layout. A user on Dvorak, Colemak, or AZERTY presses the key labeled S to trigger `Mod+S`, wherever that key sits on their keyboard. Matching the key's position (`event.code`) instead would make `Mod+Z` fire on the AZERTY key labeled W, and on Dvorak would turn the key labeled X into a different shortcut.

`event.key` is not always useful, so the matcher falls back to the key's conventional position when the character cannot identify the shortcut:

- **Non-Latin layouts.** On a Russian layout, the S position types `ы`. `Mod+S` still matches there, so shortcuts work without switching layouts.
- **macOS Option.** Option changes the character, so Option+S types `ß`. `Alt+S` still matches.
- **Dead keys and shifted characters.** A dead key reports `Dead`, and AZERTY's digit row types `é` for `2`. The key's position resolves the shortcut.

ASCII letters never fall back. If a key types `x`, it matches `X` and nothing else, so a positional fallback can never hijack a Dvorak or Colemak user's shortcut. When one key press could match several registrations on the same target, an exact match takes priority over a fallback.

Letters match without regard to case: `S` and `s` are the same binding.

When a shortcut should follow a position rather than a character, such as `W`/`A`/`S`/`D` movement in a game, use a physical binding with a bracketed code: `[KeyW]`. Physical bindings match `event.code` exactly and ignore the layout.

## Modifiers must match exactly

`Mod+S` does not fire for `Mod+Shift+S`, and `K` does not fire for `Shift+K`. Exact matching lets `Mod+Z` (undo) and `Mod+Shift+Z` (redo) coexist without one swallowing the other.

The exception is Shift that is needed to type a symbol. On a US layout, `?` is typed with Shift+/, so `?` matches without listing `Shift`. This applies to printable symbols, not letters, so `K` and `Shift+K` remain different bindings.

Two kinds of key events never match ordinary shortcuts:

- **AltGr.** On Windows and Linux, AltGr types characters such as `@` and `€` on many layouts and reports itself as Control+Alt. Those key presses do not trigger `Control+Alt` shortcuts, so typing an email address does not run a command.
- **IME composition.** While the user composes text with an input method editor, such as for Japanese, Chinese, or Korean, character and physical bindings do not fire. Named keys such as `Escape` still do.

## Typing in inputs does not trigger shortcuts

A hotkey bound to `K` should not fire while the user types "okay" into a text field. By default, `ignoreInputs` is `'auto'`, which chooses from the hotkey itself:

| Hotkey | Default | Reason |
| --- | --- | --- |
| `K`, `Shift+K`, `Alt+K`, `?` | Ignored in inputs | These keys type text |
| `Mod+S`, `Control+K`, `Meta+Enter` | Fire in inputs | Control and Meta chords don't type text, and users expect save and similar commands to work from a field |
| `Escape` | Fires in inputs | Users expect Escape to close a dialog even when a field inside it has focus |

For a sequence, the first step decides, so `['G', 'G']` is ignored in inputs.

Text inputs, textareas, selects, and `contenteditable` elements count as inputs, including inside shadow DOM. Button-type inputs (`type="button"`, `"submit"`, and `"reset"`) do not, so shortcuts still work when the user has tabbed to a form button. A hotkey whose `target` is the input itself always receives that input's events.

Set `ignoreInputs: true` or `false` to choose explicitly.

## Focused controls keep their own keys

Buttons, links, and ARIA widgets also use keys for themselves. A hotkey bound to `Enter` should not stop a focused button from clicking, and a hotkey bound to `ArrowDown` should not also run while the user moves through an open menu. When `ignoreInputs` is on, a hotkey skips these keys while such a control has focus:

| Focused control | Keys it keeps |
| --- | --- |
| `<button>`, button-type inputs, `<summary>`, `role="button"` | Enter, Space |
| Links with an `href`, `role="link"` | Enter |
| `role="checkbox"`, `"switch"`, `"radio"` | Space |
| `role="tab"`, `"option"`, `"treeitem"`, `"menuitem"` (and its checkbox and radio forms) | Enter, Space |
| `role="menu"`, `"menubar"`, `"tree"` | Arrow keys, Home, End, Enter, Space, and typed characters |
| `role="listbox"` | Up and Down (Left and Right with `aria-orientation="horizontal"`), Home, End, Enter, Space, and typed characters |
| `role="combobox"` without a text field | Up, Down, Home, End, Enter, Space, and typed characters |
| `role="tablist"` | Left and Right (Up and Down with `aria-orientation="vertical"`), Home, End, Enter, Space |
| `role="toolbar"` | Left and Right (Up and Down with `aria-orientation="vertical"`), Home, End |
| `role="grid"`, `"treegrid"` | Arrow keys, Home, End, Page Up, Page Down, Enter, Space |
| `role="radiogroup"` | Arrow keys, Space |
| `role="slider"` | Arrow keys, Home, End, Page Up, Page Down |
| `role="spinbutton"` | Up, Down, Home, End, Page Up, Page Down |

The keys follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/) keyboard patterns. A control counts while it, or an element inside it, has focus, so arrow keys in a menu item belong to the menu. Typed characters are the menu, listbox, or tree's typeahead search.

Control, Meta, and Alt shortcuts are never skipped. Enter and Space are skipped only without modifiers. Navigation keys and typed characters are also skipped with Shift, which widgets use to extend a selection.

A control counts only when it is inside the hotkey's `target`. A hotkey targeted at a dialog skips Enter while the dialog's Cancel button has focus, but a hotkey targeted at a listbox receives the listbox's arrow keys, so the listbox can implement its own navigation with hotkeys. Set `ignoreInputs: false` to handle every key regardless of focus.

The recorder only skips text fields, so it can record Enter or Space while the button that started recording still has focus.

## The browser's action is prevented

`preventDefault` and `stopPropagation` are `true` by default. Most shortcuts exist to replace a browser action: binding `Mod+S` to save a document should not also open the browser's Save Page dialog, and binding `Mod+K` to a command palette should not also focus the address bar. Stopping propagation keeps one key press from running both your shortcut and another listener higher in the page.

Both apply only when a hotkey matches; every other key press is left alone. Set either to `false` when you want to observe a shortcut without taking it over.

Some browser and operating system shortcuts, such as closing a tab or switching windows, never reach the page and cannot be overridden.

## Chords fire on keydown and repeat while held

Chords fire on `keydown`, when the user presses the key, rather than on release. Holding a key fires the chord again on each automatic repeat, as holding Control+Z in a text editor repeats undo.

For a toggle, such as opening and closing a panel, repeating is usually wrong: holding the key would make the panel flicker. Set `requireReset: true` to fire once per press. Releasing the key or any of its modifiers allows the chord to fire again.

Set `eventType: 'keyup'` to fire on release instead, for example to end a mode that started when a key went down.

## Listeners attach to the document

Hotkeys listen on `document` by default, so they work wherever focus is in the page. The library attaches one `keydown` and one `keyup` listener per target, plus another pair if any hotkey on that target uses `capture`, however many hotkeys are registered.

To limit a hotkey to part of the page, set `target` to an element. The element receives keyboard events only while it, or something inside it, has focus, so make sure it is focusable, for example with `tabIndex`.

A hotkey registered from the page can also target the document, window, or an element of a same-origin iframe or popup window. The hotkey then listens in that frame, and typing in the frame's inputs is ignored the same way as in the page.

No listeners are attached during server rendering.

## Hotkeys run after the page's own handlers

Hotkeys listen during the bubble phase, so a focused widget's own keyboard handler runs first. If a tab strip, editor, or menu handles a key and stops propagation, your hotkey never sees it. Usually that is what users expect: the widget they are working in should win.

Set `capture: true` when an app-level shortcut has to win anyway. For example, a tab strip that ignores modifiers might treat `Mod+Backspace` as Backspace and close a tab before a document-level "close view" hotkey runs. With `capture: true`, the hotkey runs first, and the default `stopPropagation: true` keeps the key from the tab strip. Set `stopPropagation: false` if the widget should still receive it.

Capture doesn't change which keys a hotkey skips. Typing in inputs and keys that focused controls keep for themselves are still skipped while `ignoreInputs` is on.

## Sequences allow 1 second between steps

A sequence such as `['G', 'G']` completes when each step follows the previous one within 1 second. One second is long enough for deliberate typing and short enough that two unrelated key presses rarely combine. Change it with `timeout`.

Sequences are forgiving in a few other ways:

- **Pressing a modifier alone does not interrupt a sequence**, so steps can include modifiers: `['Shift+R', 'Shift+T']`.
- **Automatic repeats are not steps.** Holding `G` does not complete `['G', 'G']`.
- **A wrong key restarts the sequence.** If the wrong key is the sequence's first step, it begins a new attempt, so `G X G G` still completes `['G', 'G']`.

## Duplicate registrations warn

Registering a hotkey that is already registered on the same target logs a console warning, and both callbacks run. A warning surfaces accidental duplicates during development without breaking an app that intentionally shares a shortcut. Duplicates are compared in canonical form, so `Mod+S` and `Meta+S` are duplicates on macOS.

Set `conflictBehavior` to `'replace'` to replace the existing registration, `'error'` to throw, or `'allow'` to silence the warning.

## Recording captures what the user pressed

The hotkey recorder records physical key positions by default (`recordBy: 'code'`). A modifier can change which character a key types (Option+S types `ß`, and Shift+1 types `!`), but its position does not change. Recording the position saves the key the user pressed, regardless of what it typed. Set `recordBy: 'key'` to record characters instead.

While recording:

- **Escape** cancels.
- **Backspace** or **Delete** removes the last step, or clears an empty recording.
- **Enter** commits a multi-step recording before it reaches `maxSteps`.
- **Registered hotkeys are paused**, so pressing `Mod+S` to record it does not also save.
- **Typing in inputs passes through**, so other fields on the page keep working. Escape still cancels.
- **AltGr is rejected** for position recordings, because it types characters rather than shortcuts.

## Held keys reset when the window loses focus

Key state tracking marks a key as held on keydown and releases it on keyup. If the window loses focus while a key is down, such as when the user switches apps with Command+Tab, the browser never delivers the keyup. Held keys are therefore cleared when the window loses focus.

On macOS, the system can also swallow the keyup of a key pressed with Command. Releasing a modifier clears any other keys still marked as held, so no key is stuck.

## Display matches the platform

`formatForDisplay` uses each platform's conventions. On macOS, `Mod+Shift+S` displays as `⇧ ⌘ S`. On Windows and Linux, it displays as `Ctrl+Shift+S`. Sequence steps are separated by a space: `G G`.

Pass `useSymbols: false` for text labels on macOS, or `keyLabels` to rename individual keys.

## Changing the defaults

Every option above can be set on a single registration. To change a default for many hotkeys at once, set it in your framework adapter's shared defaults.

<!-- ::start:framework -->

# React

See [Default options](../framework/react/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Preact

See [Default options](../framework/preact/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Solid

See [Default options](../framework/solid/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Angular

See [Default options](../framework/angular/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Vue

See [Default options](../framework/vue/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Svelte

See [Default options](../framework/svelte/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Lit

See [Default options](../framework/lit/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Alpine

See [Default options](../framework/alpine/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Ember

See [Default options](../framework/ember/guides/hotkeys.md#default-options) in the Hotkeys Guide.

# Octane

See [Default options](../framework/octane/guides/hotkeys.md#default-options) in the Hotkeys Guide.

<!-- ::end:framework -->
