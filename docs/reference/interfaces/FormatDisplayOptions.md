---
id: FormatDisplayOptions
title: FormatDisplayOptions
---

Defined in: [hotkey.ts:340](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L340)

Options for formatting hotkeys for display.

## Properties

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey.ts:342](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L342)

The target platform. Defaults to auto-detection.

***

### separatorToken?

```ts
optional separatorToken?: string | null;
```

Defined in: [hotkey.ts:346](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L346)

Override the separator between display tokens. Defaults to platform-specific formatting when null/undefined.

***

### useSymbols?

```ts
optional useSymbols?: boolean;
```

Defined in: [hotkey.ts:344](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L344)

Whether to use symbols for the display. Defaults to true.
