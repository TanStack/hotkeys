---
title: Accessible Keyboard Shortcuts in Angular
id: accessibility
description: Make Angular keyboard shortcuts accessible. Announce them to screen readers with aria-keyshortcuts, and let users turn off single-key shortcuts as WCAG 2.1.4 requires.
---

Keyboard shortcuts help people who navigate without a mouse, but shortcuts can get in the way of other assistive technology. Screen readers can't announce a shortcut unless the control sets `aria-keyshortcuts`. Speech input types words as key presses, which can fire single-letter shortcuts by accident. This guide covers what TanStack Hotkeys handles by default and what to add in your app.

## What the library handles

These protections are on by default:

- **Typing in fields and widgets.** Single keys and `Shift` or `Alt` chords don't fire while focus is in a text field, `<select>`, or `contenteditable` element. Native buttons keep `Enter` and `Space`, links keep `Enter`, and ARIA widgets such as menus, listboxes, tabs, and grids keep their navigation keys. Configure this with `ignoreInputs` (see [Hotkey options](./hotkeys#hotkey-options)). Hotkeys targeted at the field itself still fire there, and so do `Escape`, function keys, and `Control` or `Meta` chords.
- **Characters typed with AltGr.** On keyboards where AltGr types characters such as `@` or `€`, typing them doesn't fire `Control+Alt` hotkeys.
- **Open overlays.** While focus is inside an overlay that closes on `Escape`, such as a native `<dialog>`, a light-dismiss popover, or an ARIA dialog or menu, outer `Escape` hotkeys stay out of the way so the overlay closes first. An overlay that closes in your own handler still needs that handler (see [Let an open overlay handle Escape](../../../guides/sensible-defaults.md#let-an-open-overlay-handle-escape)). To suspend all other page hotkeys while a dialog is open, give the dialog component an [exclusive scope](./provide-hotkeys-and-scopes#exclusive-scopes).

## Announce shortcuts to screen readers

Screen readers announce a control's shortcut from its [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute. A visible `<kbd>` label isn't enough. Screen readers may read a `<kbd>` label as plain text rather than as a shortcut, and they may not read a symbol such as `⌘` as `Command`. Call `injectFormatForAria()` to format a hotkey for the attribute using the same platform and keyboard layout as the display formatter:

```ts
import { Component } from '@angular/core'
import {
  injectAppHotkeys,
  injectFormatForAria,
  injectFormatForDisplay,
  injectHotkey,
} from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-search-button',
  template: `
    @let hotkey = appHotkeys()['search.open'].hotkey;
    <button
      (click)="openSearch()"
      [attr.aria-keyshortcuts]="formatForAria(hotkey)"
    >
      Search
      @if (hotkey) {
        <kbd>{{ formatForDisplay(hotkey) }}</kbd>
      }
    </button>
  `,
})
export class SearchButton {
  appHotkeys = injectAppHotkeys()
  formatForAria = injectFormatForAria()
  formatForDisplay = injectFormatForDisplay()

  constructor() {
    injectHotkey(
      () => this.appHotkeys()['search.open'],
      () => this.openSearch(),
    )
  }

  openSearch() {
    // ...
  }
}
```

Follow these rules when you add the attribute:

- **Attach it to the target control.** Put `aria-keyshortcuts` on the button the shortcut activates or the field it focuses. The attribute only announces the shortcut, so register the hotkey as usual.
- **Announce only working shortcuts.** The formatter returns `undefined` while the hotkey can't fire, such as when it is disabled, its scope is suspended, or character keys are suspended, so the attribute comes and goes with the shortcut. It checks whether any registration of the hotkey can fire, so if this control's action is disabled while another action uses the same keys, the attribute stays. Leave the attribute off yourself in that case. The hotkey has to be registered, so server-rendered HTML has no attribute until the hotkey registers in the browser.
- **Keep the visible label.** Render a `<kbd>` label alongside the attribute from the same hotkey so sighted and screen reader users see the same shortcut.
- **Document sequences in text.** ARIA has no syntax for multi-step sequences such as `['G', 'H']`, so the formatter returns `undefined` and `[attr.aria-keyshortcuts]` omits the attribute. List sequences in a [cheat sheet](./cheat-sheet-ui-helpers) instead.
- **Read from app hotkeys.** Pass the binding from [app hotkeys](./app-hotkeys) so `aria-keyshortcuts` updates when the user rebinds the shortcut.

See [Format for `aria-keyshortcuts`](./formatting-display#format-for-aria-keyshortcuts) for the formatting rules and edge cases.

## Let users turn off character key shortcuts

[WCAG 2.1.4, Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html) (Level A) covers shortcuts made only of keys that type a character, such as `K`, `?`, `Shift+K`, `Space`, or the sequence `['G', 'H']`. Speech input types words as key presses, and people with tremors press keys by accident, so these shortcuts fire when nobody meant them to. An app with character key shortcuts must provide at least one of these options:

- A way to turn them off.
- A way to remap them to use `Control`, `Alt`, or `Meta`.
- Shortcuts that work only while a specific element has focus.

### Turn them off

Add a setting, such as **Single-key shortcuts**, and suspend character key shortcuts while it is off. Pass `suspendCharacterKeys` to `provideHotkeys` as a getter that reads the user's setting. While that injector lives, document-level character key shortcuts across the whole app stop firing, so providing it in the application config is enough:

```ts
import { inject } from '@angular/core'
import type { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      // Runs in the provider's injection context, so it can read a service.
      suspendCharacterKeys: () => !inject(Settings).characterKeyShortcuts(),
    }),
  ],
}
```

Angular creates a provider when something under it first injects it, and the setting applies from then on. Put `suspendCharacterKeys` on the application's `provideHotkeys`. Hotkeys registered with `injectHotkey` and the other inject functions inject it first, so they're always covered. A hotkey registered directly with `getHotkeyManager().register()` isn't suspended until a component first injects the provider.

Suspensions are counted. Character key shortcuts stay off while any active provider evaluates `suspendCharacterKeys` to `true`, and they resume when the last one is destroyed or its value becomes `false`. `suspendCharacterKeys` applies even when the provider sets `enabled: false`. Outside a provider, call `getHotkeyManager().suspendCharacterKeys()`, which returns a function that resumes them.

While suspended, an enabled document-level character key shortcut reports the status `'suspended'` (the same as a hotkey in an inactive scope), so a [cheat sheet](./cheat-sheet-ui-helpers) can mark it as off. Bind the setting's switch to the saved preference, not to the suspension. `characterKeysSuspended` in [scope state](./hotkey-manager#read-scope-state) is `true` while any suspension is in effect, so use it to show whether character key shortcuts work right now.

Suspension stops the callback but not `preventDefault: 'always'`, which keeps blocking the key's browser action. Leave `'always'` off character key shortcuts that users can turn off.

These hotkeys keep working while character keys are suspended:

| Hotkey | Why it keeps working |
| --- | --- |
| `Mod+K`, `Control+K`, `Alt+K` | Uses `Control`, `Alt`, or `Meta`. |
| `Escape`, `Enter`, `Tab`, `ArrowUp`, `F1` | Does not type a character. |
| `['Mod+K', 'C']` | At least one step uses a modifier or a non-character key. |
| A hotkey with an element `target`, other than the body or the root element | Fires only while focus is inside that element. |

Suspension checks the effective hotkey, so an app hotkey remapped from `K` to `Mod+K` works even while character keys are suspended.

### Let users remap them

[App hotkeys](./app-hotkeys) with a [shortcut settings screen](./custom-hotkey-recording) meet WCAG 2.1.4 on their own, as long as users can rebind every character key shortcut to one with `Control`, `Alt`, or `Meta`. Adding `Shift` alone still leaves a character key shortcut. Offering both a toggle and remapping lets users either disable single-key shortcuts or rebind individual ones.

### Scope them to an element

A hotkey with an element `target` fires only while focus is inside that element. Use `target` for shortcuts that belong to one widget, such as `J` and `K` in a list. See [Hotkey targets](./hotkeys#hotkey-targets).

## Make shortcuts discoverable

List every shortcut in a [cheat sheet](./cheat-sheet-ui-helpers), and show [modifier hints](./hotkey-hints) while a modifier is held. For physical-key bindings, use `injectFormatForDisplay()` so labels match the user's keyboard layout (see [Keyboard layouts](./keyboard-layouts)).

## Leave assistive technology its keys

Screen readers use single keys in browse mode and handle them before the page sees them. NVDA, for example, moves by heading with `H` and by link with `K`. Use `Mod` chords for app-wide actions, and reserve single-key shortcuts for focused widgets or an opt-in setting. Avoid binding browser or system shortcuts such as `Mod+L` or `Mod+W`.
