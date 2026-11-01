---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to an Angular app with TanStack Hotkeys. Inject hotkeys, show them in your UI, and group them into scopes with providers.
---

This guide adds keyboard shortcuts to an Angular app. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Inject a hotkey

TanStack Hotkeys needs no special setup. To register a keyboard shortcut, call `injectHotkey` in the component that owns the action:

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
  }

  save() {
    // ...
  }
}
```

Call it in an injection context, such as a constructor or a field initializer.

In apps that use zone.js, hotkeys listen outside the Angular zone, so typing doesn't run change detection on every key. Callbacks run inside the zone, so the view updates after a hotkey fires.

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

That's all a hotkey needs. Providers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Inject several hotkeys

When a component has more than one hotkey, register them together with `injectHotkeys`:

```ts
import { Component } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkeys([
      { hotkey: 'Mod+S', callback: () => this.save() },
      { hotkey: 'Mod+Z', callback: () => this.undo() },
      { hotkey: 'Mod+Shift+Z', callback: () => this.redo() },
    ])
  }
}
```

`injectHotkeys` also accepts a function that returns the array, so the list can come from signals and change length over time.

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```ts
injectHotkey(['G', 'G'], () => this.scrollToTop())
```

Each step must follow the previous one within a second.

`injectHotkeys` accepts chords and sequences in the same array:

```ts
injectHotkeys([
  { hotkey: 'Mod+K', callback: () => this.openSearch() },
  { hotkey: ['G', 'H'], callback: () => this.goHome() },
  { hotkey: ['G', 'S'], callback: () => this.goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```ts
import { Component } from '@angular/core'
import { formatForDisplay, injectHotkey } from '@tanstack/angular-hotkeys'
import type { HotkeyChord } from '@tanstack/angular-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

@Component({
  selector: 'app-save-button',
  template: `<button (click)="save()">Save <kbd>{{ saveLabel }}</kbd></button>`,
})
export class SaveButtonComponent {
  readonly saveLabel = formatForDisplay(saveHotkey)

  constructor() {
    injectHotkey(saveHotkey, () => this.save())
  }

  save() {
    // ...
  }
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

If your app renders on the server, such as with Angular SSR or Analog, use `injectFormatForDisplay` instead, so the server's HTML shows the user's platform. See [Format labels in server-rendered apps](./guides/formatting-display#format-labels-in-server-rendered-apps).

## Hotkeys follow your components

A hotkey is registered when the component that injects it is created, and unregistered when that component is destroyed. Put each hotkey in the component it belongs to, so it is active only while that component exists:

```ts
import { Component, output, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-settings-dialog',
  template: `<div role="dialog">...</div>`,
})
export class SettingsDialogComponent {
  readonly closed = output()

  constructor() {
    // Registered only while the dialog exists
    injectHotkey('Escape', () => this.closed.emit())
  }
}

@Component({
  selector: 'app-root',
  imports: [SettingsDialogComponent],
  template: `
    <button (click)="isOpen.set(true)">Settings</button>
    @if (isOpen()) {
      <app-settings-dialog (closed)="isOpen.set(false)" />
    }
  `,
})
export class AppComponent {
  readonly isOpen = signal(false)
}
```

For a condition that doesn't match a component, pass `enabled`. Pass options as a function, so they follow your signals:

```ts
injectHotkey('Mod+S', () => this.save(), () => ({
  enabled: this.hasUnsavedChanges(),
}))
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add providers and scopes](#add-providers-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, read the element with `viewChild` and pass it as `target`:

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-panel',
  template: `<div #panel tabindex="0">...</div>`,
})
export class PanelComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    // Fires only while the panel, or something inside it, has focus
    injectHotkey('Escape', () => this.closePanel(), { target: this.panel })
  }
}
```

The hotkey registers once the element renders. The hotkey fires while focus is on the element or inside it. If nothing there can take focus, give the element a `tabindex`.

## Add providers and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component exists. You don't need a provider for that.

Add `provideHotkeys` to your application config to set default options for every hotkey, such as more time between sequence steps:

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [provideHotkeys({ defaultOptions: { hotkey: { timeout: 1500 } } })],
}
```

Add `provideHotkeys` to a component's `providers` to group hotkeys into scopes. Every hotkey injected in that component and its children belongs to the scope. Make the scope `exclusive`, and while the component exists, only its hotkeys work. Use one for dialogs and popups that should own the keyboard:

```ts
import { Component, output } from '@angular/core'
import { injectHotkeys, provideHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-confirm-dialog',
  providers: [provideHotkeys({ scope: 'confirm-dialog', exclusive: true })],
  template: `<div role="dialog">...</div>`,
})
export class ConfirmDialogComponent {
  readonly confirmed = output()
  readonly cancelled = output()

  constructor() {
    injectHotkeys([
      { hotkey: 'Enter', callback: () => this.confirmed.emit() },
      { hotkey: 'Escape', callback: () => this.cancelled.emit() },
    ])
  }
}
```

While the dialog is open, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog closes, they work again.

A component's `providers` apply to the component itself, so the dialog can inject its own hotkeys. [provideHotkeys and Scopes](./guides/provide-hotkeys-and-scopes) covers nested scopes, precedence, and turning a scope off without destroying it.

## Next steps

Learn more about the basics:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [Held Key State Helpers](./guides/held-key-state-helpers): show which keys are held
- [Hotkey Hints](./guides/hotkey-hints): show a button's shortcut while the user holds its modifiers
- [Devtools](../../devtools): inspect registered hotkeys, scopes, and held keys while you develop

As your app grows:

- [provideHotkeys and Scopes](./guides/provide-hotkeys-and-scopes): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [App Hotkeys](./guides/app-hotkeys): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./guides/cheat-sheet-ui-helpers): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./guides/custom-hotkey-recording): record the shortcut a user presses
- [Hotkey Manager](./guides/hotkey-manager): register and inspect hotkeys outside components
