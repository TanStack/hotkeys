---
id: useAppHotkeys
title: useAppHotkeys
---

```ts
function useAppHotkeys(owner): EmberHotkeyState<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>;
```

Defined in: [packages/ember-hotkeys/src/useAppHotkeys.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useAppHotkeys.ts#L20)

Reads the effective app hotkeys from `provideAppHotkeys`, typed by `Register`.

## Parameters

### owner

`object`

## Returns

[`EmberHotkeyState`](../interfaces/EmberHotkeyState.md)\<`Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\>\>
