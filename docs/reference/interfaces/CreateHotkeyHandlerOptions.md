---
id: CreateHotkeyHandlerOptions
title: CreateHotkeyHandlerOptions
---

# Interface: CreateHotkeyHandlerOptions

Defined in: [match.ts:101](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L101)

Options for creating a hotkey handler.

## Properties

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [match.ts:107](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L107)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault: boolean;
```

Defined in: [match.ts:103](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L103)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation: boolean;
```

Defined in: [match.ts:105](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L105)

Stop event propagation when the hotkey matches. Defaults to true
