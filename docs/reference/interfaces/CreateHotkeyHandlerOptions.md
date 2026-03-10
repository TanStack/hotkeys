---
id: CreateHotkeyHandlerOptions
title: CreateHotkeyHandlerOptions
---

# Interface: CreateHotkeyHandlerOptions

Defined in: [match.ts:122](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L122)

Options for creating a hotkey handler.

## Properties

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [match.ts:128](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L128)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault: boolean;
```

Defined in: [match.ts:124](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L124)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation: boolean;
```

Defined in: [match.ts:126](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L126)

Stop event propagation when the hotkey matches. Defaults to true
