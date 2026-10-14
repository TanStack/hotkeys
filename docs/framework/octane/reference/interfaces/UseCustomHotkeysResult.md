---
id: UseCustomHotkeysResult
title: UseCustomHotkeysResult
---

Defined in: [types.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L35)

Custom hotkey state and actions returned by `useCustomHotkeys`.

## Properties

### customHotkeys

```ts
customHotkeys: CustomHotkeys;
```

Defined in: [types.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L37)

The user's hotkeys that differ from the defaults.

***

### findConflicts

```ts
findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [types.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L51)

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

Defined in: [types.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L47)

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

Defined in: [types.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L49)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [types.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L42)

Sets the user's hotkey for an app hotkey. `null` unbinds it.
Returns conflicting app hotkeys; when any exist, nothing changes.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey` \| `null`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]
