---
id: AlpineCustomHotkeys
title: AlpineCustomHotkeys
---

Defined in: [types.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L73)

Custom hotkey state and actions.

## Properties

### findConflicts

```ts
findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [types.ts:89](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L89)

Other app hotkeys that would collide if `id` used `hotkey`.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]

***

### resetCustomHotkey

```ts
resetCustomHotkey: (id) => void;
```

Defined in: [types.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L85)

Restores the default hotkey for an app hotkey.

#### Parameters

##### id

`string`

#### Returns

`void`

***

### resetCustomHotkeys

```ts
resetCustomHotkeys: () => void;
```

Defined in: [types.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L87)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [types.ts:80](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L80)

Sets the user's hotkey for an app hotkey. `null` unbinds it.
Returns conflicting app hotkeys; when any exist, nothing changes.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey` \| `null`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]

***

### value

```ts
readonly value: CustomHotkeys;
```

Defined in: [types.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L75)

The user's hotkeys that differ from the defaults.
