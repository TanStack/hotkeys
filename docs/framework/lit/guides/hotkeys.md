---
title: Hotkeys Guide
id: hotkeys
---

The `@hotkey` decorator is the primary way to register keyboard shortcuts in Lit applications. It binds a hotkey to a class method, automatically registering when the element connects to the DOM and unregistering when it disconnects. For more dynamic use cases, the `HotkeyController` provides imperative control over hotkey registration.

Both approaches wrap the singleton `HotkeyManager` with automatic lifecycle management tied to Lit's `connectedCallback` / `disconnectedCallback`.

## Logical keys and physical positions

Use a logical binding when the shortcut should follow the character on the active layout. Use a physical binding when it should follow a keyboard position:

| Binding | Identity checked |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | Logical `event.key`, with conservative code fallback |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | Exact `event.code` |
| `Enter` | Logical Enter, including numpad Enter |
| `[Enter]` / `[NumpadEnter]` | Separate physical Enter positions |

Every physical code uses brackets in strings, including names shared with logical keys such as `[Enter]` and `[F13]`. Supported codes are type-safe and available in autocomplete. Do not put a bracketed code in an object's `key` field; use `code`. A binding has either `key` or `code`, never both.

On a layout where the `KeyQ` position produces `a`, `A` follows that character and `[KeyQ]` follows the position. Logical ASCII letters remain layout-aware; conservative physical fallback helps with transformed output such as macOS Option keys. Exact matches take priority over weaker fallbacks among eligible registrations on the same target.

Callbacks expose the same distinction in `context.parsedHotkey`: check `parsed.code !== undefined` before reading its physical identity. Use `formatForDisplay` for labels; stored physical strings retain their brackets.

## Basic usage

### The `@hotkey` decorator

Decorate any method to have it called when a hotkey is pressed:

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
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
@hotkey('Mod+S')
save(event: KeyboardEvent, context: HotkeyCallbackContext) {
  console.log(context.hotkey) 
  console.log(context.parsedHotkey)
}
```

### The `HotkeyController`

For cases where you need to construct the hotkey dynamically or pass a callback that isn't a class method, use `HotkeyController` directly:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  private saveHotkey = new HotkeyController(
    this,
    'Mod+S',
    () => this.save(),
  )

  constructor() {
    super()
    this.addController(this.saveHotkey)
  }

  private save() {
    saveDocument()
  }

  render() {
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.

## Default options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```ts
@hotkey('Mod+S', {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined, // smart default: false for Mod+S, true for single keys
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
save() { /* ... */ }
```

If you omit `target`, the Lit adapter resolves it when the controller connects: it listens on `document` in the browser, and skips registration in non-DOM environments.

### Why these defaults?

Most hotkey registrations are meant to override default browser behavior, such as using `Mod+S` to save a document instead of showing the browser's "Save Page" dialog. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling: `ignoreInputs`

The `ignoreInputs` default depends on the hotkey. Hotkeys involving `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key fire even when focus is inside input elements (text fields, text areas, etc.) and button-type inputs (`type="button"`, `"submit"`, or `"reset"`). Single key shortcuts, and those using only `Shift`/`Alt`, are ignored within non-button inputs so they don't interfere with normal typing.

#### Hotkey conflicts: `conflictBehavior`

When you register a hotkey that is already registered elsewhere in your app, the library logs a warning by default (`conflictBehavior: 'warn'`). This helps catch accidental duplicate bindings during development.

## Hotkey options

### `enabled`

Controls whether the hotkey is active. Defaults to `true`.

```ts
@hotkey('Mod+S', { enabled: true })
save() { saveDocument() }
```

### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```ts
// Browser default is prevented (default behavior)
@hotkey('Mod+S')
save() { saveDocument() }

// Opt out when you want the browser's default behavior
@hotkey('Mod+P', { preventDefault: false })
print() { customPrint() }
```

### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```ts
// Event propagation is stopped (default behavior)
@hotkey('Escape')
close() { closeModal() }

// Opt out when you need the event to bubble
@hotkey('Escape', { stopPropagation: false })
close() { closeModal() }
```

### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```ts
// Fire when the key is released
@hotkey('Shift', { eventType: 'keyup' })
deactivateMode() { this.shiftMode = false }
```

### `requireReset`

When `true`, the hotkey fires only once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```ts
// Only fires once per Escape press, not on key repeat
@hotkey('Escape', { requireReset: true })
closePanel() { this.panelOpen = false }
```

### `ignoreInputs`

When `true`, the hotkey doesn't fire when the user is focused on a text input, textarea, select, or contentEditable element. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) are not ignored. When unset, a smart default applies: `Ctrl`/`Meta` shortcuts and `Escape` fire in inputs; single keys and `Shift`/`Alt` combos are ignored.

```ts
// Single key - ignored in inputs by default (smart default)
@hotkey('K')
openSearch() { /* ... */ }

// Mod+S and Escape - fire in inputs by default (smart default)
@hotkey('Mod+S')
save() { /* ... */ }

// Override: force a single key to fire in inputs
@hotkey('Enter', { ignoreInputs: false })
submit() { /* ... */ }
```

### `target`

The DOM element to attach the event listener to. When omitted, the Lit adapter resolves `document` at connect time in the browser. Can be a DOM element, `document`, or `window`. Pass `null` to intentionally skip registration.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-panel')
class MyPanel extends LitElement {
  private panelRef = createRef<HTMLDivElement>()
  private escapeHotkey?: HotkeyController

  firstUpdated() {
    if (!this.panelRef.value) return

    this.escapeHotkey = new HotkeyController(
      this,
      'Escape',
      () => this.dispatchEvent(new CustomEvent('close')),
      { target: this.panelRef.value },
    )
    this.addController(this.escapeHotkey)
  }

  render() {
    return html`
      <div ${ref(this.panelRef)} tabindex="0">
        <p>Press Escape while focused here to close</p>
      </div>
    `
  }
}
```

> [!NOTE]
> When using a scoped target, make sure the element is focusable (has `tabindex`) so it can receive keyboard events.

### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options:

- `'warn'` (default): logs a warning but allows the registration
- `'error'`: throws an error
- `'replace'`: replaces the existing registration
- `'allow'`: allows multiple registrations silently

```ts
@hotkey('Mod+S', { conflictBehavior: 'replace' })
save() { saveDocument() }
```

### `platform`

Override the auto-detected platform. Useful for testing or for applications that need to force a specific platform behavior.

```ts
@hotkey('Mod+S', { platform: 'mac' })
save() { saveDocument() }
```

## Automatic cleanup

Both the `@hotkey` decorator and `HotkeyController` automatically unregister the hotkey when the element is disconnected from the DOM:

```ts
@customElement('temporary-panel')
class TemporaryPanel extends LitElement {
  // Automatically registered on connect, unregistered on disconnect
  @hotkey('Escape')
  close() { this.remove() }

  render() {
    return html`<div>Panel content</div>`
  }
}
```

## Multiple hotkeys

Register as many hotkeys as you need. Each `@hotkey` decorator is independent:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() { saveDocument() }

  @hotkey('Mod+Z')
  undo() { undoAction() }

  @hotkey('Mod+Shift+Z')
  redo() { redoAction() }

  @hotkey('Mod+F')
  search() { openSearch() }

  @hotkey('Escape')
  dismiss() { closeDialog() }
}
```

## Choosing between decorator and controller

| | `@hotkey` Decorator | `HotkeyController` |
|---|---|---|
| **Best for** | Static, declarative method binding | Dynamic hotkeys, programmatic control |
| **Registration** | Automatic via `connectedCallback` | Automatic via `hostConnected` |
| **Cleanup** | Automatic via `disconnectedCallback` | Automatic via `hostDisconnected` |
| **Dynamic hotkeys** | No (hotkey is fixed at decoration time) | Yes (can construct hotkey at runtime) |
| **Callback binding** | Bound to the host element automatically | Bound to the host element automatically |

Use the `@hotkey` decorator for the common case of binding a static shortcut to a method. Use `HotkeyController` when you need to construct the hotkey string dynamically or manage registration imperatively.

## Metadata (name, description, and group)

Every hotkey registration can carry a `meta` object with a `name`, `description`, and `group`. Metadata never affects hotkey behavior, but it flows through to registrations and devtools, so you can build shortcut palettes and help screens from it.

```ts
@hotkey('Mod+S', { meta: { name: 'Save', description: 'Save the document' } })
save() { saveDocument() }

// Or with HotkeyController:
new HotkeyController(this, 'Mod+S', () => this.save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name`, `description`, and `group` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}

@hotkey('Mod+S', { meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' } })
save() { saveDocument() }
```

Group is descriptive metadata, not an execution scope. A shortcuts panel can group live registration views directly. Disabled registrations remain listed; unmounted registrations disappear.

## Introspecting registrations

Use `HotkeyRegistrationsController` to get a live view of all hotkey and sequence registrations. Use it to build shortcut palettes, help dialogs, or devtools.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRegistrationsController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-palette')
class ShortcutPalette extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    const { hotkeys, sequences } = this.registrations

    return html`
      <h2>Keyboard Shortcuts</h2>
      <ul>
        ${hotkeys.map(
          (reg) => html`
            <li>
              <kbd>${formatForDisplay(reg.hotkey)}</kbd>
              ${reg.options.meta?.name ? html`<span> — ${reg.options.meta.name}</span>` : ''}
              ${reg.options.meta?.description ? html`<p>${reg.options.meta.description}</p>` : ''}
            </li>
          `,
        )}
      </ul>
      ${sequences.length > 0
        ? html`
            <h2>Sequences</h2>
            <ul>
              ${sequences.map(
                (reg) => html`
                  <li>
                    <kbd>${reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}</kbd>
                    ${reg.options.meta?.name ? html`<span> — ${reg.options.meta.name}</span>` : ''}
                  </li>
                `,
              )}
            </ul>
          `
        : ''}
    `
  }
}
```

The controller exposes `hotkeys` and `sequences` arrays. The `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.

## The hotkey manager

Under the hood, both the decorator and controller use the singleton `HotkeyManager`. You can access the manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/lit-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements that have registered hotkeys receive listeners. That beats a single global listener that has to inspect every keystroke.
