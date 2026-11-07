---
id: CreateHotkeyChordHandlerOptions
title: CreateHotkeyChordHandlerOptions
---

Defined in: [match.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L69)

Options for creating a chord handler.

## Properties

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [match.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L75)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault?: boolean;
```

Defined in: [match.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L71)

Prevent the default browser action when the chord matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [match.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L73)

Stop event propagation when the chord matches. Defaults to true
