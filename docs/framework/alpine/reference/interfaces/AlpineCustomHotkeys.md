---
id: AlpineCustomHotkeys
title: AlpineCustomHotkeys
---

Defined in: [types.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L74)

Custom hotkey state and actions.

## Properties

### findConflicts

```ts
findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [types.ts:90](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L90)

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

Defined in: [types.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L86)

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

Defined in: [types.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L88)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [types.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L81)

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

Defined in: [types.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L76)

The user's hotkeys that differ from the defaults.
