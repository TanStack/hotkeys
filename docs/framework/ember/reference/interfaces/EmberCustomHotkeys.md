---
id: EmberCustomHotkeys
title: EmberCustomHotkeys
---

Defined in: [packages/ember-hotkeys/src/types.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L63)

Custom hotkey state and actions.

## Properties

### findConflicts

```ts
findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [packages/ember-hotkeys/src/types.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L79)

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

Defined in: [packages/ember-hotkeys/src/types.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L75)

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

Defined in: [packages/ember-hotkeys/src/types.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L77)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [packages/ember-hotkeys/src/types.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L70)

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

Defined in: [packages/ember-hotkeys/src/types.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L65)

The user's hotkeys that differ from the defaults.
