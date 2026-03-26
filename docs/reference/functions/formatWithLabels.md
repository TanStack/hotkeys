---
id: formatWithLabels
title: formatWithLabels
---

# ~~Function: formatWithLabels()~~

```ts
function formatWithLabels(hotkey, options): string;
```

Defined in: [format.ts:134](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L134)

## Parameters

### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### options

`Omit`\<[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md), `"useSymbols"`\> = `{}`

## Returns

`string`

## Deprecated

Use [formatForDisplay](formatForDisplay.md) instead with `useSymbols: false` option.
