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
  - src/useHotkeyRecorder.ts
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

## API

| API                                                 | What it's for                                                                                                                                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{useHotkey hotkey callback ...options}}`          | Register one chord, sequence, or app hotkey while the template renders the helper.                                                                                                     |
| `{{useHotkeys definitions}}`                        | Register several hotkeys, or a list built from data, in one helper.                                                                                                                    |
| `{{onHotkey hotkey callback ...options}}`           | Attach a hotkey to the element the modifier is on, so it fires while focus is inside that element.                                                                                     |
| `{{onHotkeys definitions}}`                         | Attach several hotkeys to one element.                                                                                                                                                 |
| `createHotkeysScope(defaults?)`                     | Create `useHotkey`, `useHotkeys`, `onHotkey`, and `onHotkeys` that share default options.                                                                                              |
| `provideAppHotkeys(appHotkeys, options?)`           | Declare app hotkeys and load the user's custom hotkeys before the app boots, since Ember has no provider.                                                                              |
| `getHotkeyManager().activateScope(scope, options?)` | Turn on a scope, such as an exclusive one for a dialog; it returns the function that turns the scope off.                                                                              |
| `useAppHotkeys(this)`                               | Get the declared app hotkeys with the user's custom hotkeys applied.                                                                                                                   |
| `useAppHotkeyList(this)`                            | List every app hotkey with its status, for a cheat sheet or settings screen.                                                                                                           |
| `useCustomHotkeys(this)`                            | Read, change, and reset the user's custom hotkeys, and check a new one for conflicts.                                                                                                  |
| `useHotkeyRecorder(this, options, scope?)`          | Record a chord or sequence the user presses, for a settings screen. Pass a `createHotkeysScope` result to apply its `hotkeyRecorder` defaults.                                         |
| `useHotkeyRegistrations(this)`                      | Read `.hotkeys`, every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope).                                                         |
| `useHotkeyScopesState(this)`                        | Get the active scopes and the exclusive scope that owns the keyboard.                                                                                                                  |
| `useHotkeyHint(this, hotkey, options?)`             | Get whether held modifiers should reveal a shortcut's hint. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target. |
| `useKeyHold(this, key)`                             | Get whether one key is held.                                                                                                                                                           |
| `useHeldKeys(this)`                                 | Get every key that's held right now.                                                                                                                                                   |
| `useHeldKeyCodes(this)`                             | Map each held key to its physical `event.code`.                                                                                                                                        |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

The helpers are template helpers, not JavaScript functions. State readers take the component as their owner, and their state is read through `.value`, or `.hotkeys` for registrations. Use Ember 6.8.3 or newer, except 6.9.0 and 6.10.0, and strict-mode `.gts` components.

## Pitfalls

- **Use arrow-function fields, or `@action`, for callbacks.** The helpers call a callback without the component as `this`, so a plain method throws when the key is pressed.
- **Build template sequences with `array`.** `{{useHotkey "G G" ...}}` registers a single key named `G G`, which never matches.
- **`createHotkeysScope` isn't a hotkey scope.** It only sets defaults for its helpers. For a dialog, call `getHotkeyManager().activateScope(name, { exclusive: true })` in the constructor, pass the result to `registerDestructor(this, release)`, and put `scope=name` on the dialog's hotkeys. Give each open dialog its own name.
- **Read app hotkeys through getters.** Template paths can't index ids that contain dots.
- **Scopes have no `useHotkeyRecorder`** since v0.9.0. Call `useHotkeyRecorder(this, options, this.hotkeys)`, so apps that set defaults but don't record don't ship the recorder.
- **Server-rendered labels need the user's platform.** On the server, `formatForDisplay` can't see the user's OS, so it renders Linux labels that differ after hydration for Mac and Windows users. Pass `platform: detectPlatform(userAgent)` to `createHotkeysScope`, with the user agent from FastBoot's request, and format labels with `format = useFormatForDisplay(this.hotkeys)`, then `{{this.format hotkey}}`. Keep plain `formatForDisplay` for labels that render only in the browser.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Ember](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/ember-hotkeys/dist/*.d.ts`, with state shapes in `types.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/ember/guides/<page>.md`, such as `hotkeys` or `app-hotkeys`.
