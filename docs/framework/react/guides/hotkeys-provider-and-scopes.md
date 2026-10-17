---
title: HotkeysProvider, Default Options, and Hotkey Scopes
id: hotkeys-provider-and-scopes
description: Use HotkeysProvider in React to set default options for hotkeys and recorders, provide app hotkeys, and turn groups of hotkeys on and off with the dialogs, panels, and tabs they belong to.
---

`HotkeysProvider` is optional. Without one, every hotkey uses the built-in defaults and belongs to the `'global'` scope, so it works whenever its component is mounted. Many apps never need more. Add a provider when you want to:

- Change the default options for every hotkey or recorder in part of your app.
- Provide [app hotkeys](./app-hotkeys) and the user's custom hotkeys.
- Group hotkeys into scopes that turn on and off together, such as everything in a dialog.

## Set default options

Pass `defaultOptions` to change the defaults for everything inside the provider:

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

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

- `hotkey` defaults apply to every `useHotkey` and `useHotkeys` inside the provider. `requireReset` applies to chords, and `timeout` to sequences. Options passed to a hook override the defaults. See [Hotkey options](./hotkeys#hotkey-options).
- `hotkeyRecorder` defaults apply to every `useHotkeyRecorder` inside the provider. See [Custom Hotkey Recording](./custom-hotkey-recording).

A nested provider merges its defaults over its parent's, so a provider deeper in the tree can change the defaults for one part of your app.

## Provide app hotkeys

Pass your [app hotkeys](./app-hotkeys) to the root provider, along with the user's saved custom hotkeys and a function that saves changes:

```tsx
<HotkeysProvider
  appHotkeys={appHotkeys}
  customHotkeys={savedHotkeys}
  onCustomHotkeysChange={saveHotkeys}
>
  <App />
</HotkeysProvider>
```

Nested providers use the app hotkeys and custom hotkeys of the provider above them, so pass these only once, at the root.

## Group hotkeys into scopes

Apps reuse keys. `Escape` should close the dialog, not the panel behind it, and `Mod+S` should post the comment you are typing, not save the whole document. You could pass [`enabled`](./hotkeys#enable-and-disable-hotkeys) to every hotkey, but then each component has to know about every other component that might want the same key.

Scopes group hotkeys by where they render instead. Wrap part of your tree in a `HotkeysProvider` with a `scope`, and every hotkey registered inside it belongs to that scope. The scope is active while the provider is mounted and enabled, and nested scopes take precedence over the scopes around them.

```tsx
import { HotkeysProvider, useHotkey } from '@tanstack/react-hotkeys'

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
  // Registered in the 'editor' scope
  useHotkey('Mod+B', () => toggleBold())
  return <div>...</div>
}
```

A hotkey registered with `useHotkey` or `useHotkeys` uses the scope of the nearest provider that sets one. Hotkeys outside any scoped provider, including those under the root provider, are in the `'global'` scope, which is always active. A provider without `scope` uses its parent's scope.

Scopes are names, not instances. Two mounted providers with `scope="editor"` share one scope, and it stays active until both unmount. Give each region its own name when you need to turn them on and off separately.

## Scopes and targets

A scope and a [target](./hotkeys#hotkey-targets) both limit when a hotkey works, and a hotkey can have both:

```tsx
function Editor() {
  const outlineRef = useRef<HTMLElement>(null)

  // In the 'editor' scope: works wherever focus is, while the scope is active
  useHotkey('Mod+B', () => toggleBold())

  // Also has a target: works only while focus is inside the outline
  useHotkey('Delete', () => deleteHeading(), { target: outlineRef })

  return <nav ref={outlineRef} tabIndex={0}>...</nav>
}
```

| | Scope | Target |
| --- | --- | --- |
| Decides | Whether the hotkey is on | Which key presses the hotkey receives |
| Based on | Which providers are mounted and enabled | Where focus is |
| Follows | The component tree, including portals | The DOM |
| Set with | `HotkeysProvider scope`, or the `scope` option | The `target` option |
| Use for | Dialogs, panes, and tabs | Focusable elements, such as a list or a code editor |

## Nested scopes win

When hotkeys in two active scopes match the same key, only one scope handles it:

- A nested scope beats the scopes it is nested in.
- Otherwise, the scope that activated most recently wins.

Every hotkey in the winning scope that matches the key runs. Hotkeys in other scopes do not.

```tsx
function Page() {
  return (
    <HotkeysProvider scope="document">
      <DocumentView />
    </HotkeysProvider>
  )
}

function DocumentView() {
  useHotkey('Mod+S', () => saveDocument())

  return (
    <HotkeysProvider scope="comments">
      <CommentBox />
    </HotkeysProvider>
  )
}

function CommentBox() {
  // Wins while mounted, because 'comments' is nested in 'document'
  useHotkey('Mod+S', () => postComment())
  return <textarea />
}
```

When the comment box unmounts, `Mod+S` saves the document again.

Precedence compares hotkeys on the same [`target`](./hotkeys#hotkey-targets). A hotkey bound to an element still handles events from inside that element before document hotkeys do, as long as its scope is active.

Two registrations of the same hotkey in different scopes are not a conflict, so `conflictBehavior` does not warn about them.

## Turn a scope off with `enabled`

Set `enabled={false}` to deactivate a provider's scope while it stays mounted. This suits tabs, carousels, and split views that keep inactive panes rendered:

```tsx
function Folders() {
  const [current, setCurrent] = useState('inbox')

  return folders.map((name) => (
    <HotkeysProvider key={name} scope={name} enabled={current === name}>
      <FolderPane name={name} />
    </HotkeysProvider>
  ))
}

function FolderPane({ name }: { name: string }) {
  // Only the current folder's handler runs
  useHotkey('Alt+N', () => addItem(name))
  return <div>...</div>
}
```

`FolderPane` doesn't know which folder is current. Without scopes, each pane would need an `enabled` option on every hotkey it registers.

`enabled` is inherited. Disabling a provider also deactivates every scope nested in it. A provider without its own `scope` has no scope to deactivate, so `enabled={false}` there affects only the scoped providers inside it.

Hotkeys in an inactive scope stay registered. Devtools list them under their inactive scope, and [`useAppHotkeyList`](./cheat-sheet-ui-helpers#list-every-app-hotkey) reports their app hotkeys as `'suspended'`.

## Exclusive scopes

An exclusive scope suspends every other scope while it is active, including `'global'`. Use it for dialogs, menus, and other overlays that should own the keyboard:

```tsx
function EditDialog({ onClose }: { onClose: () => void }) {
  return (
    <HotkeysProvider scope="edit-dialog" exclusive>
      <DialogBody onClose={onClose} />
    </HotkeysProvider>
  )
}

function DialogBody({ onClose }: { onClose: () => void }) {
  useHotkeys([
    { hotkey: 'Escape', callback: onClose },
    { hotkey: 'Mod+S', callback: () => saveAndClose() },
  ])
  return createPortal(<div role="dialog">...</div>, document.body)
}
```

While the dialog is open, `Mod+S` saves the dialog and nothing else, even though the page behind it registers `Mod+S` too. Scopes nested inside the exclusive provider keep working, so the dialog can still be built from scoped components.

A scope follows the component tree, not the DOM. The portal above renders into `document.body`, but its hotkeys still belong to `edit-dialog`.

### Allow other scopes

Pass `{ allow }` to keep some scopes working while an exclusive scope is active:

```tsx
<HotkeysProvider
  scope="edit-dialog"
  exclusive={{ allow: ['global', 'command-palette'] }}
>
  <DialogBody />
</HotkeysProvider>
```

- An allowed scope still has to be active on its own. Only `'global'` is always active.
- Allowed scopes follow the usual precedence. A popover that opens over the dialog in an allowed scope is newer, so its `Escape` closes the popover first.
- The `allow` array can be written inline. Providers compare it by value, so a new array on each render does not reactivate the scope.

### Stacked exclusive scopes

When more than one exclusive scope is active, the one with the highest precedence owns the keyboard, and only its `allow` list applies. A confirmation dialog opened from inside an edit dialog suspends the edit dialog until it closes.

Each exclusive scope needs a unique name. Activating the same exclusive scope twice logs a warning in development, because hotkeys from both providers would fire together.

## Choose a scope for one hotkey

Pass `scope` to a single hotkey to register it somewhere other than the nearest provider's scope:

```tsx
function Sidebar() {
  // Registered in 'global' even when Sidebar renders inside a scope
  useHotkey('Mod+K', () => openPalette(), { scope: 'global' })
}
```

A hotkey can name any scope, but it fires only while some provider has that scope active.

## Scopes and app hotkeys

An [app hotkey](./app-hotkeys) can declare a `scope`. The declared scope wins over the provider it registers under:

```ts
export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' }, scope: 'document' },
  'comment.post': { hotkey: 'Mod+S', meta: { name: 'Post comment' }, scope: 'comments' },
  'palette.open': { hotkey: 'Mod+K', meta: { name: 'Command palette' }, scope: 'global' },
})
```

App hotkeys without a declared scope use the provider's scope, like any other hotkey.

The declared scope also drives conflict checks. `findConflicts` and `setCustomHotkey` let app hotkeys in different scopes share a hotkey, as `doc.save` and `comment.post` do above. An app hotkey in `'global'`, or with no declared scope, conflicts with every app hotkey that uses the same hotkey. Declare scopes on app hotkeys that are meant to share keys.

`useAppHotkeyList` reports an app hotkey as `'suspended'` when it has enabled registrations but none of them is in an active scope.

## Scopes outside React

For UI that React doesn't render, such as a dialog from another library, activate a scope on the hotkey manager. See [Activate a scope](./hotkey-manager#activate-a-scope).

## Inspect scopes

The hotkeys [devtools](../../../devtools) group registrations by scope and show which scopes are active, suspended, allowed, or exclusive.

Your app doesn't need to track scopes itself. If you want to show scope state anyway, read it from the hotkey manager. See [Read scope state](./hotkey-manager#read-scope-state).

See the [Scopes example](../examples/scopes) for nested, enabled, and exclusive scopes together.
