---
id: CreateHotkeyHandlerOptions
title: CreateHotkeyHandlerOptions
---

Defined in: [match.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L68)

Options for creating a hotkey handler.

## Properties

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [match.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L74)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault?: boolean;
```

Defined in: [match.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L70)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [match.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L72)

Stop event propagation when the hotkey matches. Defaults to true
