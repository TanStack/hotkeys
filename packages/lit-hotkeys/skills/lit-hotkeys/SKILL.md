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
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { HotkeyController, hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
export class MyEditor extends LitElement {
  @state() private dirty = false

  @hotkey('Mod+K')
  openSearch() {}

  constructor() {
    super()
    this.addController(
      new HotkeyController(
        this,
        'Mod+S',
        () => this.save(),
        () => ({ enabled: this.dirty }),
      ),
    )
  }

  save() {}

  render() {
    return html`<textarea @input=${() => (this.dirty = true)}></textarea>`
  }
}
```

| Task                    | API                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Register                | `@hotkey(hotkey, options?)` on a method, with fixed options; `new HotkeyController(host, hotkey, callback, options?)` for options that change |
| Scopes                  | `getHotkeyManager().activateScope(scope, { exclusive })`, plus `scope` on each hotkey                                                         |
| App hotkeys             | `provideAppHotkeys(appHotkeys, options)` once at startup, then `new AppHotkeysController(this)`                                               |
| Record, list, held keys | `HotkeyRecorderController`, `HotkeyRegistrationsController`, `KeyHoldController`, `HeldKeysController`, `HotkeyHintController`                |

## Pitfalls

- **Add `HotkeyController` to its host.** It is the only controller that doesn't add itself, so without `this.addController(...)` it never registers.
- **`@hotkey` is a legacy decorator.** It needs `"experimentalDecorators": true` and `"useDefineForClassFields": false`; with standard decorators it fails with TS1241. Use `HotkeyController` in that case.
- **Decorator options are fixed when the class is defined.** For options that read instance state, or a `target` from a `ref`, use `HotkeyController` with an options function, which reruns after each update.
- **Release every scope you activate.** Lit has no provider, so a dialog activates its scope in `connectedCallback` with `this.release = getHotkeyManager().activateScope('dialog-1', { exclusive: true })` and calls `this.release()` in `disconnectedCallback`. A forgotten release keeps every other hotkey suspended. Give each open dialog its own scope name.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Lit](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/lit-hotkeys/dist/controllers/*.d.ts` and `dist/decorators/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/lit/guides/<page>.md`, such as `hotkeys` or `app-hotkeys`.
