---
id: CreateHotkeyHandlerOptions
title: CreateHotkeyHandlerOptions
---

# Interface: CreateHotkeyHandlerOptions

Defined in: [match.ts:115](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L115)

Options for creating a hotkey handler.

## Properties

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [match.ts:121](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L121)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault: boolean;
```

Defined in: [match.ts:117](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L117)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation: boolean;
```

Defined in: [match.ts:119](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L119)

Stop event propagation when the hotkey matches. Defaults to true
