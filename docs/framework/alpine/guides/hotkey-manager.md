---
title: Use the Hotkey Manager Outside Alpine Components
id: hotkey-manager
description: Register hotkeys, read registrations, and activate scopes from code outside Alpine components with the HotkeyManager behind createHotkey.
---

This is an advanced guide. Inside components, `createHotkey` and `createHotkeys` on an owner from `createHotkeysScope` register hotkeys with the manager, apply the owner's defaults, follow getters, and unregister the hotkeys when the owner is destroyed. Use the manager directly only for code that runs outside components and for scopes.

Every hotkey goes to one `HotkeyManager`, shared by the whole page. The manager attaches the keyboard listeners, matches key presses to hotkeys, tracks sequence progress, and decides which scopes are active. Get it with `getHotkeyManager()`:

```ts
import { getHotkeyManager } from '@tanstack/alpine-hotkeys'

const manager = getHotkeyManager()
```

## Register a hotkey

`manager.register` takes the same hotkeys and options as `createHotkey`, and returns a handle:

```ts
const handle = manager.register('Mod+K', () => openCommandPalette())

handle.setOptions({ enabled: false }) // Merges new options into the registration
handle.callback = () => openSearch() // Replaces the callback
handle.unregister() // Removes the hotkey
```

A hotkey registered with the manager differs from one registered on an owner:

- It stays registered until you call `unregister()`. Destroying an owner doesn't remove it.
- The owner's defaults don't apply. It uses the built-in defaults.
- Its hotkey and options are plain values, not getters. To change options later, call `handle.setOptions`.
- During server rendering, `register` returns a handle that does nothing.
- A `null` target, such as a `querySelector` result that found nothing, also returns a handle that does nothing. The handle doesn't wait for the element, so call `register` again once it exists. Omit `target` to listen on `document`. `register` treats `target: undefined` as omitted, so it listens on `document` too.

For example, code that sets up a chart library outside Alpine can register the chart's hotkeys and return a function that removes them:

```ts
import { getHotkeyManager } from '@tanstack/alpine-hotkeys'

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

In a component, read registrations with `createHotkeyRegistrations` on an owner. See [List the hotkeys on screen](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

Outside components, ask the manager:

```ts
manager.getRegistrationCount() // How many hotkeys are registered
manager.isRegistered('Mod+S') // Whether any registration matches
manager.isRegistered('Escape', panelElement) // Whether one matches on that target
```

`isRegistered` compares hotkeys the way [duplicate detection](./hotkeys#handle-duplicate-hotkeys) does, so `Meta+S` matches a `Mod+S` registration on macOS.

`manager.registrations` is a store that holds every registration in a `Map`, keyed by id. It reads and subscribes like a [TanStack Store](https://tanstack.com/store), so it also works with TanStack Store's framework adapters. Subscribe to it to run code when registrations change:

```ts
const subscription = manager.registrations.subscribe((registrations) => {
  console.log(`${registrations.size} hotkeys registered`)
})

subscription.unsubscribe()
```

The store also updates each time a hotkey fires and each time a sequence advances, so keep subscribers fast. Registrations in the store include their callbacks. To get the view that `createHotkeyRegistrations` returns, without the callback, pass a registration to `toHotkeyRegistrationView`.

## Activate a scope

Alpine has no provider, so the manager is how you turn scopes on and off. [Add defaults and scopes](../quick-start#add-defaults-and-scopes-optional) shows a component that activates a scope from `init()` to `destroy()`. The same works for UI that Alpine doesn't render, such as a dialog from another library. Activate the scope, and pass `scope` to the hotkeys that belong to it:

```ts
const releaseScope = manager.activateScope('image-viewer', { exclusive: true })
const close = manager.register('Escape', () => viewer.close(), {
  scope: 'image-viewer',
})

// When the viewer closes
close.unregister()
releaseScope()
```

`activateScope` returns a function that releases the scope. A scope stays active until every activation of it is released. `activateScope` takes these options:

- `exclusive` suspends every other scope, including `'global'`, while this scope is active. Pass `{ allow: ['global'] }` to keep the listed scopes working.
- `parent` names the scope this one is nested in, so this scope takes precedence over it. The default is `'global'`.

### Read scope state

`manager.isScopeActive(scope)` returns whether hotkeys in a scope can fire. To list which registered hotkeys are on, read each registration's `status`. See [List the hotkeys on screen](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

`manager.scopes` is a store with these fields:

- `active` lists the activated scopes, lowest precedence first. `'global'` is always active, so it isn't listed.
- `exclusive` is the exclusive scope that owns the keyboard, or `null`.
- `allowed` lists the active scopes that the exclusive scope allows.
- `suspended` lists the active scopes that can't fire because another scope is exclusive. It can include `'global'`.

To read it in a component, call `createHotkeyScopesState` on an owner from `createHotkeysScope`. Its `value` updates when scopes activate or release:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('keyboardOwner', () => {
  const hotkeys = createHotkeysScope()
  const scopes = hotkeys.createHotkeyScopesState()

  return {
    get exclusive() {
      return scopes.value.exclusive
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<p x-data="keyboardOwner" x-show="exclusive">
  Shortcuts belong to <span x-text="exclusive"></span>
</p>
```

## Suspend character key shortcuts

Call `manager.suspendCharacterKeys()` to pause document-level hotkeys made only of keys that type a character, such as `K`, `Shift+/`, or `['G', 'H']`. Hotkeys with `Control`, `Alt`, or `Meta`, non-character keys such as `Escape`, and hotkeys targeted at an element keep working. Suspensions are counted like scope activations, so character key shortcuts stay suspended until every returned resume function runs:

```ts
const resume = manager.suspendCharacterKeys()
resume()
```

Read `manager.scopes.state.characterKeysSuspended` to check whether character keys are suspended. Keep the returned resume function and call it when the user turns single-key shortcuts back on. See [Accessibility](./accessibility#let-users-turn-off-character-key-shortcuts).

## Reset sequence progress

`manager.resetSequenceProgress()` clears the steps the user has pressed in every sequence. Call it when an action in your app should cancel a sequence the user has started.

## Match a sequence on your own

`createSequenceMatcher` matches one sequence against keyboard events you pass it, without registering anything with the manager. Use it in a keyboard listener you already own:

```ts
import { createSequenceMatcher } from '@tanstack/alpine-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (event) => {
  if (matcher.match(event)) scrollToTop()
})
```

The matcher tracks its own progress. `getProgress()` returns the number of steps matched so far, and `reset()` starts over. It doesn't skip text fields, prevent the browser's action, or check scopes, so handle those in your listener if you need them.

## Testing

To reset `HotkeyManager` and `KeyStateTracker` between tests and pin the platform, see [Testing](./testing).

The [`HotkeyManager` reference](../../../reference/classes/HotkeyManager.md) lists every method.
