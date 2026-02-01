---
id: HotkeyOptions
title: HotkeyOptions
---

# Interface: HotkeyOptions

Defined in: [types.ts:399](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L399)

Options for registering a hotkey.

## Extended by

- [`SequenceOptions`](SequenceOptions.md)

## Properties

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [types.ts:411](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L411)

Whether the hotkey is enabled. Defaults to true

***

### eventType?

```ts
optional eventType: "keydown" | "keyup";
```

Defined in: [types.ts:407](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L407)

The event type to listen for. Defaults to 'keydown'

***

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [types.ts:405](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L405)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault: boolean;
```

Defined in: [types.ts:401](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L401)

Prevent the default browser action when the hotkey matches

***

### requireReset?

```ts
optional requireReset: boolean;
```

Defined in: [types.ts:409](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L409)

If true, only trigger once until all keys are released. Default: false

***

### stopPropagation?

```ts
optional stopPropagation: boolean;
```

Defined in: [types.ts:403](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L403)

Stop event propagation when the hotkey matches
