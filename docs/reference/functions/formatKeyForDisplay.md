---
id: formatKeyForDisplay
title: formatKeyForDisplay
---

```ts
function formatKeyForDisplay(key, options?): string;
```

Defined in: [format.ts:249](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L249)

Formats a single key for display, such as a held key from
`KeyStateTracker` or a modifier on its own. Uses the same labels as
`formatForDisplay`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`.

## Parameters

### key

`string`

A key name, such as a `KeyboardEvent.key` value or a modifier

### options?

`Pick`\<[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md), `"platform"` \| `"useSymbols"` \| `"keyLabels"`\> = `{}`

Formatting options

## Returns

`string`

## Example

```ts
formatKeyForDisplay('Shift', { platform: 'mac' }) // '⇧'
formatKeyForDisplay('Meta', { platform: 'windows' }) // 'Win'
formatKeyForDisplay('a') // 'A'
```
