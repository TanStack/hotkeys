---
id: UseCustomHotkeysResult
title: UseCustomHotkeysResult
---

Defined in: [useAppHotkeys.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useAppHotkeys.ts#L70)

Custom hotkey state and actions returned by `useCustomHotkeys`.

## Properties

### customHotkeys

```ts
customHotkeys: CustomHotkeys;
```

Defined in: [useAppHotkeys.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useAppHotkeys.ts#L72)

The user's hotkeys that differ from the defaults.

***

### findConflicts

```ts
findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [useAppHotkeys.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useAppHotkeys.ts#L86)

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

Defined in: [useAppHotkeys.ts:82](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useAppHotkeys.ts#L82)

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

Defined in: [useAppHotkeys.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useAppHotkeys.ts#L84)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [useAppHotkeys.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useAppHotkeys.ts#L77)

Sets the user's hotkey for an app hotkey. `null` unbinds it.
Returns conflicting app hotkeys; when any exist, nothing changes.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey` \| `null`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]
