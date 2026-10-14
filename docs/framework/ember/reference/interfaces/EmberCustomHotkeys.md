---
id: EmberCustomHotkeys
title: EmberCustomHotkeys
---

Defined in: [packages/ember-hotkeys/src/types.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L62)

Custom hotkey state and actions.

## Properties

### findConflicts

```ts
findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [packages/ember-hotkeys/src/types.ts:78](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L78)

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

Defined in: [packages/ember-hotkeys/src/types.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L74)

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

Defined in: [packages/ember-hotkeys/src/types.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L76)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [packages/ember-hotkeys/src/types.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L69)

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

Defined in: [packages/ember-hotkeys/src/types.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L64)

The user's hotkeys that differ from the defaults.
