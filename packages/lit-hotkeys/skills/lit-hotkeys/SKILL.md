---
name: lit-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in Lit web components with
  @tanstack/lit-hotkeys: the @hotkey decorator, HotkeyController with an
  options function, element targets, scopes activated from the hotkey manager,
  app hotkey and recorder controllers, held-key controllers, or replacing
  keydown listeners in connectedCallback.
metadata:
  purpose: >-
    Lit bindings for TanStack Hotkeys: the decorator, reactive controllers,
    manager-activated scopes, and the Lit-specific mistakes to avoid.
  type: framework
  framework: lit
  library: '@tanstack/lit-hotkeys'
  library_version: '0.16.0'
sources:
  - src/decorators/hotkey.ts
  - src/controllers/hotkey.ts
  - src/controllers/app-hotkeys.ts
  - src/controllers/hotkey-recorder.ts
  - TanStack/hotkeys:docs/framework/lit/quick-start.md
  - TanStack/hotkeys:docs/framework/lit/guides/app-hotkeys.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Lit

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```ts no-check
import { HotkeyController, hotkey } from '@tanstack/lit-hotkeys'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('my-editor')
export class MyEditor extends LitElement {
  @state() private dirty = false

  @hotkey('Mod+K')
  openSearch() {}

  private saveHotkey = new HotkeyController(
    this,
    'Mod+S',
    () => this.save(),
    () => ({ enabled: this.dirty }),
  )

  save() {}

  render() {
    return html`<textarea @input=${() => (this.dirty = true)}></textarea>`
  }
}
```

## API

| API                                                      | What it's for                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@hotkey(hotkey, options?)`                              | Run the decorated method when the hotkey fires, with options fixed when the class is defined.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `new HotkeyController(host, hotkey, callback, options?)` | Register a hotkey whose options can change. It adds itself to `host`, so a class field is enough.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `provideAppHotkeys(appHotkeys, options?)`                | Declare app hotkeys and load the user's custom hotkeys once at startup, since Lit has no provider.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `getHotkeyManager().activateScope(scope, options?)`      | Turn on a scope, such as an exclusive one for a dialog; it returns the function that turns the scope off.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `new FormatForDisplayController(host, options?)`         | Read `.format`, the function that formats a hotkey as a label, with the controller's `platform` option and the user's keyboard layout filled in. Only Chromium browsers report a layout, so physical keys keep their US labels in Firefox and Safari. Use it for every label in an element: `private formatForDisplay = new FormatForDisplayController(this)` as a field, then `this.formatForDisplay.format(hotkey)`. With Lit SSR, pass `() => ({ platform: this.platform })` and set that property from `detectPlatform(userAgent)`. |
| `new AppHotkeysController(host)`                         | Read `appHotkeys`, the cheat sheet `list`, and `customHotkeys`, and change custom hotkeys with `setCustomHotkey`, `resetCustomHotkey`, and `findConflicts`.                                                                                                                                                                                                                                                                                                                                                                             |
| `new HotkeyRecorderController(host, options)`            | Record a chord or sequence the user presses, for a settings screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `new HotkeyRegistrationsController(host)`                | Read `.hotkeys`, every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope).                                                                                                                                                                                                                                                                                                                                                                                                          |
| `new HotkeyScopesStateController(host)`                  | Read `.value`, the active scopes and the exclusive scope that owns the keyboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `new HotkeyHintController(host, hotkey, options?)`       | Read `.value`, whether held modifiers should reveal a shortcut's hint. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target.                                                                                                                                                                                                                                                                                                                                       |
| `new KeyHoldController(host, key)`                       | Read `.value`, whether one key is held. Pass a getter, such as `() => this.key`, for a key that changes. Letters match in any case; other names, such as `Shift`, are case-sensitive.                                                                                                                                                                                                                                                                                                                                                   |
| `new HeldKeysController(host)`                           | Read `.value`, every key that's held right now.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `new HeldKeyCodesController(host)`                       | Read `.value`, which maps each held key to its physical `event.code`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

The package also re-exports `@tanstack/hotkeys`, such as `matchesKeyboardEvent` and `defineAppHotkeys`. Its plain `formatForDisplay` export is deprecated: use `FormatForDisplayController` in elements. Outside an element, call the plain function and pass `platform`.

## Pitfalls

- **`@hotkey` works with standard and legacy decorators.** It needs no tsconfig change. Lit's `@property` and `@state` have their own rules: with standard decorators they need `accessor` fields; with `"experimentalDecorators": true` they need `"useDefineForClassFields": false`. Match the project's existing mode.
- **Decorator options are fixed when the class is defined.** For options that read instance state, or a `target` from a `ref`, use `HotkeyController` with an options function, which reruns after each update of its host.
- **Remove a controller with `dispose()`.** Lit's `removeController` doesn't call `hostDisconnected`, so a `HotkeyController` removed that way stays registered, even after its host disconnects. For a list that changes, keep each item's controller and call `controller.dispose()` when the item goes. Every controller in this package has `dispose()`.
- **Decorating an override replaces the parent's hotkeys.** With `@hotkey` on both a method and a subclass override, only the subclass's hotkeys register for that method. Leave `@hotkey` off the override to keep the parent's.
- **Render a `ref` target in the controller's host.** The options function reruns only when the host updates. If a child element renders the target, keep it in a reactive property or call `requestUpdate()` on the host when it changes.
- **Release every scope you activate.** Lit has no provider, so a dialog activates its scope in `connectedCallback` with `this.release = getHotkeyManager().activateScope('dialog-1', { exclusive: true })` and calls `this.release()` in `disconnectedCallback`. A forgotten release keeps every other hotkey suspended. Give each open dialog its own scope name.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Lit](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/lit-hotkeys/dist/controllers/*.d.ts` and `dist/decorators/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/lit/guides/<page>.md`, such as `hotkeys` or `app-hotkeys`.
