---
id: InjectCustomHotkeysResult
title: InjectCustomHotkeysResult
---

Defined in: [injectAppHotkeys.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectAppHotkeys.ts#L63)

Custom hotkey state and actions returned by `injectCustomHotkeys`.

## Properties

### customHotkeys

```ts
readonly customHotkeys: Signal<CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>>;
```

Defined in: [injectAppHotkeys.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectAppHotkeys.ts#L65)

The user's hotkeys that differ from the defaults.

***

### findConflicts

```ts
readonly findConflicts: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [injectAppHotkeys.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectAppHotkeys.ts#L79)

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
readonly resetCustomHotkey: (id) => void;
```

Defined in: [injectAppHotkeys.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectAppHotkeys.ts#L75)

Restores the default hotkey for an app hotkey.

#### Parameters

##### id

`string`

#### Returns

`void`

***

### resetCustomHotkeys

```ts
readonly resetCustomHotkeys: () => void;
```

Defined in: [injectAppHotkeys.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectAppHotkeys.ts#L77)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey

```ts
readonly setCustomHotkey: (id, hotkey) => AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [injectAppHotkeys.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectAppHotkeys.ts#L70)

Sets the user's hotkey for an app hotkey. `null` unbinds it.
Returns conflicting app hotkeys; when any exist, nothing changes.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey` \| `null`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]
