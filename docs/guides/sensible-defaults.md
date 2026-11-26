---
title: Sensible Defaults and Keyboard Layouts
id: sensible-defaults
description: How TanStack Hotkeys handles platforms, keyboard layouts, text inputs, and browser behavior by default, and how to change each default.
---

TanStack Hotkeys chooses defaults so common shortcuts need no configuration. Without any options, `Mod+S` maps to Command+S on macOS and Control+S elsewhere, blocks the browser's Save dialog, keeps working inside text fields, and matches across keyboard layouts.

This guide explains each default and how to override it.

## At a glance

| Behavior | Default | Change it with |
| --- | --- | --- |
| `Mod` modifier | Command on macOS, Control on Windows and Linux | `platform` |
| Key identity | Character the key types (`event.key`), with position fallback | `[KeyS]` physical bindings |
| Modifiers | Exact match required | List every modifier in the binding |
| Typing in inputs | Single keys and `Shift` or `Alt` chords ignored, while `Control` or `Meta` chords, `Escape`, function keys, and media keys fire | `ignoreInputs` |
| Browser behavior | Calls `preventDefault()` and `stopPropagation()` when matched | `preventDefault`, `stopPropagation` |
| Disabled or inactive hotkeys | Browser acts on the key | `preventDefault: 'always'` |
| When a chord fires | On `keydown`, and on auto-repeat while held | `eventType`, `requireReset` |
| Listener target | `document` | `target` |
| Event phase | Bubble phase (after widget handlers inside target) | `capture` |
| Already-prevented keys | Hotkeys still fire | `ignoreDefaultPrevented` |
| Sequence step timeout | 1 second (`1000` ms) | `timeout` |
| Duplicate registrations | Allowed, with a development console warning | `conflictBehavior` |
| Recording | What the press typed, written as by hand, or a physical fallback. `Escape`, `Tab`, `Shift+Tab` cancel | `recordBy`, `recordTab`, recorder options |
| Display formatting | Symbols on macOS (`⇧ ⌘ S`), text elsewhere (`Ctrl+Shift+S`) | Label formatter options (such as `useFormatForDisplay`) |

## `Mod` follows the platform

`Mod` resolves to the platform's primary shortcut modifier: Command (`Meta`) on macOS, and Control on Windows and Linux. A single `Mod+S` binding adapts to each user's operating system automatically.

- **Platform detection.** Detected from `navigator` in the browser, defaulting to `'linux'` during server rendering where `navigator` doesn't exist. Pass `platform: 'mac' | 'windows' | 'linux'` to override detection in tests or when previewing another OS.
- **Canonical storage.** Hotkeys normalize to canonical strings. On Windows and Linux, `Control+S` and `ctrl+s` store as `Mod+S`. On macOS, `Control+S` stays `Control+S` because Control isn't the primary modifier. That's why `Mod+S` and `Control+S` collide on Windows and Linux, not on macOS.

## Keys match the character the user types

Logical bindings like `Mod+S` or `?` match `event.key`, which is the character produced on the user's active keyboard layout. Matching is case-insensitive, so `S` and `s` are identical. A user on Dvorak, Colemak, or AZERTY presses the key labeled `S` to trigger `Mod+S`, wherever it sits physically.

### When matching falls back to physical position

`event.key` doesn't always tell you which key was pressed, so the matcher falls back to the key's position (`event.code` or keycap identity) in four cases:

- **Non-Latin layouts.** On a Russian layout, the `S` key types `ы`. `Mod+S` still matches so shortcuts work without switching layouts.
- **macOS `Option`.** Option changes characters (`Option+S` types `ß`, German `Option+L` types `@`). `Alt+S` and `Alt+L` still match based on the letter printed on the key (`event.keyCode`, falling back to position when `keyCode` isn't a letter). On a French AZERTY Mac, `Alt+A` fires on the key labeled `A` (the US `Q` position).
- **Dead keys and the digit row.** Dead keys report `'Dead'`, and layouts like AZERTY type `&` and `é` on the unshifted digit row. Position fallback keeps `Mod+1` working.
  - *Zoom shortcut exception.* When a digit key types `-`, `+`, or `=` (such as `-` on AZERTY's `6` key), pressing `Control` (or `Command` on macOS) with it lets the browser zoom instead of firing `Mod+6`. `Ctrl+Shift+6` still fires `Mod+6`.
  - *Rare layouts without shifted digits.* Thai (`3` key) and Programmer Dvorak (`6` and `9` keys) don't type digits even with Shift. Add a physical fallback like `Mod+[Digit3]` if you need those keys everywhere.
- **Symbols typed with Shift on digits.** `Shift+1` types `!` on a US layout, and `Shift+1` still matches.
- **`Shift` with a US punctuation key.** `Shift+-` means the `_` that US `Shift+-` types, and `Shift+/` means `?`, wherever the layout puts them. On German QWERTZ, `Shift+-` fires on the key that types `_`, and `Shift+ß` (which types `?`) fires `Shift+/`, not `Shift+-`. Other symbols typed with `Shift` on a punctuation key, such as UK `Shift+'` typing `@`, keep the key's position.
- **Greek and Hebrew Q key.** Greek types `;` and Hebrew types `/` on the Q key. `Mod+Q` still fires there when the browser's legacy `keyCode` names Q: on Windows, and for Hebrew in Chromium and Firefox on Linux. Greek `Ctrl+Q` in Chromium on Linux reports the code of `;`, so it fires `Mod+;` and not `Mod+Q`. To catch it there too, also register `Mod+[KeyQ]` with the same callback. On a US keyboard, the physical binding then fires instead of `Mod+Q`, not with it. On AZERTY, `[KeyQ]` is the key labeled `A`, so add it only where Greek users need it.

### When the reported character wins (and layout quirks)

Outside the fallbacks above, the character the key types wins even if that key sits in a different spot than on US QWERTY:

- **Letters and non-digit symbols.** Outside the digit row, ASCII letters never fall back. ASCII symbols fall back only with `Shift` on a punctuation key, or when macOS `Option` typed them on a letter key. On AZERTY, the key in the US `/` position types `+`, so `Cmd++` zooms instead of firing `Mod+/`, and `Shift+,` types `?`, which fires `Shift+/` and not `Shift+M`. On Dvorak, typing `'` doesn't fire `Q`.
- **Dead keys pressed alone.** A dead key falls back to its position only on a letter key, on the digit row, or where US International puts its accent (`'` and `` ` ``). Swiss German `^` on the US `=` key doesn't fire `=`. With `Control`, `Alt` or `Command` held, a dead key keeps its position.
- **Accented Latin letters (`ü`, `ö`, `ø`).** Match only themselves when pressed alone, but fall back on punctuation keys when held with `Control` or `Command`. German `Cmd+ü`, for example, still triggers `Mod+[`.
- **Turkish `ı` and `İ`.** Treated as distinct letters, not case variants of `I` and `i`. `ı` and `İ` match only themselves. `I` matches `i` and `I`, and also falls back on `ı`, with an explicit `ı` binding taking priority.
- **macOS `Cmd+Shift+symbol`.** With `Command` held, macOS browsers report the unshifted key (`/` instead of `?`). On the key's US position, the press fires the character US `Shift` types there, as on Windows: `Cmd+Shift+/` fires `Mod+?`, and `Mod+Shift+/` too, which ranks first. `,` and `.` are exempt, because most layouts with them in the US position type `;` and `:` there with `Shift`, so `Cmd+Shift+,` and `Cmd+Shift+.` don't fire `Mod+<` and `Mod+>` on macOS; register `Mod+Shift+,` and `Mod+Shift+.` alongside them. `Mod+/` won't match because `Shift` is held. Bind `Mod+Shift+=` alongside `Mod+=` for zoom in. On German QWERTZ, symbols typed with `Shift` (such as `/` on `Shift+7`) also report the unshifted character (`7`) with `Command` on macOS, so register `Mod+Shift+7` as well. On Windows and Linux, `Ctrl+Shift+7` on QWERTZ fires `Mod+Shift+/` when registered, and `Mod+/` otherwise. The digit row is exempt so AZERTY Mac `Cmd+Shift+1` still fires `Mod+1`. For the same reason, `Mod+!` never fires on a US Mac, where `Cmd+Shift+1` reports `1`; register `Mod+Shift+1`. Development builds warn when you register `Mod+!` or `Mod+<` for macOS.
- **Named keys and numpad.** Named keys never fall back. With NumLock off, Numpad `1` reports `End` and triggers `End` rather than `1`, and Numpad `5` fires no digit even in Firefox (`Unidentified`).
- **Priority.** The active scope decides first: when chords in two scopes on the same target match one press, the nested or most recently activated scope handles it, even if the other scope's binding matches more exactly. Within that scope, when one press could match both an exact character binding and a fallback on the same target, the exact match wins. When a logical and a physical binding on the same target and phase both match exactly, such as `Enter` and `[NumpadEnter]` on Numpad Enter, the physical one wins.

### Match a key's position instead

When a shortcut should follow physical keyboard geometry instead of characters, such as `W`, `A`, `S`, `D` game movement, use a physical binding. Physical bindings match `event.code` directly and ignore layout:

| Binding | Matches |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | The character `S` (`event.key`), with the fallbacks above |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | The physical `S` key on a US layout (`event.code`) |
| `Enter` | Either Enter key, including the numpad's, unless `[NumpadEnter]` is also registered on the same target |
| `[Enter]` or `[NumpadEnter]` | Only that specific Enter key |

- **String syntax.** Wrap every physical code in brackets, including keys that share a logical name like `[Enter]` and `[F13]`. Editor autocomplete and type checking apply to all codes.
- **Object syntax.** Use `code` for physical bindings and `key` for logical ones. Never pass both, and never put brackets inside `key`.
- **Callback context.** `context.parsedChord.code` (and `step.code` in sequences) is only defined for physical bindings. Check `code !== undefined` before reading it.
- **Display labels.** Brackets are stripped in UI labels, so `Mod+[KeyS]` displays as `⌘ S` on macOS. In Chromium browsers (Chrome and Edge), your adapter's label formatter swaps physical keys for the character printed on the user's actual layout. Firefox and Safari fall back to the US label.

### Type keys from other keyboard layouts

By default, hotkey strings type-check against US QWERTY keys. Most apps never need to change this, because A to Z, 0 to 9, and common US punctuation already match across international layouts at runtime.

To type-check layout-specific keys such as `Ö`, `ß`, or `§`, register those layout sets through module augmentation (see your framework's Keyboard Layouts guide). Registering sets changes types only. Matching behavior and bundle size stay identical.

Each set covers layout-specific keys and punctuation typed unshifted or with `Shift` across Windows, macOS, and Linux, omitting dead keys and `AltGr` or `Option` characters. Letters typed with `Shift` require `Shift+` in the hotkey.

- **Americas.** `UsKeys`, `BrazilianKeys`, `LatinAmericanKeys`, `CanadianFrenchKeys`
- **Western Europe.** `UkKeys`, `GermanKeys`, `AustrianKeys`, `SwissGermanKeys`, `SwissFrenchKeys`, `FrenchKeys`, `BelgianKeys`, `SpanishKeys`, `PortugueseKeys`, `ItalianKeys`
- **Nordic.** `DanishKeys`, `NorwegianKeys`, `SwedishKeys`, `FinnishKeys`, `IcelandicKeys`
- **Central and Eastern Europe.** `CzechKeys`, `SlovakKeys`, `HungarianKeys`, `CroatianKeys`, `SlovenianKeys`, `SerbianLatinKeys`, `EstonianKeys`, `LithuanianKeys`, `RomanianKeys`, `TurkishKeys`
- **Non-Latin.** `GreekKeys`, `RussianKeys`, `UkrainianKeys`, `BulgarianKeys`, `HebrewKeys`

Polish and Latvian share US QWERTY base keys without `AltGr`, and most Dutch users use US International, so they don't need a separate set.

## Modifiers must match exactly

`Mod+S` won't fire on `Mod+Shift+S`, and `K` won't fire on `Shift+K`. Exact matching keeps `Mod+Z` (undo) and `Mod+Shift+Z` (redo) from colliding.

- **Symbols typed with `Shift`.** Printable symbols like `?`, typed with `Shift+/` on US keyboards, match without listing `Shift+`. Letters always require explicit `Shift+` (`K` versus `Shift+K`).
- **iOS auto-capitalization.** The iOS on-screen keyboard sometimes reports Return as `Shift+Enter` at the start of a sentence. If an `Enter` shortcut must work inside an editor (`ignoreInputs: false`), register `Shift+Enter` for it too.
- **Modifier-only hotkeys are rejected.** Every hotkey needs a non-modifier key. TypeScript rejects strings like `Shift+Alt+Mod` or `Ctl+K`. Plain JS or saved strings log a dev warning and register nothing. Use the held-key APIs to react to modifiers alone.
- **AltGr is treated as character input.** On Windows and Linux, `AltGr` types characters like `@` or `€`. Those match character bindings, never `Control+Alt` shortcuts, so typing an email doesn't trigger commands. On Windows, Left Ctrl + Left Alt acts as `AltGr` on layouts that have it, so avoid `Control+Alt` with letters, digits, and symbols when users type in other languages (German `Ctrl+Alt+E` types `€` and Polish `Ctrl+Alt+A` types `ą` instead of triggering `Control+Alt+E` or `Control+Alt+A`). When `AltGr+key` produces no new character (such as `AltGr+F`), it doesn't fire `F`. Because Windows reports `AltGr` as Control+Alt, `AltGr+Home` triggers `Control+Alt+Home` on Windows, matching native apps.
- **IME composition pauses hotkeys.** While users compose text with an IME (Japanese, Chinese, Korean), all hotkeys pause. This includes the `Enter` Safari emits right after composition ends, so `Enter`, `Escape`, and arrow keys belong to the IME.

## Typing in inputs does not trigger shortcuts

A hotkey bound to `K` shouldn't fire when the user types "okay" into a search box. By default, `ignoreInputs` is `'auto'`, which decides based on the hotkey itself (using the first step for sequences):

| Hotkey | Behavior in inputs | Why |
| --- | --- | --- |
| `K`, `Shift+K`, `Alt+K`, `?` | Ignored | These keys type text |
| `ArrowLeft`, `Home`, `Backspace`, `Enter` | Ignored | A text field uses these keys to move the caret and edit text |
| `Mod+S`, `Control+K`, `Meta+Enter` | Fires | Primary shortcuts shouldn't break while editing |
| `Escape` | Fires | Users expect `Escape` to close dialogs from inside inputs |
| `F5`, `Shift+F10`, `MediaPlayPause` | Fires | Function keys and media keys don't type text, and a text field does nothing with them |

Function keys are `F1` to `F24`. Media keys are the keys whose names start with `Audio`, `Browser`, `Launch`, or `Media`, such as `AudioVolumeMute`, `BrowserBack`, `LaunchMail`, and `MediaTrackNext`. Both kinds fire in inputs with any modifiers. A sequence follows its first step, so `['F2', 'R']` also fires in inputs, and the `R` press doesn't type into the field.

These elements count as inputs, including inside open shadow roots:

- Editable `<input>` types (`text`, `search`, `email`, `number`, and date or time types, unless `readOnly`)
- Non-`readOnly` `<textarea>` and `<select>` elements
- `contenteditable` elements and `role="textbox"` or `role="searchbox"`
- Elements hiding focus inside a closed shadow root, or form-associated custom elements without a `role` attribute

Non-text controls (checkboxes, radios, ranges, color, file, and buttons) are not text inputs, so `K` still fires there. They only protect the specific keys they use (see below). Custom elements can set a `role` like `role="checkbox"` for the same behavior.

A hotkey whose `target` is the input element itself always receives its events. To let a shortcut like `Enter` submit a form from its text fields, set `ignoreInputs: false`. To ignore even `Mod` shortcuts inside inputs, set `ignoreInputs: true`.

### `Mod` chords can replace text editing shortcuts

Control and Meta chords fire in inputs, so a hotkey can take a chord that the browser uses to edit text. A `Mod+Z` hotkey on the document runs your undo while the user types in a text field, and the field's own undo doesn't run. These shortcuts are the ones to check:

- Undo and redo: `Mod+Z`, `Mod+Shift+Z`, and `Control+Y` on Windows
- Select all, copy, cut, and paste: `Mod+A`, `Mod+C`, `Mod+X`, and `Mod+V`
- Caret movement and deletion by word or line: `Mod` with an arrow key, `Backspace`, or `Delete`
- Formatting in rich text fields: `Mod+B`, `Mod+I`, and `Mod+U`

`'auto'` doesn't detect these chords, because no list of them is complete. Text editing shortcuts differ between operating systems, macOS lets users rebind them, and the browser doesn't report whether a key press edits the field.

If the text field should keep the chord, set `ignoreInputs: true` on the hotkey. The hotkey then runs everywhere except while a text field has focus. If the hotkey belongs to one part of the page, such as a canvas or a data grid, set `target` to that element instead, so key presses in fields outside the element never reach the hotkey.

An editor that handles these chords itself is the opposite case. Register the hotkeys with the editor's element as the `target`. A hotkey always receives the events of its own target, so `ignoreInputs` doesn't apply.

## Focused controls keep their own keys

Native controls and ARIA widgets use keys like `Space`, `Enter`, and arrow keys for themselves. When `ignoreInputs` is active (`true` or `'auto'`), hotkeys skip those keys while a matching control or element inside it has focus:

| Focused control | Keys it keeps |
| --- | --- |
| `<button>`, button, image, color, and file inputs, `<summary>`, `role="button"` | `Enter`, `Space` |
| Checkbox inputs, `role="checkbox"`, `"switch"`, `"radio"` | `Space` |
| Radio inputs, `role="radiogroup"` | Arrow keys, `Space` |
| Range inputs, `role="slider"` | Arrow keys, `Home`, `End`, `PageUp`, `PageDown` |
| Read-only text inputs | `ArrowLeft`, `ArrowRight`, `Home`, `End` |
| Read-only textareas | Arrow keys, `Home`, `End`, `PageUp`, `PageDown` |
| Links with `href`, `role="link"` | `Enter` |
| `role="tab"`, `"option"`, `"treeitem"`, `"menuitem"` (all forms) | `Enter`, `Space` |
| `role="menu"`, `"menubar"`, `"tree"` | Arrow keys, `Home`, `End`, `Enter`, `Space`, typeahead characters |
| `role="listbox"` | Vertical arrows (horizontal if `aria-orientation="horizontal"`), `Home`, `End`, `Enter`, `Space`, typeahead |
| `role="combobox"` (without a text field) | `ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Space`, typeahead |
| `role="tablist"` | Horizontal arrows (vertical if `aria-orientation="vertical"`), `Home`, `End`, `Enter`, `Space` |
| `role="toolbar"` | Horizontal arrows (vertical if `aria-orientation="vertical"`), `Home`, `End` |
| `role="grid"`, `"treegrid"` | Arrow keys, `Home`, `End`, `PageUp`, `PageDown`, `Enter`, `Space` |
| `role="spinbutton"` | `ArrowUp`, `ArrowDown`, `Home`, `End`, `PageUp`, `PageDown` |

- `Control`, `Meta`, and `Alt` shortcuts are never skipped here. `Enter` and `Space` are skipped only without modifiers, and navigation or typeahead keys are also skipped with `Shift` for selection extension.
- Controls only reserve keys when they sit *inside* the hotkey's `target`. A hotkey targeted directly at a listbox receives arrow keys so the widget can implement its own navigation. Set `ignoreInputs: false` to bypass this completely.
- The hotkey recorder skips only text fields, so you can still record `Enter` or `Space` while the trigger button keeps focus.

## The browser's action is prevented

`preventDefault` and `stopPropagation` both default to `true`. Binding `Mod+S` shouldn't open the browser's Save Page dialog, and binding `Mod+K` shouldn't jump to the address bar or fire duplicate listeners higher in the DOM.

- Unmatched keys are never touched.
- In a sequence like `['Mod+K', 'Mod+C']`, every matching step calls `preventDefault()`, while `stopPropagation()` runs only on the final step so earlier keys still reach other listeners.
- To observe a shortcut without blocking it, set either option to `false`.
- Browsers and operating systems reserve certain shortcuts (`Mod+T`, `Mod+N`, `Mod+W`, `Alt+Tab`, `Command+Tab`) before they ever reach the page. Pick other keys for your app.
- Binding `Tab`, `Shift+Tab`, or `F6` on `document` prevents focus movement across buttons and links. Give those shortcuts an element `target` instead.

## Hotkeys that can't fire leave the key alone

If a hotkey is disabled (`enabled: false`) or its scope is inactive or suspended, it doesn't call `preventDefault()`. That means pressing `Mod+S` while saving is disabled opens the browser's Save dialog.

For most shortcuts, setting `preventDefault: 'always'` in your shared defaults is better. With `'always'`, a disabled or suspended chord still prevents the browser's default action:

- It never stops propagation, so other listeners still see the key.
- It still respects `ignoreInputs` while typing in fields.
- If another active hotkey handles the key, that hotkey's options take over.
- Sequences treat `'always'` as `true`.

Don't use `'always'` on hotkeys you turn off specifically to hand keys back to the browser. Set `preventDefault: true` on those instead:

- **Clipboard and editing chords.** `Mod+C`, `Mod+A`, and `Mod+Z` enabled only while canvas cells are selected would block native copy and undo in text inputs if `'always'` were set.
- **Single-key shortcuts.** Shortcuts behind an accessibility off switch would keep blocking `Space`, arrow keys, or `/` when turned off.
- **`Tab` hotkeys.** Disabling them would still trap focus.

## Single-key shortcuts need an off switch

Ignoring text inputs prevents `K` from firing while typing, but speech-input users dictate words as single keystrokes. Under [WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), any shortcut using only letters, numbers, or symbols (including `Shift+K` or a sequence like `['G', 'G']`) must satisfy at least one of these conditions:

- **Turn it off.** Wire `enabled` to a user preference.
- **Remap it.** Let users add a modifier through app hotkeys and the recorder.
- **Scope it to focus.** Give it an element `target` so it fires only while that widget is focused.

Shortcuts using `Mod`, `Control`, or `Alt`, as well as non-character keys like `Escape`, function keys, and media keys, don't need this.

## Chords fire on keydown and repeat while held

By default, chords fire on `keydown` and repeat on each OS auto-repeat tick while held, which suits actions such as holding `Mod+Z` for undo or scrolling.

- **Prevent key repeat (`requireReset: true`).** Ideal for toggles like opening and closing panels so holding the key doesn't flicker. Fires once until you release the key or any modifier, or trigger a fresh non-repeat press (so lost macOS `Command` keyups never get a key stuck).
- **Fire on release (`eventType: 'keyup'`).** Fires when either the key or one of its modifiers is released after a matching press, provided no other key was pressed in between. This works reliably even on macOS (which drops keyups while `Command` is held) and still prevents the `keydown` browser default unless `preventDefault: false`.

## Listeners attach to the document

Hotkeys listen on `document` by default so they work regardless of focus. Internally, TanStack Hotkeys attaches at most one `keydown` and one `keyup` listener per target (plus a capture pair if any hotkey uses `capture: true`), no matter how many shortcuts you register.

- Pass an element `target` to scope a shortcut to focus inside that element, adding `tabIndex` if the element isn't natively focusable.
- Hotkeys can target same-origin iframes or popups (`document`, `window`, or an element inside them). `ignoreInputs` works inside those frames automatically.
- No listeners are attached during server rendering.

## Hotkeys run after the page's own handlers

Hotkeys listen in the bubble phase by default, so a focused widget's own `onKeyDown` handler runs first and can call `stopPropagation()`.

- **Delegated event frameworks (React, Svelte, Solid, Octane).** Because those frameworks delegate `onKeyDown` at the root or document, a hotkey with an element `target` waits until after delegated handlers on the page run too. That means `stopPropagation()` on an element hotkey won't stop an outer framework `onKeyDown`. In other frameworks, handlers outside the target run after the hotkey.
- **Override widgets with `capture: true`.** When an app-level shortcut must run before a widget (such as `Mod+Backspace` closing a view before a tab strip treats it as Backspace), set `capture: true`. It works for both `keydown` and `keyup` and still respects `ignoreInputs`.

## Component libraries that handle the same keys

UI libraries close dialogs, popovers, and menus on `Escape`, and rich-text editors handle chords like `Mod+B`. When your app binds the same key, a single keystroke can reach both unless they coordinate.

### Skip keys a library already handled

If a component library or editor calls `preventDefault()` on a key without calling `stopPropagation()`, your hotkey still sees the event. Set `ignoreDefaultPrevented: true` in your shared defaults (see [Changing the defaults](#changing-the-defaults)) so hotkeys skip any event another listener already prevented. A hotkey's own `preventDefault` is ignored for this check, so your element and document hotkeys still compose.

> [!NOTE]
> `ignoreDefaultPrevented` only sees `preventDefault()` calls from listeners that run *before* yours (on a child element, or in the capture phase). Libraries that attach a fresh `document` listener only when an overlay opens run *after* your hotkeys, so the option can't help there. For `Escape` on overlays, see [Let an open overlay handle Escape](#let-an-open-overlay-handle-escape).

<!-- ::start:framework -->

# React

Turn on `ignoreDefaultPrevented: true` if you use:

- Radix UI or shadcn/ui, including vaul and cmdk, which close dialogs, popovers, selects, and menus on Escape
- Chakra UI or Ark UI
- `react-select`
- Tiptap, ProseMirror, CodeMirror, or Lexical, which handle chords such as `Mod+B` and `Mod+Z` inside the editor

React Aria, Base UI, MUI dialogs and menus, Headless UI menus and listboxes, and Monaco stop propagation on the keys they handle, so hotkeys never see them.

# Preact

Component libraries reach Preact through `preact/compat` and behave as they do in React. Turn on `ignoreDefaultPrevented: true` if you use:

- Radix UI or shadcn/ui, including vaul and cmdk
- Chakra UI or Ark UI
- `react-select`
- Tiptap, ProseMirror, CodeMirror, or Lexical

# Solid

Turn on `ignoreDefaultPrevented: true` if you use Ark UI.

Kobalte (plus solid-ui and shadcn-solid built on it) and Corvu handle Escape after your hotkeys, so `ignoreDefaultPrevented` doesn't apply there. Their dialogs still receive Escape through overlay detection below.

# Angular

Turn on `ignoreDefaultPrevented: true` if you use:

- Angular Material or the Angular CDK (dialogs, bottom sheets, menus, and selects)
- spartan/ui
- ng-zorro-antd (modals, selects, tooltips, and popovers)

PrimeNG dialogs, drawers, and popovers, as well as ng-bootstrap dropdowns and typeaheads, handle Escape after your hotkeys. Their overlays still receive Escape through overlay detection below.

# Vue

Turn on `ignoreDefaultPrevented: true` if you use:

- Ark UI
- Tiptap, ProseMirror, or CodeMirror
- PrimeVue CascadeSelect, TreeSelect, ContextMenu, TieredMenu, or DatePicker

Reka UI (plus shadcn-vue and Nuxt UI built on it) and most other Vue overlay libraries don't call `preventDefault()` on Escape, so `ignoreDefaultPrevented` doesn't apply there. Their dialogs still receive Escape through overlay detection below.

# Svelte

Turn on `ignoreDefaultPrevented: true` if you use Skeleton or Ark UI.

Bits UI (plus shadcn-svelte built on it) and Melt UI call `preventDefault()` on Escape from a document listener added when the overlay opens, so it runs after your hotkeys. Bits UI dialogs still receive Escape through overlay detection below.

# Lit

Turn on `ignoreDefaultPrevented: true` if you use the menus and selects of Material Web, Spectrum Web Components, or FAST.

# Alpine

Most Alpine components handle Escape with `@keydown.escape.window` and don't call `preventDefault()`, so `ignoreDefaultPrevented` rarely applies. See [Let an open overlay handle Escape](#let-an-open-overlay-handle-escape).

# Ember

Turn on `ignoreDefaultPrevented: true` if you use `ember-headlessui` menus. `ember-power-select` and `ember-basic-dropdown` close on Escape without calling `preventDefault()`.

# Octane

Turn on `ignoreDefaultPrevented: true` if a component library or editor in your app calls `preventDefault()` on keys it handles without stopping propagation.

<!-- ::end:framework -->

### Let an open overlay handle Escape

By default, TanStack Hotkeys keeps `Escape` working for the innermost open overlay. When focus is inside a modal or menu, `Escape` hotkeys outside it are automatically skipped (no callback, no `preventDefault()`, no `stopPropagation()`). A hotkey targeted at the overlay, or at an element inside it, still receives `Escape`.

TanStack Hotkeys detects overlays at `window` before `document` listeners run:

- Native `<dialog>` elements (`showModal()`, or non-modal with `closedby="any"` or `closedby="closerequest"`), ignoring `<dialog closedby="none">`. When modal dialogs stack, only the top one counts.
- Open popovers (`popover` or `popover="auto"`), excluding `popover="manual"`
- The innermost element around focus (other than `<dialog>`) with `role="dialog"`, `role="alertdialog"`, `role="menu"`, an expanded `combobox` (`aria-expanded="true"`), or a focused `aria-expanded="true"` trigger with `aria-haspopup` other than `"false"`

When writing your own `Escape` hotkeys:

1. **Let the browser close native `<dialog>` and `popover`.** Build overlays on `<dialog>` with `showModal()` or `popover` (`"auto"`) without registering a custom `Escape` hotkey. A `popover="manual"` popover doesn't close on Escape, so close it with an `Escape` hotkey targeted at it. For a dialog users cannot dismiss, use `<dialog closedby="none">` and also call `preventDefault()` on its `cancel` event for browsers without `closedby`.
2. **Target custom overlays directly.** For a custom ARIA dialog you manage yourself, pass `target` on the overlay element rather than registering a global `Escape`.
3. **Guard global `Escape` when needed.** Automatic detection can't see overlays in these cases:
   - An overlay without focus inside it (such as a popover in a shadow root while its trigger has focus)
   - An overlay without one of the ARIA or native roles above (such as `@keydown.escape.window`)
   - An overlay inside a closed shadow root
   - An overlay closed by a `window` capture listener added before the first registered hotkey

   Wrap those in an `exclusive` scope while open, or pass `enabled: !open` to your global `Escape` hotkey while keeping the default `preventDefault` (not `'always'`) so the overlay still receives `Escape`.
4. **Keep `Escape` out of page sections and sequences.** Inside `role="dialog"` or `role="alertdialog"`, hotkeys in any named scope keep `Escape`, so a page section's `Escape` hotkey steals it from a library's dialog, and a sequence step on `Escape` competes with every overlay.

While focus is inside a `role="dialog"` or `role="alertdialog"` element, hotkeys in any named scope keep `Escape` (regardless of `target`), so a dialog component using its own scope can still close itself while an inner combobox or menu still closes first. Native `<dialog>` and `popover` overlays take `Escape` before any hotkey outside them regardless of scope. Make a dialog's scope `exclusive` if other named scopes can stay active behind it.

<!-- ::start:framework -->

# React

Tested: Radix UI and shadcn/ui dialogs and Headless UI `Dialog` close on Escape without triggering outer hotkeys. The first Escape in an open React Aria `ComboBox` closes its list, and the next runs your hotkey.

Not yet tested with this rule: Ant Design and Mantine.

See [Group hotkeys into scopes](../framework/react/guides/hotkeys-provider-and-scopes.md#group-hotkeys-into-scopes) to give an overlay its own scope.

# Preact

Component libraries reach Preact through `preact/compat` and behave as they do in React: Radix UI dialogs and Headless UI `Dialog` get Escape.

See [Group hotkeys into scopes](../framework/preact/guides/hotkeys-provider-and-scopes.md#group-hotkeys-into-scopes) to give an overlay its own scope.

# Solid

Tested: Kobalte dialogs (plus solid-ui and shadcn-solid built on Kobalte) and Corvu dialogs close on Escape without triggering outer hotkeys.

See [Group hotkeys into scopes](../framework/solid/guides/hotkeys-provider-and-scopes.md#group-hotkeys-into-scopes) to give an overlay its own scope.

# Angular

Tested: Angular CDK dialogs and Angular Material dialogs close on Escape without triggering outer hotkeys.

Not yet tested with this rule: ng-bootstrap and PrimeNG.

See [Group hotkeys into scopes](../framework/angular/guides/provide-hotkeys-and-scopes.md#group-hotkeys-into-scopes) to give an overlay its own scope.

# Vue

Tested: Reka UI dialogs (plus shadcn-vue and Nuxt UI built on Reka UI), Headless UI `Dialog`, Vuetify dialogs, and PrimeVue dialogs close on Escape without triggering outer hotkeys.

Not yet tested with this rule: Naive UI, Quasar, and Element Plus.

See [Group hotkeys into scopes](../framework/vue/guides/hotkeys-provider-and-scopes.md#group-hotkeys-into-scopes) to give an overlay its own scope.

# Svelte

Tested: Bits UI dialogs (and shadcn-svelte built on Bits UI) close on Escape without triggering outer hotkeys.

Not yet tested with this rule: Melt UI and Flowbite Svelte.

See [Group hotkeys into scopes](../framework/svelte/guides/hotkeys-provider-and-scopes.md#group-hotkeys-into-scopes) to give an overlay its own scope.

# Lit

Tested: Shoelace, Web Awesome, and Material Web dialogs close on Escape without triggering outer hotkeys.

Not yet tested with this rule: Vaadin and Ionic.

See [Activate a scope](../framework/lit/guides/hotkey-manager.md#activate-a-scope) to give an overlay its own scope.

# Alpine

Pines and Penguin UI modals and other components using `@keydown.escape.window` get Escape only when they render one of the roles above and hold focus.

Not yet tested with this rule: Flowbite.

See [Activate a scope](../framework/alpine/guides/hotkey-manager.md#activate-a-scope) to give an overlay its own scope.

# Ember

`ember-power-select`, `ember-basic-dropdown`, and `ember-bootstrap` haven't been tested with this rule.

See [Activate a scope](../framework/ember/guides/hotkey-manager.md#activate-a-scope) to give an overlay its own scope.

# Octane

No component library for Octane is widespread yet. Overlays get Escape as in every framework.

See [Group hotkeys into scopes](../framework/octane/guides/hotkeys-provider-and-scopes.md#group-hotkeys-into-scopes) to give an overlay its own scope.

<!-- ::end:framework -->

## Sequences allow 1 second between steps

A sequence like `['G', 'G']` completes when each step arrives within `1000` ms (`timeout`). While a sequence is in progress:

- Pressing a standalone modifier (`Shift`) doesn't break the sequence, so `['Shift+R', 'Shift+T']` works naturally.
- Lock keys (`CapsLock`, `NumLock`), `Fn`, and dead keys don't reset progress unless they match a step of another sequence.
- Key auto-repeat doesn't count as a second step. Holding `G` won't trigger `['G', 'G']`.
- Pressing a wrong key clears progress, unless that key starts the sequence. In that case it begins a fresh attempt, so `G X G G` still fires `['G', 'G']`.
- Progress clears automatically when the timeout expires, so UI indicators disappear on time.

## Duplicate registrations warn

Registering two hotkeys with the same canonical binding, target, scope, and event type logs a console warning in development and runs both callbacks. Set `conflictBehavior` to `'error'` or `'allow'` to customize this.

Dev warnings check `process.env.NODE_ENV`, so bundlers strip them in production. If you load the library without a bundler (no `process` global), use `validateHotkey` or `assertValidHotkey` to validate strings, or set `conflictBehavior: 'error'`.

## Recording captures what the user pressed

With the default `recordBy: 'auto'`, the hotkey recorder writes what the user typed, just as you would by hand. Command+S on macOS and Control+S elsewhere both record `'Mod+S'`.

- **Typed characters.** A symbol typed with `Shift` records without `Shift`, the way the matcher reads it: `Shift+/` records `?`, `Shift+1` records `!`, AZERTY `Shift+&` records `1`, and German `Shift+3` records `§`. With `Control` or `Command`, `Ctrl+Shift+/` and macOS `Cmd+Shift+/` both record `Mod+?`. On macOS, `Command` may report the unshifted character, so `Cmd+Shift+symbol` keeps `Shift` except on the key's US position: Dvorak `Cmd+Shift+/` records `Mod+Shift+/`, and `Cmd+Shift+,` records `Mod+Shift+,`. A character typed with `AltGr` records as itself (German `AltGr+Q` records `@`). Numpad `Enter` records `Enter`, and the numpad operators without `Shift` record their character (`Ctrl+numpad +` records `Mod++`).
- **The digit row with modifiers.** With `Control`, `Command` or `Alt`, a digit-row key records its digit, as the matcher reads it: AZERTY `Ctrl+&` records `Mod+1`, and `Ctrl+Shift+1` records `Mod+Shift+1` on every platform, though Windows reports `!` and macOS reports `1`. `Control` or `Command` alone with `-`, `+` or `=` keeps the character for zoom (AZERTY `Ctrl+-` records `Mod+-`).
- **Fallback to physical codes.** When a typed character changes with the platform or layout, the recorder falls back to bracketed physical codes: macOS `Option` with a symbol (`Option+/` becomes `Alt+[Slash]`), dead keys (except `Option+letter` accents like `Alt+E`), numpad digits and the decimal key (what they type depends on NumLock and the layout), and `Shift` with a numpad operator. Non-Latin letter presses record as their US position (`Control+ы` becomes `Mod+S`), so they keep working after a switch to an English layout.
- **Explicit modes.** Set `recordBy: 'code'` to always record physical positions (for games), or `recordBy: 'key'` to always record typed characters (`Option+S` becomes `Alt+ß`).
- **Conflict detection.** Enable `detectConflicts` (or pass `context` to `findConflicts`) to catch collisions even when a recording and a declared hotkey are spelled differently, such as `Shift+[Slash]` recorded by code, or saved by an earlier version, and a declared `?`.

While recording is active:

- `Escape`, `Tab`, and `Shift+Tab` cancel so keyboard users aren't trapped (`recordTab: true` records Tab instead).
- The window losing focus cancels and calls `onCancel`: switching apps or tabs, opening browser devtools, clicking into an iframe, or an OS shortcut such as Spotlight. Keys pressed elsewhere never reach the page, so a recording left running would take the first key pressed after coming back (`cancelOnBlur: false` keeps recording). A click elsewhere on the page doesn't cancel.
- `Backspace` or `Delete` undoes the last sequence step, or clears when empty.
- `Enter` commits multi-step sequences (`maxSteps: Infinity`).
- Existing registered hotkeys pause automatically, while typing in other inputs passes through.
- To show the modifiers held so far, join the held modifier keys from the key state tracker with `+` and pass them to `formatForDisplay`. Leave other keys out, because a string that starts with a non-modifier key formats as empty. It orders them as in a chord: `⌃ ⌥ ⇧ ⌘` on macOS, `Ctrl+Alt+Shift+Win` elsewhere.
- `AltGr` presses record the character they typed. `recordBy: 'code'` rejects them, and every mode rejects `AltGr` that typed nothing new, except on Windows, which reports `AltGr` with a key it doesn't change, such as `Home` or `F`, as a Control+Alt shortcut: `AltGr+Home` records `Mod+Alt+Home`.
- Shortcuts that the browser or the operating system keeps never reach the page, so the recorder can't record them and shows no error: `Mod+T`, `Mod+N`, and `Mod+W` in Chrome, `Command+Tab` and `Command+Space` on macOS, and most `Win` shortcuts on Windows. Tell users which keys they can't use, next to the recorder.

## Held keys reset when the window loses focus

Key state tracking updates on `keydown` and `keyup`, with automatic safeguards against stuck keys:

- **Focus loss and context menus.** Switching apps (`Command+Tab`), hiding the tab, or opening a native context menu clears held keys. A custom menu calling `preventDefault()` on `contextmenu` keeps state.
- **macOS `Command` quirk.** Releasing `Command` on macOS clears other held keys because macOS swallows keyups for keys released while `Command` is held. Other modifiers and platforms keep their keyups.
- **Swallowed modifier keyups.** Shortcuts like macOS screenshot (`Cmd+Shift+4`) steal the modifier `keyup` without blurring the window. Held modifiers resync on the next real user keyboard or mouse event.

## Display matches the platform

Label formatters like `useFormatForDisplay` match OS conventions. `Mod+Shift+S` becomes `⇧ ⌘ S` on macOS and `Ctrl+Shift+S` on Windows and Linux, and sequence steps join with spaces (`G G`). Pass `useSymbols: false` for text names on macOS, or `keyLabels` to rename individual keys.

## Changing the defaults

Every option above can be set per registration. To change defaults across your app, configure your framework adapter:

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
