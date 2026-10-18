---
title: Use the Hotkey Manager Outside Angular Components
id: hotkey-manager
description: Register hotkeys, read registrations, and activate scopes from code outside Angular components with the HotkeyManager behind injectHotkey, and reset it between tests.
---

This is an advanced guide. When you use TanStack Hotkeys with Angular, you usually never need to use the hotkey manager yourself. `injectHotkey` and `injectHotkeys` register hotkeys with it, unregister them when the component is destroyed, apply provided defaults and scopes, and follow your signals. Use the manager directly only for code that runs outside components, and in tests.

Every hotkey goes to one `HotkeyManager`, shared by the whole page. The manager attaches the keyboard listeners, matches key presses to hotkeys, tracks sequence progress, and decides which scopes are active. Get it with `getHotkeyManager()`:

```ts
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

const manager = getHotkeyManager()
```

## Register a hotkey

`manager.register` takes the same hotkeys and options as `injectHotkey`, and returns a handle:

```ts
const handle = manager.register('Mod+K', () => openCommandPalette())

handle.setOptions({ enabled: false }) // Merges new options into the registration
handle.callback = () => openSearch() // Replaces the callback
handle.unregister() // Removes the hotkey
```

A hotkey registered with the manager differs from one registered with `injectHotkey`:

- It stays registered until you call `unregister()`, and it doesn't need an injection context.
- Provided defaults and scopes don't apply. It uses the built-in defaults and belongs to the `'global'` scope, unless you pass `scope`.
- Its hotkey and options are plain values, not functions. To change options later, call `handle.setOptions`.
- During server rendering, `register` returns a handle that does nothing.

For example, code that sets up a chart library outside Angular can register the chart's hotkeys and return a function that removes them:

```ts
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

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

In a component, read registrations with `injectHotkeyRegistrations`. See [List the hotkeys on screen](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

Outside components, ask the manager:

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

The store also updates each time a hotkey fires and each time a sequence advances, so keep subscribers fast. Registrations in the store include their callbacks. To get the view that `injectHotkeyRegistrations` returns, without the callback, pass a registration to `toHotkeyRegistrationView`.

## Activate a scope

In components, create scopes with `provideHotkeys` in a component's `providers`. See [provideHotkeys and Scopes](./provide-hotkeys-and-scopes). For UI that Angular doesn't render, such as a dialog from another library, activate the scope on the manager, and pass `scope` to the hotkeys that belong to it:

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

`manager.isScopeActive(scope)` returns whether hotkeys in a scope can fire. `injectHotkeyRegistrations` updates when scopes change, so a list filtered with `isScopeActive` stays current.

`manager.scopes` is a store with these fields:

- `active` lists the activated scopes, lowest precedence first. `'global'` is always active, so it isn't listed.
- `exclusive` is the exclusive scope that owns the keyboard, or `null`.
- `allowed` lists the active scopes that the exclusive scope allows.
- `suspended` lists the active scopes that can't fire because another scope is exclusive. It can include `'global'`.

To read it in a component, copy it into a signal and unsubscribe when the component is destroyed:

```ts
import { Component, DestroyRef, inject, signal } from '@angular/core'
import { getHotkeyManager } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-keyboard-owner',
  template: `
    @if (scopes().exclusive; as owner) {
      <p>Shortcuts belong to {{ owner }}</p>
    }
  `,
})
export class KeyboardOwnerComponent {
  private readonly manager = getHotkeyManager()
  readonly scopes = signal(this.manager.scopes.state)

  constructor() {
    const subscription = this.manager.scopes.subscribe((state) =>
      this.scopes.set(state),
    )
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe())
  }
}
```

The [devtools](../../../devtools) show the same scope state without any code.

## Reset sequence progress

`manager.resetSequenceProgress()` clears the steps the user has pressed in every sequence. Call it when an action in your app should cancel a sequence the user has started.

## Match a sequence on your own

`createSequenceMatcher` matches one sequence against keyboard events you pass it, without registering anything with the manager. Use it in a keyboard listener you already own:

```ts
import { createSequenceMatcher } from '@tanstack/angular-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (event) => {
  if (matcher.match(event)) scrollToTop()
})
```

The matcher tracks its own progress. `getProgress()` returns the number of steps matched so far, and `reset()` starts over. It doesn't skip text fields, prevent the browser's action, or check scopes, so handle those in your listener if you need them.

## Reset the manager in tests

The manager lasts as long as the page, so a test environment keeps it between tests. Destroyed components unregister their hotkeys, but hotkeys registered with `manager.register` and scopes activated with `activateScope` stay. Reset the manager after each test:

```ts
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { HotkeyManager, injectHotkey } from '@tanstack/angular-hotkeys'

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  })
})

afterEach(() => {
  TestBed.resetTestingModule()
  HotkeyManager.resetInstance()
})

it('saves with Mod+S', () => {
  const save = vi.fn()

  TestBed.runInInjectionContext(() => {
    injectHotkey('Mod+S', save, { platform: 'mac' })
  })
  TestBed.flushEffects()
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
})
```

`injectHotkey` registers from an effect, so `TestBed.flushEffects()` runs it before the test presses a key. `resetInstance` removes every listener and registration, and the next `getHotkeyManager()` call creates a new manager. Held keys have their own tracker, so reset it with `KeyStateTracker.resetInstance()` in tests that read held keys.

`platform: 'mac'` makes `Mod` mean Command, so the test passes on every operating system. To set it for every hotkey in a test, add `provideHotkeys({ defaultOptions: { hotkey: { platform: 'mac' } } })` to the testing module's providers.

The [`HotkeyManager` reference](../../../reference/classes/HotkeyManager.md) lists every method.
