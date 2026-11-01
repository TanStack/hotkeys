---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to Ember components with TanStack Hotkeys. Register hotkeys with template helpers, show them in your UI, and group them into scopes.
---

This guide adds keyboard shortcuts to Ember components. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Register a hotkey

TanStack Hotkeys needs no special setup. To register a keyboard shortcut, import the `useHotkey` helper into a strict-mode `.gts` component and invoke it in the template:

```gts
import Component from '@glimmer/component'
import { useHotkey } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  save = () => saveDocument()

  <template>
    {{useHotkey 'Mod+S' this.save}}
    <textarea></textarea>
  </template>
}
```

`useHotkey` is a template helper, not a JavaScript function you call. It registers the hotkey while the helper is rendered.

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

That's all a hotkey needs. Shared defaults, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Register several hotkeys

When a component has more than one hotkey, register them together with the `useHotkeys` helper:

```gts
import Component from '@glimmer/component'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  shortcuts: Array<EmberHotkeyDefinition> = [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  ]

  <template>
    {{useHotkeys this.shortcuts}}
    <textarea></textarea>
  </template>
}
```

For a list that changes, use a tracked array or a getter, and the helper updates its registrations.

## Sequences

Pass an array of chords to register a sequence, pressed one after another. In a template, build the array with the `array` helper from `@ember/helper`:

```hbs
{{useHotkey (array 'G' 'G') this.scrollToTop}}
```

Each step must follow the previous one within a second.

`useHotkeys` accepts chords and sequences in the same array:

```ts
shortcuts: Array<EmberHotkeyDefinition> = [
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
]
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { formatForDisplay, useHotkey } from '@tanstack/ember-hotkeys'
import type { HotkeyChord } from '@tanstack/ember-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

export default class SaveButton extends Component {
  save = () => saveDocument()

  <template>
    {{useHotkey saveHotkey this.save}}
    <button type="button" {{on 'click' this.save}}>
      Save <kbd>{{formatForDisplay saveHotkey}}</kbd>
    </button>
  </template>
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered when its helper renders, and unregistered when the helper is removed from the template. Put each hotkey in the component it belongs to, so it is active only while that component is rendered:

```gts
// settings-dialog.gts
import Component from '@glimmer/component'
import { useHotkey } from '@tanstack/ember-hotkeys'

interface SettingsDialogSignature {
  Args: { onClose: () => void }
}

export default class SettingsDialog extends Component<SettingsDialogSignature> {
  <template>
    {{! Registered only while the dialog is rendered }}
    {{useHotkey 'Escape' @onClose}}
    <div role="dialog">...</div>
  </template>
}
```

```gts
// settings-button.gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import SettingsDialog from './settings-dialog'

export default class SettingsButton extends Component {
  @tracked isOpen = false
  open = () => (this.isOpen = true)
  close = () => (this.isOpen = false)

  <template>
    <button type="button" {{on 'click' this.open}}>Settings</button>
    {{#if this.isOpen}}
      <SettingsDialog @onClose={{this.close}} />
    {{/if}}
  </template>
}
```

For a condition that doesn't match a component, pass `enabled`. Named arguments are options, and tracked values keep them current:

```hbs
{{useHotkey 'Mod+S' this.save enabled=this.hasUnsavedChanges}}
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add defaults and scopes](#add-defaults-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, attach the `onHotkey` modifier to that element:

```gts
import Component from '@glimmer/component'
import { onHotkey } from '@tanstack/ember-hotkeys'

export default class Panel extends Component {
  close = () => closePanel()

  <template>
    {{! Fires only while the panel, or something inside it, has focus }}
    <div tabindex="0" {{onHotkey 'Escape' this.close}}>...</div>
  </template>
}
```

`onHotkeys` does the same for an array of hotkeys. The hotkey fires while focus is on the element or inside it. If nothing there can take focus, give the element a `tabindex`.

## Add defaults and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its helper is rendered.

Ember has no provider, so pass default options to `createHotkeysScope`, and use the helpers and modifiers it returns:

```gts
import Component from '@glimmer/component'
import { array } from '@ember/helper'
import { createHotkeysScope } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  hotkeys = createHotkeysScope({ hotkey: { timeout: 1500 } })
  scrollToTop = () => window.scrollTo({ top: 0 })

  <template>
    {{this.hotkeys.useHotkey (array 'G' 'G') this.scrollToTop}}
  </template>
}
```

Pass it to child components, such as `@hotkeys={{this.hotkeys}}`, so they share the same defaults.

Hotkeys can also be grouped into scopes. Every hotkey in a scope turns on and off with it. Make a scope `exclusive`, and while it is active, only its hotkeys work. Use one for dialogs and popups that should own the keyboard.

Activate the scope from the hotkey manager when the component is created, release it when the component is destroyed, and pass `scope` to the hotkeys that belong to it:

```gts
import Component from '@glimmer/component'
import { registerDestructor } from '@ember/destroyable'
import { getHotkeyManager, useHotkeys } from '@tanstack/ember-hotkeys'
import type Owner from '@ember/owner'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

interface ConfirmDialogSignature {
  Args: { onConfirm: () => void; onCancel: () => void }
}

export default class ConfirmDialog extends Component<ConfirmDialogSignature> {
  shortcuts: Array<EmberHotkeyDefinition> = [
    { hotkey: 'Enter', callback: () => this.args.onConfirm() },
    { hotkey: 'Escape', callback: () => this.args.onCancel() },
  ]

  constructor(owner: Owner, args: ConfirmDialogSignature['Args']) {
    super(owner, args)
    const releaseScope = getHotkeyManager().activateScope('confirm-dialog', {
      exclusive: true,
    })
    registerDestructor(this, releaseScope)
  }

  <template>
    {{useHotkeys this.shortcuts scope='confirm-dialog'}}
    <div role="dialog">...</div>
  </template>
}
```

While the dialog is rendered, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog is removed, they work again.

`activateScope` returns a function that releases the scope. A scope stays active until every activation of it is released. Despite its name, `createHotkeysScope` only sets defaults for the helpers it returns. It doesn't create or activate a hotkey scope.

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
