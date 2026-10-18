---
id: useAppHotkeys
title: useAppHotkeys
---

```ts
function useAppHotkeys(): ComputedRef<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>;
```

Defined in: [useAppHotkeys.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useAppHotkeys.ts#L35)

Returns a computed ref of the effective app hotkeys from `HotkeysProvider`,
typed by `Register`: each declaration with the user's custom hotkey applied.

## Returns

`ComputedRef`\<`Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\>\>

## Example

```ts
const appHotkeys = useAppHotkeys()
useHotkey(() => appHotkeys.value['doc.save'], () => save())
```
