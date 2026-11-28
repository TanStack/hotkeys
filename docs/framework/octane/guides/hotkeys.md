---
title: Register Hotkeys with useHotkey and useHotkeys in Octane
id: hotkeys
description: Register keyboard shortcuts in Octane with useHotkey and useHotkeys. Write chords and sequences, set options, turn hotkeys on and off, and listen on one element.
---

`useHotkey` registers a keyboard shortcut while its component is mounted, and `useHotkeys` registers a list of them. Both hooks accept the same bindings and options. To register hotkeys outside Octane components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```tsx
useHotkey('Mod+K', () => openSearch()) // Mod and K together
useHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every hook and option in this guide accepts both. See [Sequences](./sequences) for sequence rules such as timeouts and overlapping prefixes.

## Register a hotkey

Pass a hotkey and callback to `useHotkey`:

```tsx
import { useHotkey } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkey('Mod+S', () => saveDocument())

  <textarea />
}
```

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler tracks hooks by call site, so call them at the top level of the component, not in loops or conditions.

Callbacks receive the `KeyboardEvent` and a context object:

```tsx
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The hook reads its arguments after each commit, so callbacks always see fresh props and state without a dependency array:

```tsx
import { useState } from 'octane'

function Counter() @{
  const [count, setCount] = useState(0)

  // Always logs the latest count
  useHotkey('Mod+Shift+C', () => console.log(count))

  <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

Both the hotkey and its options can change between renders. Changing only options updates the existing registration in place. Changing the hotkey or `target` replaces the registration cleanly:

```tsx
function Editor({ saveHotkey, readOnly }: EditorProps) @{
  useHotkey(saveHotkey, () => save(), { enabled: !readOnly })

  <textarea />
}
```

That makes it straightforward to wire up user-chosen shortcuts from the [hotkey recorder](./custom-hotkey-recording) or centralized [App Hotkeys](./app-hotkeys).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which works well for optional shortcut props. Switching to a falsy value unregisters the hotkey and hides any hints. Passing a valid hotkey again registers it again.

To keep the shortcut visible in devtools and cheat sheets while paused, leave the hotkey defined and pass `enabled: false` instead.

### Write a chord as a string or an object

Most chords are written as strings, giving you editor autocomplete and compile-time validation:

```tsx
useHotkey('Escape', () => close())
useHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
useHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Order: Mod or Control, Alt, Shift, Meta
useHotkey('[KeyW]', () => moveUp()) // Physical W position, regardless of layout

useHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod must come first
useHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod already maps to Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./keyboard-layouts).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```tsx
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
useHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

useHotkey(
  { key: binding.key, mod: binding.mod, shift: binding.shift },
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```tsx
useHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

Internally, TanStack Hotkeys normalizes objects to canonical strings, so `context.hotkey` and devtools report `'Mod+Shift+S'` for `{ key: 'S', mod: true, shift: true }`. See [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) for more on physical codes like `[KeyW]`.

### Custom hooks

Group hotkeys in a custom hook. The compiler gives each hook call its own slot only in modules it compiles:

- `.tsrx` and `.tsx` files.
- `.ts` and `.js` files that import a value from `octane`, such as `useState`. A type-only import doesn't count.
- `.ts` and `.js` files that start with `/** @jsxImportSource octane */`.

Calls from any other `.ts` or `.js` file get no slot of their own. In one component, all such calls to the same hook share one slot, even when they come from different custom hooks. Only the last call works, and nothing warns. Add the pragma to every file with a custom hook:

```ts
/** @jsxImportSource octane */
import { useHotkey } from '@tanstack/octane-hotkeys'

export function useEditorShortcuts(editor: Editor) {
  useHotkey('Mod+B', () => editor.toggleBold())
  useHotkey('Mod+I', () => editor.toggleItalic())
}
```

Without the pragma, only `Mod+I` would register. The same happens when one component uses two such custom hooks that each call `useHotkey` once. To register a list in one call, use [`useHotkeys`](#register-multiple-hotkeys).

## Hotkey options

Pass options as the third argument:

```tsx
// Submit with Enter even while focused in a text input
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](../../../guides/sensible-defaults.md#component-libraries-that-handle-the-same-keys). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | Nearest provider's scope | The [scope](./hotkeys-provider-and-scopes) this hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

See [Sensible Defaults](../../../guides/sensible-defaults.md) for why each default behaves the way it does, and [`UseHotkeyOptions`](../reference/type-aliases/UseHotkeyOptions.md) for full type definitions.

To change defaults across your app, pass `defaultOptions` to a root `HotkeysProvider`. Hook-level options always override provider defaults:

```tsx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'

function Root() @{
  <HotkeysProvider
    defaultOptions={{ hotkey: { requireReset: true, timeout: 1500 } }}
  >
    <App />
  </HotkeysProvider>
}
```

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-provider-and-scopes) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```tsx
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

When setting defaults across many hotkeys via `HotkeysProvider` or `useHotkeys` shared options, `requireReset` applies only to chords and `timeout` applies only to sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only options common to both kinds are accepted.

## Register multiple hotkeys

Use `useHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```tsx
import { useHotkeys } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  <textarea />
}
```

Chords and sequences can share the same array, and each item's `options` are still typed against its specific `hotkey`. Inside `useHotkeys`, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

```tsx
useHotkeys([
  {
    hotkey: 'Mod+S',
    callback: (event, context) => {
      if (context.kind === 'chord') console.log(context.parsedChord.modifiers)
    },
  },
])
```

### Share options

Pass shared options as the second argument. Individual definitions override them:

```tsx
import { useState } from 'octane'

function RichTextEditor() @{
  const [editor, setEditor] = useState<HTMLDivElement | null>(null)

  useHotkeys(
    [
      { hotkey: 'Mod+B', callback: () => toggleBold() },
      { hotkey: 'Mod+I', callback: () => toggleItalic() },
      { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: canUndo } },
    ],
    { target: editor },
  )

  <div ref={setEditor} contentEditable />
}
```

Options merge in layers: provider defaults first, then shared `useHotkeys` options, then per-item options.

### Build the list from data

Hooks can't run in loops, so `useHotkeys` is the right tool for dynamic shortcut lists:

```tsx
function MenuShortcuts({ items }: { items: Array<MenuItem> }) @{
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )

  <menu>...</menu>
}
```

`useHotkeys` diffs the array by index and hotkey between renders. It adds new items, removes deleted ones, and re-registers any items whose position changed.

## Enable and disable hotkeys

When a shortcut belongs to conditional UI like a modal, keep the hotkey inside that component so mounting and unmounting handle registration automatically.

For state conditions while the component stays mounted, pass `enabled`:

```tsx
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

Toggling `enabled` keeps the hotkey registered and visible in devtools without registering it again. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```tsx
useHotkey('Mod+S', () => save(), {
  enabled: hasUnsavedChanges,
  preventDefault: 'always',
})
```

See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

> [!NOTE]
> Single-key shortcuts like `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch). To toggle a group of shortcuts together, use [scopes](./hotkeys-provider-and-scopes) instead of passing `enabled` on every hook.

## Hotkey targets

Hotkeys listen on `document` by default. Pass a ref, DOM element, `document`, or `window` as `target` to scope events to a specific area:

```tsx
import { useRef } from 'octane'

function Panel() @{
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Fires only while the panel (or something inside it) has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  <div ref={panelRef} tabIndex={0}>
    Panel content
  </div>
}
```

> [!NOTE]
> An element only receives key events while it or a descendant has focus. Add `tabIndex={0}` if the target isn't natively focusable.

Passing `null`, `undefined`, or an unset ref registers nothing until an element exists. Only omitting `target`, or passing `target: document` explicitly, listens on `document`.

When focus is inside a target element, its hotkeys run before `document` hotkeys. With the default `stopPropagation: true`, `document` hotkeys for the same key won't fire. Sequences with a `target` advance only on key presses inside that target.

### Elements that mount later

The hook reads a ref's `current` after its component renders. Setting a ref doesn't render the component, so a `useRef` misses an element that mounts after the component, such as one a child shows from its own state.

Use a ref for an element the component always renders. For any other element, hold the element in state with a callback ref:

```tsx
import { useState } from 'octane'

function Panel() @{
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  useHotkey('Escape', () => closePanel(), { target: panel })

  <div ref={setPanel} tabIndex={0}>
    Panel content
  </div>
}
```

Setting the state renders the component, so the hotkey attaches as soon as the element mounts, moves when the element is replaced, and detaches when it unmounts.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-provider-and-scopes#scopes-and-targets) are active regardless of focus.

A single hotkey can use both.

## Handle duplicate hotkeys

Registering the same canonical binding on the same target, scope, and `eventType` logs a console warning in development and runs both callbacks (`Mod+S` and `Meta+S` are identical on macOS). Customize this with `conflictBehavior`:

- `'warn'` (default) logs a dev warning and keeps both registrations
- `'error'` throws an error
- `'allow'` keeps both silently

Two sequences conflict only when all steps match (`['G', 'H']` and `['G', 'S']` do not). Registrations in different [scopes](./hotkeys-provider-and-scopes) don't conflict either. When both are active, the [higher-precedence scope](./hotkeys-provider-and-scopes#nested-scopes-win) wins for overlapping chords and for a sequence that completes in both. Sequences in both scopes still advance, so a dialog's `['G', 'G']` doesn't stop a page's `['G', 'I']`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```tsx
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no runtime effect on key matching. It appears in devtools and feeds UI lists like help dialogs. See [Cheat Sheets](./cheat-sheet-ui-helpers).
