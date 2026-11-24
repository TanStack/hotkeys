---
title: HotkeysProvider, Default Options, and Hotkey Scopes in Solid
id: hotkeys-provider-and-scopes
description: Use HotkeysProvider in Solid to set default options for hotkeys and recorders, provide app hotkeys, and turn groups of hotkeys on and off with the dialogs, panels, and tabs they belong to.
---

`HotkeysProvider` is optional. Without one, every hotkey uses the built-in defaults and belongs to the `'global'` scope, staying active whenever its component is mounted.

Add `HotkeysProvider` to:

- Override default options for hotkeys or recorders in part of your app
- Supply [app hotkeys](./app-hotkeys) and load or save custom user bindings
- Group shortcuts into scopes that turn on and off together, such as modals, panels, or tabs

## Set default options

Pass `defaultOptions` to configure defaults for everything nested inside the provider:

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

function Root() {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: { requireReset: true, timeout: 1500 },
        hotkeyRecorder: { idleTimeoutMs: 2000 },
      }}
    >
      <App />
    </HotkeysProvider>
  )
}
```

- **`hotkey`.** Sets defaults for every `createHotkey` and `createHotkeys` inside the provider (`requireReset` applies to chords, and `timeout` applies to sequences). Primitive-level options always override provider defaults. See [Hotkey options](./hotkeys#hotkey-options).
- **`hotkeyRecorder`.** Sets defaults for every `createHotkeyRecorder` inside the provider. See [Hotkey Recording](./custom-hotkey-recording).
- **`keyboardLayout: false`.** Prevents display formatters from querying the browser's keyboard layout map. See [Label physical keys for the user's keyboard](./formatting-display#label-physical-keys-for-the-users-keyboard).

Nested providers merge their `defaultOptions` over their parent's, so a feature subtree can customize defaults without replacing root settings.

## Provide app hotkeys

Pass your declared [app hotkeys](./app-hotkeys), the user's saved overrides, and a change handler to the root provider:

```tsx
<HotkeysProvider
  appHotkeys={appHotkeys}
  customHotkeys={savedHotkeys}
  onCustomHotkeysChange={saveHotkeys}
>
  <App />
</HotkeysProvider>
```

Nested providers inherit `appHotkeys` and `customHotkeys` from above, so configure them once at the root.

## Group hotkeys into scopes

Apps constantly reuse keys. `Escape` should close the active dialog rather than the panel behind it, and `Mod+S` in a comment box should post the comment instead of saving the document. Rather than passing [`enabled`](./hotkeys#enable-and-disable-hotkeys) to every call and coordinating across components, wrap regions of your component tree in scoped providers.

Every `createHotkey` and `createHotkeys` call inherits the `scope` of its nearest scoped ancestor provider. Components outside any scoped provider belong to `'global'`, which is always active:

```tsx
import { HotkeysProvider, createHotkey } from '@tanstack/solid-hotkeys'

function App() {
  return (
    <HotkeysProvider>
      <Toolbar />
      <HotkeysProvider scope="editor">
        <Editor />
      </HotkeysProvider>
    </HotkeysProvider>
  )
}

function Editor() {
  // Belongs to 'editor'
  createHotkey('Mod+B', () => toggleBold())
  return <div>...</div>
}
```

Keep two scope rules in mind:

- **Providers without `scope` inherit.** A nested provider that only sets `defaultOptions` stays in its parent's scope.
- **Scopes are identified by name.** Two mounted providers with `scope="editor"` share the same `'editor'` scope, which stays active until both unmount. Give independent regions distinct names so they toggle separately.

## Scopes and targets

A scope and a [`target`](./hotkeys#hotkey-targets) both constrain when a hotkey fires, using two different axes:

| | Scope | Target |
| --- | --- | --- |
| Controls | Whether the hotkey is active | Which DOM events reach the hotkey |
| Driven by | Mounted and enabled providers | Focus location |
| Follows | Solid tree (including portals) | DOM hierarchy |
| Configured via | `HotkeysProvider scope` or `scope` option | `target` option |
| Best for | Dialogs, panels, tabs, views | Focusable widgets (lists, code editors) |

A hotkey can use both at once:

```tsx
import { createSignal } from 'solid-js'

function Editor() {
  const [outline, setOutline] = createSignal<HTMLElement | null>(null)

  // Active anywhere while the 'editor' scope is active
  createHotkey('Mod+B', () => toggleBold())

  // Active in 'editor' and only while focus is inside the outline
  createHotkey('Delete', () => deleteHeading(), () => ({ target: outline() }))

  return <nav ref={setOutline} tabindex={0}>...</nav>
}
```

## Nested scopes win

When multiple active scopes register the same chord on the same [`target`](./hotkeys#hotkey-targets), only the highest-precedence scope runs (sequences in multiple active scopes advance and fire independently unless suspended by an `exclusive` scope):

1. A nested scope beats its parent scopes.
2. Sibling scopes resolve by activation order, so the most recently activated scope wins.

```tsx
function Page() {
  return (
    <HotkeysProvider scope="document">
      <DocumentView />
    </HotkeysProvider>
  )
}

function DocumentView() {
  createHotkey('Mod+S', () => saveDocument())

  return (
    <HotkeysProvider scope="comments">
      <CommentBox />
    </HotkeysProvider>
  )
}

function CommentBox() {
  // Wins while rendered because 'comments' is nested inside 'document'
  createHotkey('Mod+S', () => postComment())
  return <textarea />
}
```

When `CommentBox` unmounts, `Mod+S` automatically goes back to saving the document.

Element-targeted hotkeys still fire before document hotkeys when focus is inside that element, provided their scope is active. Because registrations in different scopes don't conflict, `conflictBehavior` won't warn about them.

## Turn a scope off with `enabled`

Pass `enabled={false}` to suspend a scope without unmounting its tree, which fits tabs, split views, or background drawers that preserve DOM state:

```tsx
function Folders() {
  const [current, setCurrent] = createSignal('inbox')

  return (
    <For each={folders}>
      {(name) => (
        <HotkeysProvider scope={name} enabled={current() === name}>
          <FolderPane name={name} />
        </HotkeysProvider>
      )}
    </For>
  )
}

function FolderPane(props: { name: string }) {
  // Only the active folder pane handles Alt+N
  createHotkey('Alt+N', () => addItem(props.name))
  return <div>...</div>
}
```

`FolderPane` doesn't know which folder is current. Provider props are reactive, so the scope turns on and off as `current` changes. Note two details:

- **`enabled` cascades downward.** Disabling a provider deactivates every nested scope inside it, even if that provider sets no `scope` of its own. A scopeless provider with `enabled={false}` leaves its own hotkeys active because `'global'` cannot be disabled.
- **Inactive scopes stay listed.** Their hotkeys remain visible in devtools and report `'suspended'` in [`createAppHotkeyList`](./cheat-sheet-ui-helpers#list-every-app-hotkey).

## Exclusive scopes

An `exclusive` scope suspends all other scopes, including `'global'`, while active. Use it for modals, command palettes, and confirmation dialogs that should own the keyboard:

```tsx
function EditDialog(props: { onClose: () => void }) {
  return (
    <HotkeysProvider scope="edit-dialog" exclusive>
      <DialogBody onClose={props.onClose} />
    </HotkeysProvider>
  )
}

function DialogBody(props: { onClose: () => void }) {
  createHotkeys([
    { hotkey: 'Escape', callback: () => props.onClose() },
    { hotkey: 'Mod+S', callback: () => saveAndClose() },
  ])
  return (
    <Portal>
      <div role="dialog">...</div>
    </Portal>
  )
}
```

While open, `Mod+S` saves the dialog rather than the page behind it. Scope follows the component tree rather than the DOM, so the `Portal` content still inherits `'edit-dialog'`. Nested scopes inside the dialog also keep working.

### Allow other scopes

Pass `exclusive={{ allow: [...] }}` to keep specific scopes active alongside an exclusive one:

```tsx
<HotkeysProvider
  scope="edit-dialog"
  exclusive={{ allow: ['global', 'command-palette'] }}
>
  <DialogBody />
</HotkeysProvider>
```

- Listed scopes still work only if they're rendered and enabled (`'global'` is always active).
- Allowed scopes still obey normal precedence. A newer allowed popover opening over the dialog gets `Escape` first.
- Inline `allow` arrays are compared by value, so a new array with the same scopes doesn't reactivate the scope.

### Stacked exclusive scopes

When two exclusive scopes are active at once, such as a confirmation modal opened from inside an edit dialog, the higher-precedence one wins and only its `allow` list applies. Give each exclusive dialog a unique `scope` name. Activating the same exclusive scope twice logs a dev warning because both providers would stay active together.

## Choose a scope for one hotkey

Pass `scope` to a single call to break out of the nearest provider:

```tsx
function Sidebar() {
  // Stays in 'global' even when Sidebar is rendered inside a feature scope
  createHotkey('Mod+K', () => openPalette(), { scope: 'global' })
  return <nav>...</nav>
}
```

A hotkey can name any scope, though it fires only while a provider or `manager.activateScope` has that scope active.

## Scopes and app hotkeys

An [app hotkey](./app-hotkeys) can declare a `scope` directly, which takes precedence over the provider where it registers:

```ts
export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' }, scope: 'document' },
  'comment.post': { hotkey: 'Mod+S', meta: { name: 'Post comment' }, scope: 'comments' },
  'palette.open': { hotkey: 'Mod+K', meta: { name: 'Command palette' }, scope: 'global' },
})
```

- Declarations without `scope` inherit the provider's scope at registration time.
- **Conflict detection.** `findConflicts` and `setCustomHotkey` allow different named scopes (`document` and `comments`) to share keys. Any app hotkey in `'global'` or without a declared scope conflicts with every other app hotkey using the same binding, so declare `scope` on bindings intended to coexist.
- [`createAppHotkeyList`](./cheat-sheet-ui-helpers#list-every-app-hotkey) marks enabled registrations as `'suspended'` when none of their scopes are active.

## Scopes outside Solid

If you integrate non-Solid overlays, such as third-party dialogs, activate their scopes imperatively via [Activate a scope](./hotkey-manager#activate-a-scope).

## Inspect scopes

The [devtools](../../../devtools) group registrations by scope and display which scopes are active, suspended, allowed, or exclusive. To read the same state inside components, see [Read scope state](./hotkey-manager#read-scope-state).

See the [Scopes example](../examples/scopes) for nested, `enabled`, and `exclusive` scopes working together.
