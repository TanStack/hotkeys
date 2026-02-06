---
id: CreateHotkeyHandlerOptions
title: CreateHotkeyHandlerOptions
---

# Interface: CreateHotkeyHandlerOptions

Defined in: [match.ts:95](https://github.com/TanStack/keys/blob/main/packages/keys/src/match.ts#L95)

Options for creating a hotkey handler.

## Properties

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [match.ts:101](https://github.com/TanStack/keys/blob/main/packages/keys/src/match.ts#L101)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault: boolean;
```

Defined in: [match.ts:97](https://github.com/TanStack/keys/blob/main/packages/keys/src/match.ts#L97)

Prevent the default browser action when the hotkey matches

***

### stopPropagation?

```ts
optional stopPropagation: boolean;
```

Defined in: [match.ts:99](https://github.com/TanStack/keys/blob/main/packages/keys/src/match.ts#L99)

Stop event propagation when the hotkey matches
