---
id: HotkeyOptions
title: HotkeyOptions
---

Defined in: [hotkey-manager.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L46)

Options shared by chords and sequences.

## Extended by

- [`HotkeyChordOptions`](HotkeyChordOptions.md)
- [`HotkeySequenceOptions`](HotkeySequenceOptions.md)

## Properties

### appHotkeyId?

```ts
optional appHotkeyId?: string;
```

Defined in: [hotkey-manager.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L87)

Id of the app hotkey this registration implements. Adapters set this when registering an app hotkey from `defineAppHotkeys`.

***

### capture?

```ts
optional capture?: boolean;
```

Defined in: [hotkey-manager.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L54)

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

Defined in: [hotkey-manager.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L56)

Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn'

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [hotkey-manager.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L62)

Soft-disable: when `false`, the callback does not run but the registration
stays in `HotkeyManager` (and in devtools). Toggling this should update the
existing handle via `setOptions` rather than unregistering. Defaults to `true`.

***

### eventType?

```ts
optional eventType?: "keydown" | "keyup";
```

Defined in: [hotkey-manager.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L64)

The event type to listen for. Defaults to 'keydown'

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean | "auto";
```

Defined in: [hotkey-manager.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L75)

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

Defined in: [hotkey-manager.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L85)

Optional metadata (name, description, custom fields via declaration merging)

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-manager.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L77)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault?: boolean;
```

Defined in: [hotkey-manager.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L79)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [hotkey-manager.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L81)

Stop event propagation when the hotkey matches. Defaults to true

***

### target?

```ts
optional target?: Target | null;
```

Defined in: [hotkey-manager.ts:83](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L83)

The DOM element to attach the event listener to. Defaults to document.
