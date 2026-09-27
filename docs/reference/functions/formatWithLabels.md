---
id: formatWithLabels
title: formatWithLabels
---

```ts
function formatWithLabels(hotkey, options?): string;
```

Defined in: [format.ts:185](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L185)

## Parameters

### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### options?

`Omit`\<[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md), `"useSymbols"` \| `"parts"`\> = `{}`

## Returns

`string`

## Deprecated

Use [formatForDisplay](formatForDisplay.md) instead with `useSymbols: false` option.
