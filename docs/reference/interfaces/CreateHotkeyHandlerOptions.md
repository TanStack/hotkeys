---
id: CreateHotkeyHandlerOptions
title: CreateHotkeyHandlerOptions
---

Defined in: [match.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L60)

Options for creating a hotkey handler.

## Properties

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [match.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L66)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault?: boolean;
```

Defined in: [match.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L62)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [match.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L64)

Stop event propagation when the hotkey matches. Defaults to true
