---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to Lit elements with TanStack Hotkeys. Register hotkeys with decorators and controllers, show them in your UI, and group them into scopes.
---

This guide adds keyboard shortcuts to Lit elements. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Register a hotkey

To register a keyboard shortcut, decorate the method that handles it with `@hotkey`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {
    saveDocument()
  }

  render() {
    return html`<textarea></textarea>`
  }
}
```

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

`@hotkey` works with standard decorators and with TypeScript's legacy decorators (`experimentalDecorators: true`), and needs no other setup.

Lit's own decorators have their own rules. With standard decorators, declare `@property` and `@state` fields with the `accessor` keyword. With legacy decorators, set `useDefineForClassFields: false`. The examples here use legacy decorators. See Lit's [decorators guide](https://lit.dev/docs/components/decorators/).

That's all a hotkey needs. Controllers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Register several hotkeys

Decorate one method for each hotkey:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {
    saveDocument()
  }

  @hotkey('Mod+Z')
  undo() {
    undoAction()
  }

  @hotkey('Mod+Shift+Z')
  redo() {
    redoAction()
  }
}
```

For a hotkey that isn't a method, or one that changes at runtime, use `HotkeyController`, shown [below](#hotkeys-follow-your-elements).

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```ts
@hotkey(['G', 'G'])
scrollToTop() {
  window.scrollTo({ top: 0 })
}
```

Each step must follow the previous one within a second. Chords and sequences can sit side by side on the same element:

```ts
@customElement('my-app')
class MyApp extends LitElement {
  @hotkey('Mod+K')
  openSearch() {}

  @hotkey(['G', 'H'])
  goHome() {}

  @hotkey(['G', 'S'])
  goToSettings() {}
}
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { formatForDisplay, hotkey } from '@tanstack/lit-hotkeys'
import type { HotkeyChord } from '@tanstack/lit-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

@customElement('save-button')
class SaveButton extends LitElement {
  @hotkey(saveHotkey)
  save() {
    saveDocument()
  }

  render() {
    return html`
      <button @click=${this.save}>
        Save <kbd>${formatForDisplay(saveHotkey)}</kbd>
      </button>
    `
  }
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your elements

A hotkey is registered when its element connects to the document, and unregistered when the element disconnects. Put each hotkey on the element it belongs to, so it is active only while that element is connected:

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('settings-dialog')
class SettingsDialog extends LitElement {
  // Registered only while the dialog is connected
  @hotkey('Escape')
  close() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    return html`<div role="dialog">...</div>`
  }
}

@customElement('my-app')
class MyApp extends LitElement {
  @state() private isOpen = false

  render() {
    return html`
      <button @click=${() => (this.isOpen = true)}>Settings</button>
      ${this.isOpen
        ? html`<settings-dialog
            @close=${() => (this.isOpen = false)}
          ></settings-dialog>`
        : nothing}
    `
  }
}
```

For a condition that doesn't match an element, pass `enabled`. Decorator options are fixed when the class is defined, so use `HotkeyController` with an options function for values that change:

```ts
import { LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @state() private hasUnsavedChanges = false

  private saveHotkey = new HotkeyController(this, 'Mod+S', () => this.save(), () => ({
    enabled: this.hasUnsavedChanges,
  }))
}
```

A controller adds itself to the element you pass, so a class field is enough. It reads the function again after each update, so keep the values it reads in reactive properties.

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add scopes](#add-scopes-optional).

During server rendering, controllers register nothing and subscribe to nothing, even with `@lit-labs/ssr`'s `connectedCallback: true` option. Read-side controllers report the current state, so the server HTML matches the first client render.

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, pass that element as `target`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-panel')
class MyPanel extends LitElement {
  private panel = createRef<HTMLDivElement>()

  // Fires only while the panel, or something inside it, has focus
  private closeHotkey = new HotkeyController(this, 'Escape', () => this.closePanel(), () => ({
    target: this.panel.value ?? null,
  }))

  render() {
    return html`<div ${ref(this.panel)} tabindex="0">...</div>`
  }
}
```

A `null` target waits until the element renders. The controller reads the target after each update of its own element, so render the target in that element. See [Hotkey targets](./guides/hotkeys#hotkey-targets) for a target that another element renders. The element must be focusable to receive key presses, so give it a `tabindex` if it isn't a control.

## Add scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its element is connected. Lit has no provider for shared defaults, so set options on each hotkey.

Hotkeys can also be grouped into scopes. Every hotkey in a scope turns on and off with it. Make a scope `exclusive`, and while it is active, only its hotkeys work. Use one for dialogs and popups that should own the keyboard.

Lit has no provider to turn scopes on and off. Activate the scope from the hotkey manager while the element is connected, and pass `scope` to its hotkeys:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { getHotkeyManager, hotkey } from '@tanstack/lit-hotkeys'

@customElement('confirm-dialog')
class ConfirmDialog extends LitElement {
  private releaseScope?: () => void

  connectedCallback() {
    super.connectedCallback()
    this.releaseScope = getHotkeyManager().activateScope('confirm-dialog', {
      exclusive: true,
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.releaseScope?.()
  }

  @hotkey('Enter', { scope: 'confirm-dialog' })
  confirm() {
    this.dispatchEvent(new CustomEvent('confirm'))
  }

  @hotkey('Escape', { scope: 'confirm-dialog' })
  cancel() {
    this.dispatchEvent(new CustomEvent('cancel'))
  }

  render() {
    return html`<div role="dialog">...</div>`
  }
}
```

While the dialog is connected, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog disconnects, they work again.

`activateScope` returns a function that releases the scope. A scope stays active until every activation of it is released.

## Next steps

Learn more about the basics:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [Held Key State Helpers](./guides/held-key-state-helpers): show which keys are held
- [Hotkey Hints](./guides/hotkey-hints): show a button's shortcut while the user holds its modifiers

As your app grows:

- [App Hotkeys](./guides/app-hotkeys): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./guides/cheat-sheet-ui-helpers): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./guides/custom-hotkey-recording): record the shortcut a user presses
- [Hotkey Manager](./guides/hotkey-manager): register and inspect hotkeys outside components
