---
title: Sensible Defaults and Keyboard Layouts
id: sensible-defaults
description: How TanStack Hotkeys handles platforms, keyboard layouts, text inputs, and browser behavior by default, and how to change each default.
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
| Hotkeys that can't fire | The browser acts on the key | `preventDefault: 'always'` |
| When a chord fires | On keydown, and again on each automatic repeat while held | `eventType`, `requireReset` |
| Where listeners attach | `document` | `target` |
| When hotkeys run | After the keyboard handlers of widgets inside the target (bubble phase) | `capture` |
| Time between sequence steps | 1 second | `timeout` |
| Duplicate registrations | Allowed, with a console warning in development | `conflictBehavior` |
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
- **Dead keys and the digit row.** A dead key reports `Dead`, and AZERTY's digit row types `&` and `é` for `1` and `2`. The key's position resolves the shortcut, so `Mod+1` works on AZERTY.
- **Symbols typed with Shift.** Shift+1 types `!` on a US layout, and `Shift+1` still matches.

Otherwise, the character the key reports wins, wherever the key sits:

- ASCII letters never fall back, and ASCII symbols fall back only on the digit row or with Shift. On AZERTY, the key in the US `/` position types `+`, so Cmd++ zooms the page instead of firing `Mod+/`. On Dvorak, the key that types `'` does not fire `Q`.
- Latin letters such as `ü`, `ö`, and `ø` match only themselves when typed on their own. With Control or Command held on a punctuation key they fall back, so German Cmd+ü still fires `Mod+[` (German types `[` with Option).
- Named keys never fall back. With NumLock off, the numpad's 1 key reports `End`, so it fires `End` and not `1`.

When one key press could match several registrations on the same target, an exact match takes priority over a fallback.

A symbol that needs Shift on some layouts, such as `/` on German QWERTZ (Shift+7), matches when typed on its own. With Command held, macOS browsers report the unshifted character instead (`7`), so `Mod+/` can't match there. Register the per-layout combination as well, such as `Mod+Shift+7`.

Letters match without regard to case: `S` and `s` are the same binding.

### Match a key's position instead

When a shortcut should follow a position rather than a character, such as `W`/`A`/`S`/`D` movement in a game, use a physical binding. Physical bindings match `event.code` exactly and ignore the layout:

| Binding | Matches |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | The character S (`event.key`), with the fallbacks above |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | The key in the S position on a US layout (`event.code`) |
| `Enter` | Either Enter key, including the numpad's |
| `[Enter]` or `[NumpadEnter]` | Only that Enter key |

On a layout where the `KeyQ` position types `a`, `A` follows the character and `[KeyQ]` follows the position.

- In strings, every physical code goes in brackets, including codes that share a name with a logical key, such as `[Enter]` and `[F13]`. Codes are type-checked and autocomplete in your editor.
- In objects, use the `code` field for a physical binding and `key` for a logical one. A binding has one or the other, never both, and `key` never takes brackets.
- In a chord's callback, `context.parsedChord.code` is set only for physical bindings. The same goes for each step in a sequence's `context.parsedSequence`. Check `code !== undefined` before reading it.
- `formatForDisplay` labels physical bindings without brackets, so `Mod+[KeyS]` displays as `⌘ S` on macOS. The stored binding keeps its brackets.

The [hotkey recorder](#recording-captures-what-the-user-pressed) records positions by default, so recorded hotkeys are physical bindings.

## Modifiers must match exactly

`Mod+S` does not fire for `Mod+Shift+S`, and `K` does not fire for `Shift+K`. Exact matching lets `Mod+Z` (undo) and `Mod+Shift+Z` (redo) coexist without one swallowing the other.

The exception is Shift that is needed to type a symbol. On a US layout, `?` is typed with Shift+/, so `?` matches without listing `Shift`. This applies to printable symbols, not letters, so `K` and `Shift+K` remain different bindings.

Two kinds of key events never match ordinary shortcuts:

- **AltGr.** On Windows and Linux, AltGr types characters such as `@` and `€` on many layouts. A character it types matches a binding for that character, but never a `Control+Alt` shortcut, so typing an email address does not run a command. When AltGr+key types nothing new, such as AltGr+Home, or AltGr+F on a layout with nothing on that key, it does not fire `Home` or `F`. Windows reports AltGr as Control+Alt, so there it fires `Control+Alt` shortcuts instead: AltGr+Home triggers `Control+Alt+Home`, as in native Windows apps.
- **IME composition.** While the user composes text with an input method editor, such as for Japanese, Chinese, or Korean, no hotkey fires, because the editor uses those keys: Enter commits the text, Escape cancels it, and the arrow keys pick a candidate. This includes the Enter that Safari sends right after composition ends.

## Typing in inputs does not trigger shortcuts

A hotkey bound to `K` should not fire while the user types "okay" into a text field. By default, `ignoreInputs` is `'auto'`, which chooses from the hotkey itself:

| Hotkey | Default | Reason |
| --- | --- | --- |
| `K`, `Shift+K`, `Alt+K`, `?` | Ignored in inputs | These keys type text |
| `Mod+S`, `Control+K`, `Meta+Enter` | Fire in inputs | Control and Meta chords don't type text, and users expect save and similar commands to work from a field |
| `Escape` | Fires in inputs | Users expect Escape to close a dialog even when a field inside it has focus |

For a sequence, the first step decides, so `['G', 'G']` is ignored in inputs.

These count as inputs, including inside open shadow roots:

- Text-entry inputs, such as `text`, `search`, `email`, `number`, and the date and time types, unless they are read-only
- Textareas that aren't read-only, and selects
- `contenteditable` elements, and elements with `role="textbox"` or `role="searchbox"`
- Custom elements that may hide a text field: a host whose focus is inside a closed shadow root, and a form-associated custom element without a `role` attribute

Checkbox, radio, range, color, file, and button-type inputs are not text fields, so `K` still fires while one has focus. They keep only the keys they use (see [Focused controls keep their own keys](#focused-controls-keep-their-own-keys)). A form-associated custom element that isn't a text field can set a `role` attribute, such as `role="checkbox"`, to get the same treatment.

A hotkey whose `target` is the input itself always receives that input's events.

Set `ignoreInputs: true` or `false` to choose explicitly. For example, set `ignoreInputs: false` on an `Enter` hotkey that submits a form, so it works while focus is in the form's text fields.

## Focused controls keep their own keys

Buttons, links, and ARIA widgets also use keys for themselves. A hotkey bound to `Enter` should not stop a focused button from clicking, and a hotkey bound to `ArrowDown` should not also run while the user moves through an open menu. When `ignoreInputs` is on, a hotkey skips these keys while such a control has focus:

| Focused control | Keys it keeps |
| --- | --- |
| `<button>`, button-type, image, color, and file inputs, `<summary>`, `role="button"` | Enter, Space |
| Checkbox inputs | Space |
| Radio inputs | Arrow keys, Space |
| Range inputs | Arrow keys, Home, End, Page Up, Page Down |
| Read-only text inputs | Left, Right, Home, End |
| Read-only textareas | Arrow keys, Home, End, Page Up, Page Down |
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

Both apply only when a hotkey matches; every other key press is left alone. For a sequence, every step that advances it calls `preventDefault`, so the browser doesn't act on `Mod+K` in `['Mod+K', 'Mod+C']`. Propagation stops only on the last step, so earlier steps still reach other listeners. Set either option to `false` when you want to observe a shortcut without taking it over.

Some browser and operating system shortcuts never reach the page and cannot be overridden. Browsers keep `Mod+T`, `Mod+N`, and `Mod+W` for opening and closing tabs and windows, and the operating system keeps shortcuts such as `Alt+Tab` and `Command+Tab`. Pick other keys for your app.

## Hotkeys that can't fire leave the key alone

A hotkey that can't fire, because it's disabled or its scope is inactive or suspended, doesn't call `preventDefault`, so the browser acts on the key. Pressing `Mod+S` while a save hotkey is disabled opens the browser's Save Page dialog.

For most hotkeys, keeping the browser's action prevented is better, and we recommend `preventDefault: 'always'`. With it, a chord that can't fire still calls `preventDefault` when its keys are pressed:

- It never stops propagation, so other listeners still receive the key.
- It still skips typing in text fields when `ignoreInputs` does.
- When another hotkey handles the key, that hotkey's options apply instead.
- Sequences treat `'always'` as `true`.

To use it for every hotkey, set it in your adapter's shared defaults, as shown in [Changing the defaults](#changing-the-defaults).

It isn't the default because turning a hotkey off is often how an app hands a key back to the browser. With `'always'`, these hotkeys keep blocking the browser while they're off:

- **Editing and clipboard shortcuts.** A grid that enables `Mod+C`, `Mod+A`, or `Mod+Z` only while cells are selected blocks native copy, select all, and undo the rest of the time. `Mod` chords fire in text fields by default, so this includes undo while typing.
- **Single keys behind an [off switch](#single-key-shortcuts-need-an-off-switch).** When a user turns off single-key shortcuts, `Space` and the arrow keys still don't scroll, and `/` still doesn't open Firefox's quick find.
- **Focus and native dialogs.** A disabled `Tab` hotkey keeps focus from moving off buttons and links, and a disabled `Escape` hotkey stops a native `<dialog>` from closing.

If you set `'always'` in shared defaults, set `preventDefault: true` on hotkeys like these, so the browser takes over while they're off.

## Single-key shortcuts need an off switch

Ignoring inputs keeps a `K` hotkey from firing while the user types in a field, but it does not cover every case. Speech input users dictate words that arrive as key presses, and a stray key press can run a command. [WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html) requires that a shortcut made of a single letter, number, punctuation, or symbol key meets at least one of these conditions:

- **Users can turn it off.** Pass `enabled` from a user setting.
- **Users can remap it** to include a modifier such as Control. App hotkeys let users rebind or unbind any hotkey you declare.
- **It only works while a component has focus.** Set `target` to that component's element.

Shortcuts with `Mod`, Control, or Alt, and keys that don't type characters, such as `Escape` and the function keys, are not affected. Shift doesn't count as a modifier here, because `Shift+K` still types a letter.

## Chords fire on keydown and repeat while held

Chords fire on `keydown`, when the user presses the key, rather than on release. Holding a key fires the chord again on each automatic repeat, as holding Control+Z in a text editor repeats undo.

For a toggle, such as opening and closing a panel, repeating is usually wrong: holding the key would make the panel flicker. Set `requireReset: true` to fire once per press. Releasing the key or any of its modifiers allows the chord to fire again. So does a new press that isn't an automatic repeat, so a lost keyup, such as the one macOS drops while Command is held, never blocks the chord.

Set `eventType: 'keyup'` to fire on release instead, for example to end a mode that started when a key went down.

## Listeners attach to the document

Hotkeys listen on `document` by default, so they work wherever focus is in the page. The library attaches one `keydown` and one `keyup` listener per target, plus another pair if any hotkey on that target uses `capture`, however many hotkeys are registered.

To limit a hotkey to part of the page, set `target` to an element. The element receives keyboard events only while it, or something inside it, has focus, so make sure it is focusable, for example with `tabIndex`.

A hotkey registered from the page can also target the document, window, or an element of a same-origin iframe or popup window. The hotkey then listens in that frame, and typing in the frame's inputs is ignored the same way as in the page.

No listeners are attached during server rendering.

## Hotkeys run after the page's own handlers

Hotkeys listen during the bubble phase, so a focused widget's own keyboard handler runs first. If a tab strip, editor, or menu handles a key and stops propagation, your hotkey never sees it. Usually that is what users expect: the widget they are working in should win.

Set `capture: true` when an app-level shortcut has to win anyway. It works with both `keydown` and `keyup` hotkeys. For example, a tab strip that ignores modifiers might treat `Mod+Backspace` as Backspace and close a tab before a document-level "close view" hotkey runs. With `capture: true`, the hotkey runs first, and the default `stopPropagation: true` keeps the key from the tab strip. Set `stopPropagation: false` if the widget should still receive it.

Capture doesn't change which keys a hotkey skips. Typing in inputs and keys that focused controls keep for themselves are still skipped while `ignoreInputs` is on.

## Sequences allow 1 second between steps

A sequence such as `['G', 'G']` completes when each step follows the previous one within 1 second. One second is long enough for deliberate typing and short enough that two unrelated key presses rarely combine. Change it with `timeout`.

Sequences are forgiving in a few other ways:

- **Pressing a modifier alone does not interrupt a sequence**, so steps can include modifiers: `['Shift+R', 'Shift+T']`.
- **Automatic repeats are not steps.** Holding `G` does not complete `['G', 'G']`.
- **A wrong key restarts the sequence.** If the wrong key is the sequence's first step, it begins a new attempt, so `G X G G` still completes `['G', 'G']`.
- **Progress clears when the timeout passes**, without waiting for another key press, so a UI that shows the pressed steps clears on time.

## Duplicate registrations warn

Registering a hotkey that is already registered on the same target logs a console warning in development, and both callbacks run. A warning surfaces accidental duplicates during development without breaking an app that intentionally shares a shortcut. Duplicates are compared in canonical form, so `Mod+S` and `Meta+S` are duplicates on macOS.

Set `conflictBehavior` to `'replace'` to replace the existing registration, `'error'` to throw, or `'allow'` to silence the warning.

TanStack Hotkeys logs warnings only in development. Production builds, where bundlers set `process.env.NODE_ENV` to `'production'`, skip them and drop the warning code.

## Recording captures what the user pressed

The hotkey recorder records physical key positions by default (`recordBy: 'code'`). A modifier can change which character a key types (Option+S types `ß`, and Shift+1 types `!`), but its position does not change. Recording the position saves the key the user pressed, regardless of what it typed. Set `recordBy: 'key'` to record characters instead.

While recording:

- **Escape** cancels.
- **Backspace** or **Delete** removes the last step, or clears an empty recording.
- **Enter** commits a sequence recording, made with `maxSteps: Infinity`.
- **Registered hotkeys are paused**, so pressing `Mod+S` to record it does not also save.
- **Typing in inputs passes through**, so other fields on the page keep working. Escape still cancels.
- **AltGr is rejected** for position recordings, because it types characters rather than shortcuts. The exception is AltGr with a key it does not change on Windows, such as AltGr+Home, which records as Control+Alt.

## Held keys reset when the window loses focus

Key state tracking marks a key as held on keydown and releases it on keyup. If the window loses focus while a key is down, such as when the user switches apps with Command+Tab, the browser never delivers the keyup. Held keys are therefore cleared when the window loses focus, and when the page is hidden, such as when the user switches tabs. A native context menu also takes the keyup, so opening one, with the ContextMenu key or a right-click, clears every held key except the modifiers the event still reports. A context menu the page shows itself, by calling `preventDefault()` on the `contextmenu` event, keeps focus and clears nothing.

On macOS, the system can also swallow the keyup of a key pressed with Command. Releasing a modifier clears any other keys still marked as held, so no key is stuck.

Some system shortcuts swallow a modifier's own keyup without taking focus from the page, such as Command+Shift+4 for a screenshot on macOS, or the DevTools inspect shortcut. Every keyboard and mouse event reports which modifiers are down, so the next key press, mouse movement, or click releases any modifier it reports as up. Only real user input counts: events that page code dispatches report no modifiers, so the tracker ignores them for this. Until such an event arrives, the modifier stays held, because nothing distinguishes a missed release from a long hold.

## Display matches the platform

`formatForDisplay` uses each platform's conventions. On macOS, `Mod+Shift+S` displays as `⇧ ⌘ S`. On Windows and Linux, it displays as `Ctrl+Shift+S`. Sequence steps are separated by a space: `G G`.

Pass `useSymbols: false` for text labels on macOS, or `keyLabels` to rename individual keys.

## Changing the defaults

Every option above can be set on a single registration. To change a default for many hotkeys at once, set it in your framework adapter's shared defaults.

<!-- ::start:framework -->

# React

Pass `defaultOptions` to `HotkeysProvider`. See [Hotkey options](../framework/react/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Preact

Pass `defaultOptions` to `HotkeysProvider`. See [Hotkey options](../framework/preact/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Solid

Pass `defaultOptions` to `HotkeysProvider`. See [Hotkey options](../framework/solid/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Angular

Pass `defaultOptions` to `provideHotkeys`. See [Hotkey options](../framework/angular/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Vue

Pass `default-options` to `HotkeysProvider`. See [Hotkey options](../framework/vue/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Svelte

Pass `defaultOptions` to `HotkeysProvider`. See [Hotkey options](../framework/svelte/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Lit

Lit has no shared defaults. Pass options to each hotkey, and share an options object between hotkeys that need the same ones. See [Share options](../framework/lit/guides/hotkeys.md#share-options) in Register Hotkeys.

# Alpine

Pass default options to `createHotkeysScope`. See [Hotkey options](../framework/alpine/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Ember

Pass default options to `createHotkeysScope`. See [Hotkey options](../framework/ember/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

# Octane

Pass `defaultOptions` to `HotkeysProvider`. See [Hotkey options](../framework/octane/guides/hotkeys.md#hotkey-options) in Register Hotkeys.

<!-- ::end:framework -->
