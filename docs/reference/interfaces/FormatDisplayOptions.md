---
id: FormatDisplayOptions
title: FormatDisplayOptions
---

# Interface: FormatDisplayOptions

Defined in: [hotkey.ts:368](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L368)

Options for formatting hotkeys for display.

## Properties

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [hotkey.ts:370](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L370)

The target platform. Defaults to auto-detection.

***

### separatorToken?

```ts
optional separatorToken: string | null;
```

Defined in: [hotkey.ts:374](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L374)

Override the separator between display tokens. Defaults to platform-specific formatting when null/undefined.

***

### useSymbols?

```ts
optional useSymbols: boolean;
```

Defined in: [hotkey.ts:372](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L372)

Whether to use symbols for the display. Defaults to true.
