---
id: HotkeyOptions
title: HotkeyOptions
---

Defined in: [hotkey-manager.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L55)

Options shared by chords and sequences.

## Extended by

- [`HotkeyChordOptions`](HotkeyChordOptions.md)
- [`HotkeySequenceOptions`](HotkeySequenceOptions.md)

## Properties

### appHotkeyId?

```ts
optional appHotkeyId?: string;
```

Defined in: [hotkey-manager.ts:117](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L117)

Id of the app hotkey this registration implements. Adapters set this when registering an app hotkey from `defineAppHotkeys`.

***

### capture?

```ts
optional capture?: boolean;
```

Defined in: [hotkey-manager.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L63)

Listen during capture, before descendant listeners. Defaults to `false` (bubble).
With `stopPropagation: true`, a match on an ancestor prevents the event from
reaching descendant widgets. Other listeners on the same target still run.
Applies to both `keydown` and `keyup`, for chords and sequences.
Changing this option preserves held-key reset state and sequence progress.

***

### conflictBehavior?

```ts
optional conflictBehavior?: ConflictBehavior;
```

Defined in: [hotkey-manager.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L65)

Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn'

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [hotkey-manager.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L71)

Soft-disable: when `false`, the callback does not run but the registration
stays in `HotkeyManager` (and in devtools). Toggling this should update the
existing handle via `setOptions` rather than unregistering. Defaults to `true`.

***

### eventType?

```ts
optional eventType?: "keydown" | "keyup";
```

Defined in: [hotkey-manager.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L73)

The event type to listen for. Defaults to 'keydown'

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean | "auto";
```

Defined in: [hotkey-manager.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L84)

Skip keys that a focused control inside the target uses itself: typing in
text inputs, textarea, select, and contenteditable; Enter/Space on buttons
and summary elements; Enter on links; and navigation keys in ARIA widgets
such as menus, listboxes, tabs, and grids. A hotkey targeted at the control
itself still receives them. Defaults to `'auto'`, which chooses from the
hotkey (the first step of a sequence): true for single keys and Shift/Alt
combos; false for Ctrl/Meta shortcuts and Escape. Set false to handle keys
even in these controls.

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [hotkey-manager.ts:105](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L105)

Optional metadata (name, description, custom fields via declaration merging)

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-manager.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L86)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault?: boolean | "always";
```

Defined in: [hotkey-manager.ts:96](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L96)

Prevent the default browser action when the hotkey matches. For a
sequence, every step that advances it does. Defaults to true.

`'always'` also prevents it while a chord can't fire because it is
disabled or its scope is inactive or suspended, unless another hotkey
handles the key. It never stops propagation for such a chord. Sequences
treat `'always'` as `true`.

***

### scope?

```ts
optional scope?: string;
```

Defined in: [hotkey-manager.ts:115](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L115)

Scope this hotkey belongs to. Defaults to `'global'`, which is always
active. Other scopes are active while activated with
`HotkeyManager.activateScope`, which framework providers do while
mounted. While an exclusive scope is active, only its hotkeys, those of
scopes nested in it, and those of scopes it allows fire.
When active scopes share a hotkey on the same target, the most recently
activated scope handles it.

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [hotkey-manager.ts:101](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L101)

Stop event propagation when the hotkey matches. For a sequence, only the
last step does, so earlier steps reach other listeners. Defaults to true

***

### target?

```ts
optional target?: Target | null;
```

Defined in: [hotkey-manager.ts:103](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L103)

The DOM element to attach the event listener to. Defaults to document.
