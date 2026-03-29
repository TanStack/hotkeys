---
id: FormatDisplayOptions
title: FormatDisplayOptions
---

# Interface: FormatDisplayOptions

Defined in: [hotkey.ts:367](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L367)

Options for formatting hotkeys for display.

## Properties

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [hotkey.ts:369](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L369)

The target platform. Defaults to auto-detection.

***

### separatorToken?

```ts
optional separatorToken: string | null;
```

Defined in: [hotkey.ts:373](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L373)

Override the separator between display tokens. Defaults to platform-specific formatting when null/undefined.

***

### useSymbols?

```ts
optional useSymbols: boolean;
```

Defined in: [hotkey.ts:371](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L371)

Whether to use symbols for the display. Defaults to true.
