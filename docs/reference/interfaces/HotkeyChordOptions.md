---
id: HotkeyChordOptions
title: HotkeyChordOptions
---

Defined in: [hotkey-manager.ts:95](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L95)

Options for a single chord such as `'Mod+S'`.

## Extends

- [`HotkeyOptions`](HotkeyOptions.md)

## Properties

### appHotkeyId?

```ts
optional appHotkeyId?: string;
```

Defined in: [hotkey-manager.ts:91](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L91)

Id of the app hotkey this registration implements. Adapters set this when registering an app hotkey from `defineAppHotkeys`.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`appHotkeyId`](HotkeyOptions.md#apphotkeyid)

***

### capture?

```ts
optional capture?: boolean;
```

Defined in: [hotkey-manager.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L58)

Listen during capture, before descendant listeners. Defaults to `false` (bubble).
With `stopPropagation: true`, a match on an ancestor prevents the event from
reaching descendant widgets. Other listeners on the same target still run.
Applies to both `keydown` and `keyup`, for chords and sequences.
Changing this option preserves held-key reset state and sequence progress.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`capture`](HotkeyOptions.md#capture)

***

### conflictBehavior?

```ts
optional conflictBehavior?: ConflictBehavior;
```

Defined in: [hotkey-manager.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L60)

Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`conflictBehavior`](HotkeyOptions.md#conflictbehavior)

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [hotkey-manager.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L66)

Soft-disable: when `false`, the callback does not run but the registration
stays in `HotkeyManager` (and in devtools). Toggling this should update the
existing handle via `setOptions` rather than unregistering. Defaults to `true`.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`enabled`](HotkeyOptions.md#enabled)

***

### eventType?

```ts
optional eventType?: "keydown" | "keyup";
```

Defined in: [hotkey-manager.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L68)

The event type to listen for. Defaults to 'keydown'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`eventType`](HotkeyOptions.md#eventtype)

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean | "auto";
```

Defined in: [hotkey-manager.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L79)

Skip keys that a focused control inside the target uses itself: typing in
text inputs, textarea, select, and contenteditable; Enter/Space on buttons
and summary elements; Enter on links; and navigation keys in ARIA widgets
such as menus, listboxes, tabs, and grids. A hotkey targeted at the control
itself still receives them. Defaults to `'auto'`, which chooses from the
hotkey (the first step of a sequence): true for single keys and Shift/Alt
combos; false for Ctrl/Meta shortcuts and Escape. Set false to handle keys
even in these controls.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`ignoreInputs`](HotkeyOptions.md#ignoreinputs)

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [hotkey-manager.ts:89](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L89)

Optional metadata (name, description, custom fields via declaration merging)

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`meta`](HotkeyOptions.md#meta)

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-manager.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L81)

The target platform for resolving 'Mod'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`platform`](HotkeyOptions.md#platform)

***

### preventDefault?

```ts
optional preventDefault?: boolean;
```

Defined in: [hotkey-manager.ts:83](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L83)

Prevent the default browser action when the hotkey matches. Defaults to true

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`preventDefault`](HotkeyOptions.md#preventdefault)

***

### requireReset?

```ts
optional requireReset?: boolean;
```

Defined in: [hotkey-manager.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L97)

If true, only trigger once until all keys are released. Default: false

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [hotkey-manager.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L85)

Stop event propagation when the hotkey matches. Defaults to true

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`stopPropagation`](HotkeyOptions.md#stoppropagation)

***

### target?

```ts
optional target?: Target | null;
```

Defined in: [hotkey-manager.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L87)

The DOM element to attach the event listener to. Defaults to document.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`target`](HotkeyOptions.md#target)
