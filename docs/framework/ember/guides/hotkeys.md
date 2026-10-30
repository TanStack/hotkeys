---
title: Register Hotkeys with useHotkey and useHotkeys in Ember
id: hotkeys
description: Register keyboard shortcuts in Ember with the useHotkey and useHotkeys helpers and the onHotkey modifier. Write chords and sequences, set options, turn hotkeys on and off, and listen on one element.
---

The `useHotkey` template helper registers a keyboard shortcut while it is rendered, and `useHotkeys` registers several. The `onHotkey` and `onHotkeys` modifiers do the same for the element they're attached to. All four take the same hotkeys and options. To register hotkeys outside Ember components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords. In a template, build the array with the `array` helper from `@ember/helper`.

```hbs
{{! Mod and K together }}
{{useHotkey 'Mod+K' this.openSearch}}

{{! G, then H }}
{{useHotkey (array 'G' 'H') this.goHome}}
```

Every helper, modifier, and option in this guide accepts both kinds, and most examples use chords. [Sequences](./sequences) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.

## Register a hotkey

Invoke `useHotkey` in a component's template with a hotkey and a callback:

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

The callback receives the `KeyboardEvent` and a context object. A helper can't tell its callback which kind of hotkey it has, so check `context.kind` before reading `context.parsedChord`:

```ts
import type { HotkeyCallback } from '@tanstack/ember-hotkeys'

save: HotkeyCallback = (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  if (context.kind === 'chord') {
    console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
  }
}
```

The callback reads the component's tracked properties through `this`, so it always sees their current values:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useHotkey } from '@tanstack/ember-hotkeys'

export default class Counter extends Component {
  @tracked count = 0
  increment = () => this.count++

  // Logs the current count, not the count when the component was created
  logCount = () => console.log(this.count)

  <template>
    {{useHotkey 'Mod+Shift+C' this.logCount}}
    <button type="button" {{on 'click' this.increment}}>Count: {{this.count}}</button>
  </template>
}
```

The hotkey and its options can change too. Pass tracked values, and the helper updates after rendering. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```gts
import Component from '@glimmer/component'
import { useHotkey } from '@tanstack/ember-hotkeys'
import type { Hotkey } from '@tanstack/ember-hotkeys'

interface EditorSignature {
  Args: { saveHotkey: Hotkey; readOnly: boolean }
}

export default class Editor extends Component<EditorSignature> {
  save = () => saveDocument()

  get canSave() {
    return !this.args.readOnly
  }

  <template>
    {{useHotkey @saveHotkey this.save enabled=this.canSave}}
    <textarea></textarea>
  </template>
}
```

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and Glint rejects a string that isn't a valid chord:

```hbs
{{useHotkey 'Escape' this.close}}

{{! Command+S on macOS, Control+S elsewhere }}
{{useHotkey 'Mod+S' this.save}}

{{! Modifiers in order: Mod or Control, Alt, Shift, Meta }}
{{useHotkey 'Mod+Alt+Shift+K' this.openCommandLog}}

{{! The W position, whatever the layout types there }}
{{useHotkey '[KeyW]' this.moveUp}}

{{! Type error: Mod comes first }}
{{useHotkey 'Shift+Mod+S' this.saveAs}}
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier. Build it in the template with the `hash` helper from `@ember/helper`, or in a component property:

```gts
import Component from '@glimmer/component'
import { hash } from '@ember/helper'
import { useHotkey } from '@tanstack/ember-hotkeys'
import type { RawHotkeyChord } from '@tanstack/ember-hotkeys'

export default class Shortcuts extends Component {
  saveAs = () => saveDocumentAs()
  runAction = () => run()

  get binding(): RawHotkeyChord {
    return { key: settings.key, mod: settings.mod, shift: settings.shift }
  }

  <template>
    {{! Same as 'Mod+Shift+S' }}
    {{useHotkey (hash key='S' mod=true shift=true) this.saveAs}}
    {{useHotkey this.binding this.runAction}}
  </template>
}
```

Sequence steps can be strings, objects, or a mix:

```hbs
{{useHotkey (array 'G' (hash key='H' shift=true)) this.goToHistory}}
```

Every chord and sequence step registers as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as named arguments:

```hbs
{{! Submit with Enter, even while focus is in a text field }}
{{useHotkey 'Enter' this.submit ignoreInputs=false}}
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S`. `'always'` also stops it while the hotkey can't fire. |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | `'global'` | The scope the hotkey belongs to. See [Add defaults and scopes](../quick-start#add-defaults-and-scopes-optional). |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](../../../guides/sensible-defaults.md) explains why each one was chosen and when to change it. The [`EmberHotkeyCommonOptions` reference](../reference/type-aliases/EmberHotkeyCommonOptions.md) lists the types.

To change a default for several hotkeys, pass default options to `createHotkeysScope`, and use the helpers and modifiers it returns. Options passed to a helper override the defaults:

```gts
import Component from '@glimmer/component'
import { array } from '@ember/helper'
import { createHotkeysScope } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  hotkeys = createHotkeysScope({ hotkey: { requireReset: true, timeout: 1500 } })
  scrollToTop = () => window.scrollTo({ top: 0 })

  <template>
    {{this.hotkeys.useHotkey (array 'G' 'G') this.scrollToTop}}
  </template>
}
```

Pass `this.hotkeys` to child components, such as `@hotkeys={{this.hotkeys}}`, so they share the same defaults. Without defaults, every hotkey uses the built-in defaults in the table. `createHotkeysScope` only sets defaults. It doesn't create a hotkey scope.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. Named arguments accept both, and each applies only to the matching kind, so `timeout` on a chord does nothing. In a `useHotkeys` array, each definition's `options` are typed by its `hotkey`, so TypeScript rejects options for the other kind:

```ts
shortcuts: Array<EmberHotkeyDefinition> = [
  { hotkey: 'Escape', callback: close, options: { requireReset: true } }, // OK
  { hotkey: ['G', 'G'], callback: scrollToTop, options: { timeout: 500 } }, // OK
  { hotkey: 'Escape', callback: close, options: { timeout: 500 } }, // Type error
]
```

Options that apply to many hotkeys at once, such as `createHotkeysScope` defaults, also apply each of these to the matching kind only. In the defaults example above, `requireReset` affects chords, and `timeout` affects sequences.

## Register multiple hotkeys

When a component has more than one hotkey, use `useHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```gts
import Component from '@glimmer/component'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  shortcuts: Array<EmberHotkeyDefinition> = [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ]

  <template>
    {{useHotkeys this.shortcuts}}
    <textarea></textarea>
  </template>
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`.

### Share options

Pass options for every definition as named arguments. A definition's own options override them. This editor's formatting hotkeys toggle, so they share `requireReset=true` to fire once per press, while undo keeps repeating:

```gts
import Component from '@glimmer/component'
import { onHotkeys } from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class RichTextEditor extends Component {
  shortcuts: Array<EmberHotkeyDefinition> = [
    { hotkey: 'Mod+B', callback: () => toggleBold() },
    { hotkey: 'Mod+I', callback: () => toggleItalic() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { requireReset: false } },
  ]

  <template>
    <div contenteditable {{onHotkeys this.shortcuts requireReset=true}}></div>
  </template>
}
```

The `onHotkeys` modifier also makes all three hotkeys listen on the editor only. [Hotkey targets](#hotkey-targets) explains the modifiers.

Options merge in this order: `createHotkeysScope` defaults, then the shared options, then each definition's options.

### Build the list from data

For a list whose length can change, pass a tracked array or a getter that reads tracked state. Replace the array to add or remove entries:

```ts
get shortcuts(): Array<EmberHotkeyDefinition> {
  return this.args.items.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
    options: { enabled: item.enabled },
  }))
}
```

The helper compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.

## Enable and disable hotkeys

A hotkey is on while its helper is rendered. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```gts
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

For a condition that doesn't match a component, pass `enabled` from a tracked value:

```hbs
{{useHotkey 'Mod+S' this.save enabled=this.hasUnsavedChanges}}
```

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses, so pressing `Mod+S` opens the browser's Save dialog. To keep the dialog closed, set `preventDefault: 'always'`:

```hbs
{{useHotkey 'Mod+S' this.save enabled=this.hasUnsavedChanges preventDefault='always'}}
```

With `'always'`, a hotkey that can't fire, because it's disabled or its scope is inactive or suspended, still prevents the browser's action. It doesn't stop propagation, and when another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. To apply it to every hotkey, set it in the default options. We recommend it for most hotkeys, but not for hotkeys you turn off to hand the key back to the browser, such as `Mod+C` or `Tab`. See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone).

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

When a group of hotkeys turns on and off together, put them in a scope instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays rendered, or suspend the rest of the page while a dialog is open. See [Add defaults and scopes](../quick-start#add-defaults-and-scopes-optional).

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. To listen on an element, attach the `onHotkey` modifier to it:

```gts
import Component from '@glimmer/component'
import { onHotkey } from '@tanstack/ember-hotkeys'

export default class Panel extends Component {
  close = () => closePanel()

  <template>
    {{! Fires only while the panel, or something inside it, has focus }}
    <div tabindex="0" {{onHotkey 'Escape' this.close}}>Panel content</div>
  </template>
}
```

The modifier registers the hotkey when the element renders and unregisters it when the element is removed. `onHotkeys` does the same for an array of hotkeys. The `useHotkey` and `useHotkeys` helpers also accept a `target` named argument, such as `window` from a component property.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence on an element advances only on key presses inside the element.

### A target is not a scope

A target and a scope both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use an element target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both. See [Add defaults and scopes](../quick-start#add-defaults-and-scopes-optional).

## Handle duplicate hotkeys

When you register a hotkey that is already registered on the same target and in the same scope, TanStack Hotkeys logs a warning in development, and both callbacks run. Set `conflictBehavior` to change that:

- `'warn'` (default) logs a warning in development and keeps both registrations.
- `'error'` throws an error.
- `'replace'` unregisters the existing registration.
- `'allow'` keeps both without a warning.

The comparison resolves modifiers first, so `Mod+S` and `Meta+S` are duplicates on macOS. Two sequences are duplicates when all their steps match. Sequences that only start with the same chord, such as `['G', 'H']` and `['G', 'S']`, are not duplicates.

The same hotkey in two different scopes is not a duplicate either. When both scopes are active, the scope with higher precedence handles the key.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```hbs
{{useHotkey
  'Mod+S'
  this.save
  meta=(hash name='Save' description='Save the document' group='File')
}}
```

`meta` doesn't change how a hotkey behaves. You can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
