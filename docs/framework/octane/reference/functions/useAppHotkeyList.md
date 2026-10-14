---
id: useAppHotkeyList
title: useAppHotkeyList
---

```ts
function useAppHotkeyList(): AppHotkeyListItem<AppHotkey<string, HotkeyChord | HotkeySequence | null>>[];
```

Defined in: [useAppHotkeys.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useAppHotkeys.ts#L39)

Lists every app hotkey with its live status, in declaration order, for
cheat sheets and settings screens. App hotkeys whose components have not
mounted are `'inactive'`; those without a hotkey are `'unbound'`.

## Returns

`AppHotkeyListItem`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>[]
