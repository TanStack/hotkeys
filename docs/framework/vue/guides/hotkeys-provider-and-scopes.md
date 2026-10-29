---
title: HotkeysProvider, Default Options, and Hotkey Scopes in Vue
id: hotkeys-provider-and-scopes
description: Use HotkeysProvider in Vue to set default options for hotkeys and recorders, provide app hotkeys, and turn groups of hotkeys on and off with the dialogs, panels, and tabs they belong to.
---

`HotkeysProvider` is optional. Without one, every hotkey uses the built-in defaults and belongs to the `'global'` scope, so it works whenever its component is mounted. Many apps never need more. Add a provider when you want to:

- Change the default options for every hotkey or recorder in part of your app.
- Provide [app hotkeys](./app-hotkeys) and the user's custom hotkeys.
- Group hotkeys into scopes that turn on and off together, such as everything in a dialog.

## Set default options

Pass `defaultOptions` to change the defaults for everything inside the provider:

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkey: { requireReset: true, timeout: 1500 },
      hotkeyRecorder: { idleTimeoutMs: 2000 },
    }"
  >
    <App />
  </HotkeysProvider>
</template>
```

- `hotkey` defaults apply to every `useHotkey` and `useHotkeys` inside the provider. `requireReset` applies to chords, and `timeout` to sequences. Options passed to a composable override the defaults. See [Hotkey options](./hotkeys#hotkey-options).
- `hotkeyRecorder` defaults apply to every `useHotkeyRecorder` inside the provider. See [Custom Hotkey Recording](./custom-hotkey-recording).

A nested provider merges its defaults over its parent's, so a provider deeper in the tree can change the defaults for one part of your app.

## Provide app hotkeys

Pass your [app hotkeys](./app-hotkeys) to the root provider, along with the user's saved custom hotkeys, and listen for changes to save them:

```vue
<template>
  <HotkeysProvider
    :app-hotkeys="appHotkeys"
    :custom-hotkeys="savedHotkeys"
    @custom-hotkeys-change="saveHotkeys"
  >
    <App />
  </HotkeysProvider>
</template>
```

Nested providers use the app hotkeys and custom hotkeys of the provider above them, so pass these only once, at the root.

## Group hotkeys into scopes

Apps reuse keys. `Escape` should close the dialog, not the panel behind it, and `Mod+S` should post the comment you are typing, not save the whole document. You could pass [`enabled`](./hotkeys#enable-and-disable-hotkeys) to every hotkey, but then each component has to know about every other component that might want the same key.

Scopes group hotkeys by where they render instead. Wrap part of your tree in a `HotkeysProvider` with a `scope`, and every hotkey registered inside it belongs to that scope. The scope is active while the provider is mounted and enabled, and nested scopes take precedence over the scopes around them.

```vue
<!-- App.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider>
    <Toolbar />
    <HotkeysProvider scope="editor">
      <Editor />
    </HotkeysProvider>
  </HotkeysProvider>
</template>
```

```vue
<!-- Editor.vue -->
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

// Registered in the 'editor' scope
useHotkey('Mod+B', () => toggleBold())
</script>
```

A hotkey registered with `useHotkey` or `useHotkeys` uses the scope of the nearest provider that sets one. Hotkeys outside any scoped provider, including those under the root provider, are in the `'global'` scope, which is always active. A provider without `scope` uses its parent's scope.

To give a component's children a scope without adding `HotkeysProvider` to its template, call `provideHotkeysContext` in its setup. It takes the same options as the provider's props, and `scope`, `exclusive`, and `enabled` accept refs and getters:

```vue
<!-- EditorPane.vue -->
<script setup lang="ts">
import { provideHotkeysContext } from '@tanstack/vue-hotkeys'

const props = defineProps<{ active: boolean }>()

provideHotkeysContext({ scope: 'editor', enabled: () => props.active })
</script>

<template>
  <!-- Editor's hotkeys are in the 'editor' scope -->
  <Editor />
</template>
```

Like Vue's `provide`, it applies to the component's children, not to the component itself. A hotkey registered in the same setup as `provideHotkeysContext` uses the scope above it, so register the scope's hotkeys in a child component.

Scopes are names, not instances. Two mounted providers with `scope="editor"` share one scope, and it stays active until both unmount. Give each region its own name when you need to turn them on and off separately.

## Scopes and targets

A scope and a [target](./hotkeys#hotkey-targets) both limit when a hotkey works, and a hotkey can have both:

```vue
<!-- Editor.vue, rendered inside <HotkeysProvider scope="editor"> -->
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const outline = ref<HTMLElement | null>(null)

// In the 'editor' scope: works wherever focus is, while the scope is active
useHotkey('Mod+B', () => toggleBold())

// Also has a target: works only while focus is inside the outline
useHotkey('Delete', () => deleteHeading(), { target: outline })
</script>

<template>
  <nav ref="outline" tabindex="0">...</nav>
</template>
```

| | Scope | Target |
| --- | --- | --- |
| Decides | Whether the hotkey is on | Which key presses the hotkey receives |
| Based on | Which providers are mounted and enabled | Where focus is |
| Follows | The component tree, including teleports | The DOM |
| Set with | `HotkeysProvider scope`, `provideHotkeysContext`, or the `scope` option | The `target` option |
| Use for | Dialogs, panes, and tabs | Focusable elements, such as a list or a code editor |

## Nested scopes win

When hotkeys in two active scopes match the same key, only one scope handles it:

- A nested scope beats the scopes it is nested in.
- Otherwise, the scope that activated most recently wins.

Every hotkey in the winning scope that matches the key runs. Hotkeys in other scopes do not.

```vue
<!-- DocumentView.vue, rendered inside <HotkeysProvider scope="document"> -->
<script setup lang="ts">
import { HotkeysProvider, useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => saveDocument())
</script>

<template>
  <HotkeysProvider scope="comments">
    <!-- CommentBox registers Mod+S too, and wins while mounted -->
    <CommentBox />
  </HotkeysProvider>
</template>
```

When the comment box unmounts, `Mod+S` saves the document again.

Precedence compares hotkeys on the same [`target`](./hotkeys#hotkey-targets). A hotkey bound to an element still handles events from inside that element before document hotkeys do, as long as its scope is active.

Two registrations of the same hotkey in different scopes are not a conflict, so `conflictBehavior` does not warn about them.

## Turn a scope off with `enabled`

Bind `enabled` to deactivate a provider's scope while it stays mounted. This suits tabs, carousels, and split views that keep inactive panes rendered:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { HotkeysProvider } from '@tanstack/vue-hotkeys'

const current = ref('inbox')
</script>

<template>
  <HotkeysProvider
    v-for="name in folders"
    :key="name"
    :scope="name"
    :enabled="current === name"
  >
    <!-- FolderPane calls useHotkey('Alt+N', ...). Only the current folder's handler runs. -->
    <FolderPane :name="name" />
  </HotkeysProvider>
</template>
```

`FolderPane` doesn't know which folder is current. Without scopes, each pane would need an `enabled` option on every hotkey it registers.

`enabled` is inherited. Disabling a provider also deactivates every scope nested in it. A provider without its own `scope` has no scope to deactivate, so disabling it affects only the scoped providers inside it.

Hotkeys in an inactive scope stay registered. Devtools list them under their inactive scope, and [`useAppHotkeyList`](./cheat-sheet-ui-helpers#list-every-app-hotkey) reports their app hotkeys as `'suspended'`.

## Exclusive scopes

An exclusive scope suspends every other scope while it is active, including `'global'`. Use it for dialogs, menus, and other overlays that should own the keyboard:

```vue
<!-- EditDialog.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider scope="edit-dialog" exclusive>
    <Teleport to="body">
      <!-- DialogBody registers Escape to close and Mod+S to save -->
      <DialogBody />
    </Teleport>
  </HotkeysProvider>
</template>
```

While the dialog is open, `Mod+S` saves the dialog and nothing else, even though the page behind it registers `Mod+S` too. Scopes nested inside the exclusive provider keep working, so the dialog can still be built from scoped components.

A scope follows the component tree, not the DOM. The `Teleport` above renders into `document.body`, but its hotkeys still belong to `edit-dialog`.

### Allow other scopes

Pass `{ allow }` to keep some scopes working while an exclusive scope is active:

```vue
<HotkeysProvider
  scope="edit-dialog"
  :exclusive="{ allow: ['global', 'command-palette'] }"
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

```ts
// Registered in 'global' even when this component renders inside a scope
useHotkey('Mod+K', () => openPalette(), { scope: 'global' })
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

## Scopes outside Vue

For UI that Vue doesn't render, such as a dialog from another library, activate a scope on the hotkey manager. See [Activate a scope](./hotkey-manager#activate-a-scope).

`HotkeysProvider` and `provideHotkeysContext` need a component, because they use `provide` and `onMounted`. A hotkey registered in an `effectScope` outside a component can't read a provider's defaults, scope, or app hotkeys. Pass `scope` in its options instead. See [Choose a scope for one hotkey](#choose-a-scope-for-one-hotkey).

## Inspect scopes

The hotkeys [devtools](../../../devtools) group registrations by scope and show which scopes are active, suspended, allowed, or exclusive.

Your app doesn't need to track scopes itself. If you want to show scope state anyway, read it from the hotkey manager. See [Read scope state](./hotkey-manager#read-scope-state).

See the [Scopes example](../examples/scopes) for nested, enabled, and exclusive scopes together.
