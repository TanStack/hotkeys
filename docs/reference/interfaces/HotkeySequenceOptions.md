---
id: HotkeySequenceOptions
title: HotkeySequenceOptions
---

Defined in: [hotkey-manager.ts:157](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L157)

Options for a sequence such as `['G', 'G']`.

## Extends

- [`HotkeyOptions`](HotkeyOptions.md)

## Properties

### afterDelegatedHandlers?

```ts
optional afterDelegatedHandlers?: boolean;
```

Defined in: [hotkey-manager.ts:147](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L147)

Run after key handlers that a framework calls from one listener on its
root or the document, such as React's `onKeyDown`, so handlers inside the
target run first and can stop the hotkey. An element target then listens
on its document, or on its closed shadow root, instead of the element. A
stop by an earlier listener there skips the hotkey. Applies only to the
bubble phase.
Adapters for frameworks that delegate key events set this.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`afterDelegatedHandlers`](HotkeyOptions.md#afterdelegatedhandlers)

***

### appHotkeyId?

```ts
optional appHotkeyId?: string;
```

Defined in: [hotkey-manager.ts:137](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L137)

Id of the app hotkey this registration implements. Adapters set this when registering an app hotkey from `defineAppHotkeys`.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`appHotkeyId`](HotkeyOptions.md#apphotkeyid)

***

### capture?

```ts
optional capture?: boolean;
```

Defined in: [hotkey-manager.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L72)

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

Defined in: [hotkey-manager.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L74)

Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`conflictBehavior`](HotkeyOptions.md#conflictbehavior)

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [hotkey-manager.ts:80](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L80)

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

Defined in: [hotkey-manager.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L87)

The event type to listen for. Defaults to 'keydown'. A 'keyup' chord fires
when its key or one of its modifiers is released, whichever comes first,
unless another key was pressed in between. `preventDefault` applies to
its keydown too.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`eventType`](HotkeyOptions.md#eventtype)

***

### ignoreDefaultPrevented?

```ts
optional ignoreDefaultPrevented?: boolean;
```

Defined in: [hotkey-manager.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L93)

Skip a key press that a listener outside TanStack Hotkeys already handled
by calling `preventDefault()`, such as a component library's dialog that
closes on Escape. Defaults to `false`.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`ignoreDefaultPrevented`](HotkeyOptions.md#ignoredefaultprevented)

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean | "auto";
```

Defined in: [hotkey-manager.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L104)

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

Defined in: [hotkey-manager.ts:125](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L125)

Optional metadata (name, description, custom fields via declaration merging)

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`meta`](HotkeyOptions.md#meta)

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-manager.ts:106](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L106)

The target platform for resolving 'Mod'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`platform`](HotkeyOptions.md#platform)

***

### preventDefault?

```ts
optional preventDefault?: boolean | "always";
```

Defined in: [hotkey-manager.ts:116](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L116)

Prevent the default browser action when the hotkey matches. For a
sequence, every step that advances it does. Defaults to true.

`'always'` also prevents it while a chord can't fire because it is
disabled or its scope is inactive or suspended, unless another hotkey
handles the key. It never stops propagation for such a chord. Sequences
treat `'always'` as `true`.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`preventDefault`](HotkeyOptions.md#preventdefault)

***

### scope?

```ts
optional scope?: string;
```

Defined in: [hotkey-manager.ts:135](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L135)

Scope this hotkey belongs to. Defaults to `'global'`, which is always
active. Other scopes are active while activated with
`HotkeyManager.activateScope`, which framework providers do while
mounted. While an exclusive scope is active, only its hotkeys, those of
scopes nested in it, and those of scopes it allows fire.
When active scopes share a hotkey on the same target, the most recently
activated scope handles it.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`scope`](HotkeyOptions.md#scope)

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [hotkey-manager.ts:121](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L121)

Stop event propagation when the hotkey matches. For a sequence, only the
last step does, so earlier steps reach other listeners. Defaults to true

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`stopPropagation`](HotkeyOptions.md#stoppropagation)

***

### target?

```ts
optional target?: Target | null;
```

Defined in: [hotkey-manager.ts:123](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L123)

The DOM element to attach the event listener to. Defaults to document.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`target`](HotkeyOptions.md#target)

***

### timeout?

```ts
optional timeout?: number;
```

Defined in: [hotkey-manager.ts:159](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L159)

Maximum time between steps in milliseconds. Default: 1000
