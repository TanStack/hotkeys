---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Ember
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Ember while the user holds a modifier, with useHotkeyHint.
---

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `useHotkeyHint` returns an object whose tracked `value` is `true` while the user holds modifiers that belong to a hotkey. It's an optional helper, and it doesn't register anything, so use it alongside the `useHotkey` helper.

## Show a hint next to a button

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import {
  formatForDisplay,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/ember-hotkeys'

const saveHotkey = 'Mod+S'

export default class SaveButton extends Component {
  hint = useHotkeyHint(this, saveHotkey)
  label = formatForDisplay(saveHotkey)
  save = () => {
    /* ... */
  }

  <template>
    {{useHotkey saveHotkey this.save}}
    <button type='button' {{on 'click' this.save}}>
      Save {{#if this.hint.value}}<kbd>{{this.label}}</kbd>{{/if}}
    </button>
  </template>
}
```

While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./formatting-display) covers labels and keycaps.

## When a hint shows

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.

To show a hint only while every modifier is held, pass `exact`:

```ts
hint = useHotkeyHint(this, 'Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to `useHotkeyHint`, so `Mod` resolves the same way. The hotkey and the options can also be getters.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```ts
hint = useHotkeyHint(this, ['Mod+K', 'Mod+C']) // hint.value is true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./app-hotkeys) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small component keeps every button's hint the same:

```gts
import Component from '@glimmer/component'
import {
  formatForDisplay,
  useAppHotkeys,
  useHotkeyHint,
} from '@tanstack/ember-hotkeys'
import type { AppHotkeyId } from '@tanstack/ember-hotkeys'

export default class Hint extends Component<{ Args: { id: AppHotkeyId } }> {
  appHotkeys = useAppHotkeys(this)
  hint = useHotkeyHint(this, () => this.appHotkeys.value[this.args.id])

  get label() {
    const { hotkey } = this.appHotkeys.value[this.args.id]
    return this.hint.value && hotkey ? formatForDisplay(hotkey) : null
  }

  <template>
    {{#if this.label}}<kbd>{{this.label}}</kbd>{{/if}}
  </template>
}
```

```hbs
<button type='button' {{on 'click' this.save}}>Save <Hint @id='doc.save' /></button>
```

## Hide hints for hotkeys that can't fire

`useHotkeyHint` only looks at held keys. It doesn't know whether the hotkey is enabled, its scope is active, or its target has focus. When a hotkey can be off, combine the hint with the same state:

```gts
export default class SaveButton extends Component {
  @tracked dirty = false
  hint = useHotkeyHint(this, saveHotkey)
  label = formatForDisplay(saveHotkey)
  save = () => {
    /* ... */
  }

  get showHint() {
    return this.hint.value && this.dirty
  }

  <template>
    {{useHotkey saveHotkey this.save enabled=this.dirty}}
    <button type='button' {{on 'click' this.save}}>
      Save {{#if this.showHint}}<kbd>{{this.label}}</kbd>{{/if}}
    </button>
  </template>
}
```

## Check held modifiers without the utility

To check outside a component, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options:

```ts
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/ember-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held
```

[Held Key State Helpers](./held-key-state-helpers) covers the tracker and the other held-key utilities.

The [Kitchen Sink example](../examples/kitchen-sink) shows hints next to its navigation links and buttons while Alt or Option is held.
