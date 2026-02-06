---
id: SequenceOptions
title: SequenceOptions
---

# Interface: SequenceOptions

Defined in: [sequence.ts:15](https://github.com/TanStack/keys/blob/main/packages/keys/src/sequence.ts#L15)

Options for hotkey sequence matching.

## Extends

- [`HotkeyOptions`](HotkeyOptions.md)

## Properties

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [hotkey-manager.ts:16](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L16)

Whether the hotkey is enabled. Defaults to true

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`enabled`](HotkeyOptions.md#enabled)

***

### eventType?

```ts
optional eventType: "keydown" | "keyup";
```

Defined in: [hotkey-manager.ts:18](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L18)

The event type to listen for. Defaults to 'keydown'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`eventType`](HotkeyOptions.md#eventtype)

***

### ignoreInputs?

```ts
optional ignoreInputs: boolean;
```

Defined in: [hotkey-manager.ts:20](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L20)

Whether to ignore hotkeys when keyboard events originate from input-like elements (input, textarea, select, contenteditable). Defaults to true

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`ignoreInputs`](HotkeyOptions.md#ignoreinputs)

***

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [hotkey-manager.ts:22](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L22)

The target platform for resolving 'Mod'

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`platform`](HotkeyOptions.md#platform)

***

### preventDefault?

```ts
optional preventDefault: boolean;
```

Defined in: [hotkey-manager.ts:24](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L24)

Prevent the default browser action when the hotkey matches

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`preventDefault`](HotkeyOptions.md#preventdefault)

***

### requireReset?

```ts
optional requireReset: boolean;
```

Defined in: [hotkey-manager.ts:26](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L26)

If true, only trigger once until all keys are released. Default: false

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`requireReset`](HotkeyOptions.md#requirereset)

***

### stopPropagation?

```ts
optional stopPropagation: boolean;
```

Defined in: [hotkey-manager.ts:28](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L28)

Stop event propagation when the hotkey matches

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`stopPropagation`](HotkeyOptions.md#stoppropagation)

***

### target?

```ts
optional target: Document | Window | HTMLElement | null;
```

Defined in: [hotkey-manager.ts:30](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L30)

The DOM element to attach the event listener to. Defaults to document.

#### Inherited from

[`HotkeyOptions`](HotkeyOptions.md).[`target`](HotkeyOptions.md#target)

***

### timeout?

```ts
optional timeout: number;
```

Defined in: [sequence.ts:17](https://github.com/TanStack/keys/blob/main/packages/keys/src/sequence.ts#L17)

Timeout between keys in milliseconds. Default: 1000
