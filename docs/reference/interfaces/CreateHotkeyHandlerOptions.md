---
id: CreateHotkeyHandlerOptions
title: CreateHotkeyHandlerOptions
---

# Interface: CreateHotkeyHandlerOptions

Defined in: [match.ts:132](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L132)

Options for creating a hotkey handler.

## Properties

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [match.ts:138](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L138)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault: boolean;
```

Defined in: [match.ts:134](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L134)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation: boolean;
```

Defined in: [match.ts:136](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L136)

Stop event propagation when the hotkey matches. Defaults to true
