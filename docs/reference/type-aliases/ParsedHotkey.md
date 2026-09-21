---
id: ParsedHotkey
title: ParsedHotkey
---

```ts
type ParsedHotkey = ParsedModifiers & 
  | {
  code?: never;
  key: LogicalKey | string & object;
}
  | {
  code: string;
  key?: never;
};
```

Defined in: [hotkey.types.ts:156](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L156)

A parsed binding matches either a logical key or a physical code, never both.
Check `code !== undefined` to narrow to a physical binding. Its logical
character is unknown without a keyboard event and is not stored in `key`.

## Example

```ts
parseHotkey('Alt+S') // { key: 'S', alt: true, ... }
parseHotkey('Alt+[KeyS]') // { code: 'KeyS', alt: true, ... } — no key property
```
