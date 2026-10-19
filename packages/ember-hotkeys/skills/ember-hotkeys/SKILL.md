---
name: ember-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in an Ember app with
  @tanstack/ember-hotkeys: the useHotkey and useHotkeys template helpers,
  onHotkey and onHotkeys element modifiers, createHotkeysScope defaults,
  scopes activated from the hotkey manager, app hotkeys, recorders, and held
  keys in strict-mode .gts components, or replacing keydown event listeners.
metadata:
  purpose: >-
    Ember bindings for TanStack Hotkeys: template helpers, element modifiers,
    owner-bound state readers, manager-activated scopes, and the
    Ember-specific mistakes to avoid.
  type: framework
  framework: ember
  library: '@tanstack/ember-hotkeys'
  library_version: '0.4.0'
sources:
  - src/useHotkey.ts
  - src/useHotkeys.ts
  - src/onHotkey.ts
  - src/onHotkeys.ts
  - src/createHotkeysScope.ts
  - src/useAppHotkeys.ts
  - TanStack/hotkeys:docs/framework/ember/quick-start.md
  - TanStack/hotkeys:docs/framework/ember/guides/app-hotkeys.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Ember

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { array } from '@ember/helper'
import { onHotkey, useHotkey } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  @tracked dirty = false
  save = () => saveDocument()
  close = () => closePanel()
  scrollToTop = () => window.scrollTo({ top: 0 })

  <template>
    {{useHotkey "Mod+S" this.save enabled=this.dirty}}
    {{useHotkey (array "G" "G") this.scrollToTop}}
    <div tabindex="0" {{onHotkey "Escape" this.close}}>Panel</div>
  </template>
}
```

| Task                    | API                                                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Register                | `{{useHotkey hotkey callback ...options}}`, `{{useHotkeys definitions}}`; `{{onHotkey}}` and `{{onHotkeys}}` modifiers for one element          |
| Shared defaults         | `hotkeys = createHotkeysScope(defaults)`, then `{{this.hotkeys.useHotkey ...}}`                                                                 |
| Scopes                  | `getHotkeyManager().activateScope(scope, { exclusive })`, plus `scope=` on each hotkey                                                          |
| App hotkeys             | `provideAppHotkeys(appHotkeys, options)` before boot, then `useAppHotkeys(this)`, `useAppHotkeyList(this)`, `useCustomHotkeys(this)`            |
| Record, list, held keys | `useHotkeyRecorder(this, options)`, `useHotkeyRegistrations(this)`, `useKeyHold(this, key)`, `useHeldKeys(this)`, `useHotkeyHint(this, hotkey)` |

The helpers are template helpers, not JavaScript functions. State readers take the component as their owner, and their state is read through `.value`. Use Ember 6.8 or newer and strict-mode `.gts` components.

## Pitfalls

- **Use arrow-function fields, or `@action`, for callbacks.** The helpers call a callback without the component as `this`, so a plain method throws when the key is pressed.
- **Build template sequences with `array`.** `{{useHotkey "G G" ...}}` registers a single key named `G G`, which never matches.
- **`createHotkeysScope` isn't a hotkey scope.** It only sets defaults for its helpers. For a dialog, call `getHotkeyManager().activateScope(name, { exclusive: true })` in the constructor, pass the result to `registerDestructor(this, release)`, and put `scope=name` on the dialog's hotkeys. Give each open dialog its own name.
- **Read app hotkeys through getters.** Template paths can't index ids that contain dots.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Ember](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/ember-hotkeys/dist/*.d.ts`, with state shapes in `types.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/ember/guides/<page>.md`, such as `hotkeys` or `app-hotkeys`.
