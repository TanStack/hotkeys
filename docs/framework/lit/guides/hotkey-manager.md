---
title: Use the Hotkey Manager Outside Lit Elements
id: hotkey-manager
description: Register hotkeys, read registrations, and activate scopes from code outside Lit elements with the HotkeyManager behind @hotkey and HotkeyController, and reset it between tests.
---

This is an advanced guide. When you use TanStack Hotkeys with Lit, you usually never need to use the hotkey manager directly. The `@hotkey` decorator and `HotkeyController` register hotkeys with it, unregister them when the element disconnects, and call methods with the element as `this`. Use the manager for code that runs outside elements, for scopes, and in tests.

Every hotkey goes to one `HotkeyManager`, shared by the whole page. The manager attaches the keyboard listeners, matches key presses to hotkeys, tracks sequence progress, and decides which scopes are active. Get it with `getHotkeyManager()`:

```ts
import { getHotkeyManager } from '@tanstack/lit-hotkeys'

const manager = getHotkeyManager()
```

## Register a hotkey

`manager.register` takes the same hotkeys and options as `@hotkey`, and returns a handle:

```ts
const handle = manager.register('Mod+K', () => openCommandPalette())

handle.setOptions({ enabled: false }) // Merges new options into the registration
handle.callback = () => openSearch() // Replaces the callback
handle.unregister() // Removes the hotkey
```

A hotkey registered with the manager differs from one registered with `@hotkey` or `HotkeyController`:

- It stays registered until you call `unregister()`. No element connects or disconnects it.
- Its hotkey and options are plain values, not functions. To change options later, call `handle.setOptions`.
- During server rendering, `register` returns a handle that does nothing.

For example, code that sets up a chart library outside Lit can register the chart's hotkeys and return a function that removes them:

```ts
import { getHotkeyManager } from '@tanstack/lit-hotkeys'

export function attachChartHotkeys(chart: Chart, element: HTMLElement) {
  const manager = getHotkeyManager()
  const handles = [
    manager.register('I', () => chart.zoomIn(), { target: element }),
    manager.register('O', () => chart.zoomOut(), { target: element }),
  ]

  return () => handles.forEach((handle) => handle.unregister())
}
```

## Read registrations

In an element, read registrations with `HotkeyRegistrationsController`. See [List the hotkeys on screen](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

Outside elements, ask the manager:

```ts
manager.getRegistrationCount() // How many hotkeys are registered
manager.isRegistered('Mod+S') // Whether any registration matches
manager.isRegistered('Escape', panelElement) // Whether one matches on that target
```

`isRegistered` compares hotkeys the way [duplicate detection](./hotkeys#handle-duplicate-hotkeys) does, so `Meta+S` matches a `Mod+S` registration on macOS.

`manager.registrations` is a [TanStack Store](https://tanstack.com/store) that holds every registration in a `Map`, keyed by id. Subscribe to it to run code when registrations change:

```ts
const subscription = manager.registrations.subscribe((registrations) => {
  console.log(`${registrations.size} hotkeys registered`)
})

subscription.unsubscribe()
```

The store also updates each time a hotkey fires and each time a sequence advances, so keep subscribers fast. Registrations in the store include their callbacks. To get the view that `HotkeyRegistrationsController` holds, without the callback, pass a registration to `toHotkeyRegistrationView`.

## Activate a scope

Lit has no provider, so the manager is how you turn scopes on and off. [Add scopes](../quick-start#add-scopes-optional) shows an element that activates a scope while it's connected. The same works for UI that Lit doesn't render, such as a dialog from another library. Activate the scope, and pass `scope` to the hotkeys that belong to it:

```ts
const releaseScope = manager.activateScope('image-viewer', { exclusive: true })
const close = manager.register('Escape', () => viewer.close(), {
  scope: 'image-viewer',
})

// When the viewer closes
close.unregister()
releaseScope()
```

`activateScope` returns a function that releases the scope. A scope stays active until every activation of it is released. `activateScope` takes two options:

- `exclusive` suspends every other scope, including `'global'`, while this scope is active. Pass `{ allow: ['global'] }` to keep the listed scopes working.
- `parent` names the scope this one is nested in, so this scope takes precedence over it. The default is `'global'`.

### Read scope state

`manager.isScopeActive(scope)` returns whether hotkeys in a scope can fire. To list which registered hotkeys are on, read each registration's `status`. See [List the hotkeys on screen](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

`manager.scopes` is a store with these fields:

- `active` lists the activated scopes, lowest precedence first. `'global'` is always active, so it isn't listed.
- `exclusive` is the exclusive scope that owns the keyboard, or `null`.
- `allowed` lists the active scopes that the exclusive scope allows.
- `suspended` lists the active scopes that can't fire because another scope is exclusive. It can include `'global'`.

To read it in an element, add a `HotkeyScopesStateController`. It updates the element when scopes activate or release:

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyScopesStateController } from '@tanstack/lit-hotkeys'

@customElement('keyboard-owner')
class KeyboardOwner extends LitElement {
  private scopes = new HotkeyScopesStateController(this)

  render() {
    const { exclusive } = this.scopes.value
    return exclusive ? html`<p>Shortcuts belong to ${exclusive}</p>` : nothing
  }
}
```

## Reset sequence progress

`manager.resetSequenceProgress()` clears the steps the user has pressed in every sequence. Call it when an action in your app should cancel a sequence the user has started.

## Match a sequence on your own

`createSequenceMatcher` matches one sequence against keyboard events you pass it, without registering anything with the manager. Use it in a keyboard listener you already own:

```ts
import { createSequenceMatcher } from '@tanstack/lit-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (event) => {
  if (matcher.match(event)) scrollToTop()
})
```

The matcher tracks its own progress. `getProgress()` returns the number of steps matched so far, and `reset()` starts over. It doesn't skip text fields, prevent the browser's action, or check scopes, so handle those in your listener if you need them.

## Reset the manager in tests

The manager lasts as long as the page, so a test environment keeps it between tests. Elements that disconnect unregister their hotkeys, but hotkeys registered with `manager.register` and scopes activated with `activateScope` stay. Reset the manager after each test:

```ts
import { afterEach, expect, it, vi } from 'vitest'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyManager, hotkey } from '@tanstack/lit-hotkeys'

@customElement('test-editor')
class TestEditor extends LitElement {
  @hotkey('Mod+S', { platform: 'mac' })
  save() {
    this.dispatchEvent(new CustomEvent('save'))
  }
}

afterEach(() => {
  document.body.replaceChildren()
  HotkeyManager.resetInstance()
})

it('saves with Mod+S', async () => {
  const save = vi.fn()
  const editor = new TestEditor()
  editor.addEventListener('save', save)

  document.body.append(editor)
  await editor.updateComplete
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
})
```

`resetInstance` removes every listener and registration, and the next `getHotkeyManager()` call creates a new manager. Held keys have their own tracker, so reset it with `KeyStateTracker.resetInstance()` in tests that read held keys.

`platform: 'mac'` makes `Mod` mean Command, so the test passes on every operating system.

The [`HotkeyManager` reference](../../../reference/classes/HotkeyManager.md) lists every method.
