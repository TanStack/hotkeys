---
id: UseCustomHotkeysResult
title: UseCustomHotkeysResult
---

Defined in: [appHotkeys.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L61)

Custom hotkey state and actions returned by `useCustomHotkeys`.

## Properties

### customHotkeys

```ts
customHotkeys: () => CustomHotkeys;
```

Defined in: [appHotkeys.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L63)

The user's hotkeys that differ from the defaults.

#### Returns

`CustomHotkeys`

***

### findConflicts

```ts
findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [appHotkeys.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L77)

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

Defined in: [appHotkeys.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L73)

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

Defined in: [appHotkeys.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L75)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [appHotkeys.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L68)

Sets the user's hotkey for an app hotkey. `null` unbinds it.
Returns conflicting app hotkeys; when any exist, nothing changes.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey` \| `null`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]
