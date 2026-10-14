---
id: injectAppHotkeyList
title: injectAppHotkeyList
---

```ts
function injectAppHotkeyList(): Signal<AppHotkeyListItem<AppHotkey<string, HotkeyChord | HotkeySequence | null>>[]>;
```

Defined in: injectAppHotkeys.ts:51

Lists every app hotkey with its live status, in declaration order, for
cheat sheets and settings screens. App hotkeys whose components have not
mounted are `'inactive'`; those without a hotkey are `'unbound'`.

## Returns

`Signal`\<`AppHotkeyListItem`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>[]\>
