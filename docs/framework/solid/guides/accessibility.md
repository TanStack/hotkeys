---
title: Accessible Keyboard Shortcuts in Solid
id: accessibility
description: Make Solid keyboard shortcuts accessible. Announce them to screen readers with aria-keyshortcuts, and let users turn off single-key shortcuts as WCAG 2.1.4 requires.
---

Keyboard shortcuts help people who navigate without a mouse, but shortcuts can get in the way of other assistive technology. Screen readers can't announce a shortcut unless the control sets `aria-keyshortcuts`. Speech input types words as key presses, which can fire single-letter shortcuts by accident. This guide covers what TanStack Hotkeys handles by default and what to add in your app.

## What the library handles

These protections are on by default:

- **Typing in fields and widgets.** Single keys and `Shift` or `Alt` chords don't fire while focus is in a text field, `<select>`, or `contenteditable` element. Native buttons keep `Enter` and `Space`, links keep `Enter`, and ARIA widgets such as menus, listboxes, tabs, and grids keep their navigation keys. Configure this with `ignoreInputs` (see [Hotkey options](./hotkeys#hotkey-options)).
- **Characters typed with AltGr.** On keyboards where AltGr types characters such as `@` or `€`, typing them doesn't fire `Control+Alt` hotkeys.
- **Open overlays.** While focus is inside a native `<dialog>`, popover, or ARIA dialog or menu, outer `Escape` hotkeys stay out of the way so the overlay closes first (see [Let an open overlay handle Escape](../../../guides/sensible-defaults.md#let-an-open-overlay-handle-escape)). To suspend all other page hotkeys while a dialog is open, wrap the dialog in an [exclusive scope](./hotkeys-provider-and-scopes#exclusive-scopes).

## Announce shortcuts to screen readers

Screen readers announce a control's shortcut from its [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute. A visible `<kbd>` label isn't enough. Screen readers may read a `<kbd>` label as plain text rather than as a shortcut, and they may not read a symbol such as `⌘` as `Command`. Call `createFormatForAria()` to format a hotkey for the attribute using the same platform and keyboard layout as the display formatter:

```tsx
import {
  createFormatForAria,
  createFormatForDisplay,
  useAppHotkeys,
} from '@tanstack/solid-hotkeys'
import { Show } from 'solid-js'

function SearchButton() {
  const appHotkeys = useAppHotkeys()
  const formatForAria = createFormatForAria()
  const formatForDisplay = createFormatForDisplay()
  const hotkey = () => appHotkeys()['search.open'].hotkey

  return (
    <button aria-keyshortcuts={formatForAria(hotkey())}>
      Search{' '}
      <Show when={hotkey()}>{(h) => <kbd>{formatForDisplay(h())}</kbd>}</Show>
    </button>
  )
}
```

Follow these rules when you add the attribute:

- **Attach it to the target control.** Put `aria-keyshortcuts` on the button the shortcut activates or the field it focuses. The attribute only announces the shortcut, so register the hotkey as usual.
- **Keep the visible label.** Render a `<kbd>` label alongside the attribute from the same hotkey so sighted and screen reader users see the same shortcut.
- **Document sequences in text.** ARIA has no syntax for multi-step sequences such as `['G', 'H']`, so the formatter returns `undefined` and Solid omits the attribute. List sequences in a [cheat sheet](./cheat-sheet-ui-helpers) instead.
- **Read from app hotkeys.** Pass the binding from [app hotkeys](./app-hotkeys) so `aria-keyshortcuts` updates when the user rebinds the shortcut.

See [Format for `aria-keyshortcuts`](./formatting-display#format-for-aria-keyshortcuts) for the formatting rules and edge cases.

## Let users turn off character key shortcuts

[WCAG 2.1.4, Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html) (Level A) covers shortcuts made only of keys that type a character, such as `K`, `?`, `Shift+K`, `Space`, or the sequence `['G', 'H']`. Speech input types words as key presses, and people with tremors press keys by accident, so these shortcuts fire when nobody meant them to. An app with character key shortcuts must provide at least one of these options:

- A way to turn them off.
- A way to remap them to use `Control`, `Alt`, or `Meta`.
- Shortcuts that work only while a specific element has focus.

### Turn them off

Add a setting, such as **Single-key shortcuts**, and suspend character key shortcuts while it is off. Pass `suspendCharacterKeys` to `HotkeysProvider`, set from the user's setting. While a provider with `suspendCharacterKeys` is mounted, document-level character key shortcuts across the whole app stop firing, so one provider at the root of the app is enough:

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'
import type { Accessor } from 'solid-js'

function App(props: { settings: Accessor<Settings> }) {
  return (
    <HotkeysProvider
      suspendCharacterKeys={!props.settings().characterKeyShortcuts}
    >
      <Editor />
    </HotkeysProvider>
  )
}
```

Suspensions are counted. Character key shortcuts stay off while any mounted provider sets `suspendCharacterKeys` to `true`, and they resume when the last one unmounts or its prop becomes `false`. `suspendCharacterKeys` applies even when the provider sets `enabled={false}`. Outside a provider, call `getHotkeyManager().suspendCharacterKeys()`, which returns a function that resumes them.

While suspended, an enabled character key shortcut reports the status `'suspended'` (the same as a hotkey in an inactive scope), so a [cheat sheet](./cheat-sheet-ui-helpers) can mark it as off. To display the current toggle state in a settings screen, read `characterKeysSuspended` from [scope state](./hotkey-manager#read-scope-state).

These hotkeys keep working while character keys are suspended:

| Hotkey | Why it keeps working |
| --- | --- |
| `Mod+K`, `Control+K`, `Alt+K` | Uses `Control`, `Alt`, or `Meta`. |
| `Escape`, `Enter`, `Tab`, `ArrowUp`, `F1` | Does not type a character. |
| `['Mod+K', 'C']` | At least one step uses a modifier or a non-character key. |
| A hotkey with an element `target` | Fires only while focus is inside that element. |

Suspension checks the effective hotkey, so an app hotkey remapped from `K` to `Mod+K` works even while character keys are suspended.

### Let users remap them

[App hotkeys](./app-hotkeys) with a [shortcut settings screen](./custom-hotkey-recording) meet WCAG 2.1.4 on their own, as long as users can rebind every character key shortcut to one with a modifier. Offering both a toggle and remapping lets users either disable single-key shortcuts or rebind individual ones.

### Scope them to an element

A hotkey with an element `target` fires only while focus is inside that element. Use `target` for shortcuts that belong to one widget, such as `J` and `K` in a list. See [Hotkey targets](./hotkeys#hotkey-targets).

## Make shortcuts discoverable

List every shortcut in a [cheat sheet](./cheat-sheet-ui-helpers), and show [modifier hints](./hotkey-hints) while a modifier is held. For physical-key bindings, use `createFormatForDisplay()` so labels match the user's keyboard layout (see [Keyboard layouts](./keyboard-layouts)).

## Leave assistive technology its keys

Screen readers use single keys in browse mode and handle them before the page sees them. NVDA, for example, moves by heading with `H` and by link with `K`. Use `Mod` chords for app-wide actions, and reserve single-key shortcuts for focused widgets or an opt-in setting. Avoid binding browser or system shortcuts such as `Mod+L` or `Mod+W`.
