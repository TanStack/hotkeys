---
id: SequenceOptions
title: SequenceOptions
---

Defined in: [sequence-manager.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L31)

Options for hotkey sequence matching.
Extends HotkeyOptions but excludes requireReset (not applicable to sequences).

## Extends

- `Omit`\<[`HotkeyOptions`](HotkeyOptions.md), `"requireReset"`\>

## Properties

### conflictBehavior?

```ts
optional conflictBehavior?: ConflictBehavior;
```

Defined in: [hotkey-manager.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L33)

Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`conflictBehavior`](HotkeyOptions.md#conflictbehavior)

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [hotkey-manager.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L39)

Soft-disable: when `false`, the callback does not run but the registration
stays in `HotkeyManager` (and in devtools). Toggling this should update the
existing handle via `setOptions` rather than unregistering. Defaults to `true`.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`enabled`](HotkeyOptions.md#enabled)

***

### eventType?

```ts
optional eventType?: "keyup" | "keydown";
```

Defined in: [hotkey-manager.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L41)

The event type to listen for. Defaults to 'keydown'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`eventType`](HotkeyOptions.md#eventtype)

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean;
```

Defined in: [hotkey-manager.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L43)

Whether to ignore hotkeys when keyboard events originate from input-like elements (text inputs, textarea, select, contenteditable — button-type inputs like type=button/submit/reset are not ignored). Defaults based on hotkey: true for single keys and Shift/Alt combos; false for Ctrl/Meta shortcuts and Escape

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`ignoreInputs`](HotkeyOptions.md#ignoreinputs)

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [hotkey-manager.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L55)

Optional metadata (name, description, custom fields via declaration merging)

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`meta`](HotkeyOptions.md#meta)

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-manager.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L45)

The target platform for resolving 'Mod'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`platform`](HotkeyOptions.md#platform)

***

### preventDefault?

```ts
optional preventDefault?: boolean;
```

Defined in: [hotkey-manager.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L47)

Prevent the default browser action when the hotkey matches. Defaults to true

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`preventDefault`](HotkeyOptions.md#preventdefault)

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [hotkey-manager.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L51)

Stop event propagation when the hotkey matches. Defaults to true

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`stopPropagation`](HotkeyOptions.md#stoppropagation)

***

### target?

```ts
optional target?: Document | Window | HTMLElement | null;
```

Defined in: [hotkey-manager.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L53)

The DOM element to attach the event listener to. Defaults to document.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`target`](HotkeyOptions.md#target)

***

### timeout?

```ts
optional timeout?: number;
```

Defined in: [sequence-manager.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L33)

Timeout between keys in milliseconds. Default: 1000
