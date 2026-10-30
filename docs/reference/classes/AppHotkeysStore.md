---
id: AppHotkeysStore
title: AppHotkeysStore
---

Defined in: [app-hotkeys.ts:362](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L362)

Holds declared app hotkeys and the user's custom hotkeys. Framework
providers create one and expose it through hooks; devtools read it from
`HotkeyManager.appHotkeys`.

## Example

```ts
const store = new AppHotkeysStore(appHotkeys, {
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
store.setCustomHotkey('doc.save', 'Mod+Shift+S')
```

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Constructors

### Constructor

```ts
new AppHotkeysStore<T>(appHotkeys, options?): AppHotkeysStore<T>;
```

Defined in: [app-hotkeys.ts:367](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L367)

#### Parameters

##### appHotkeys

`T`

##### options?

[`AppHotkeysStoreOptions`](../interfaces/AppHotkeysStoreOptions.md)\<`T`\> = `{}`

#### Returns

`AppHotkeysStore`\<`T`\>

## Properties

### store

```ts
readonly store: Store<AppHotkeysState<T>>;
```

Defined in: [app-hotkeys.ts:363](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L363)

## Accessors

### appHotkeys

#### Get Signature

```ts
get appHotkeys(): T;
```

Defined in: [app-hotkeys.ts:385](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L385)

Effective app hotkeys.

##### Returns

`T`

***

### customHotkeys

#### Get Signature

```ts
get customHotkeys(): CustomHotkeys<T>;
```

Defined in: [app-hotkeys.ts:390](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L390)

The user's hotkeys that differ from the defaults.

##### Returns

[`CustomHotkeys`](../type-aliases/CustomHotkeys.md)\<`T`\>

## Methods

### findConflicts()

```ts
findConflicts(id, hotkey): AppHotkey<string, 
  | HotkeyChord
  | HotkeySequence
  | null>[];
```

Defined in: [app-hotkeys.ts:426](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L426)

Other app hotkeys that would collide if `id` used `hotkey`. App hotkeys
collide when their scopes match or either is `'global'`, and their
hotkeys are equal or one sequence starts with the other.

#### Parameters

##### id

keyof `T` & `string`

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

#### Returns

[`AppHotkey`](../interfaces/AppHotkey.md)\<`string`, 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null`\>[]

***

### get()

```ts
get(id): 
  | AppHotkey<string, 
  | HotkeyChord
  | HotkeySequence
  | null>
  | undefined;
```

Defined in: [app-hotkeys.ts:417](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L417)

Effective app hotkey for an id, or `undefined` when it is not declared.

#### Parameters

##### id

`string`

#### Returns

  \| [`AppHotkey`](../interfaces/AppHotkey.md)\<`string`, 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null`\>
  \| `undefined`

***

### getList()

```ts
getList(registrations): AppHotkeyListItem<T[keyof T]>[];
```

Defined in: [app-hotkeys.ts:497](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L497)

Joins app hotkeys with live registrations, in declaration order.
Adapters call this with the manager's registration views.

#### Parameters

##### registrations

`Iterable`\<[`HotkeyRegistrationView`](../type-aliases/HotkeyRegistrationView.md)\>

#### Returns

[`AppHotkeyListItem`](../interfaces/AppHotkeyListItem.md)\<`T`\[keyof `T`\]\>[]

***

### resetCustomHotkey()

```ts
resetCustomHotkey(id): void;
```

Defined in: [app-hotkeys.ts:474](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L474)

Restores the default hotkey for an app hotkey.

#### Parameters

##### id

keyof `T` & `string`

#### Returns

`void`

***

### resetCustomHotkeys()

```ts
resetCustomHotkeys(): void;
```

Defined in: [app-hotkeys.ts:481](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L481)

Restores every default hotkey.

#### Returns

`void`

***

### setAppHotkeys()

```ts
setAppHotkeys(appHotkeys): void;
```

Defined in: [app-hotkeys.ts:403](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L403)

Replaces the declarations, for example after hot module replacement.
Custom hotkeys for ids that still exist are kept.

#### Parameters

##### appHotkeys

`T`

#### Returns

`void`

***

### setCustomHotkey()

```ts
setCustomHotkey(id, hotkey): AppHotkey<string, 
  | HotkeyChord
  | HotkeySequence
  | null>[];
```

Defined in: [app-hotkeys.ts:445](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L445)

Sets the user's hotkey for an app hotkey. `null` unbinds it. A hotkey
equal to the default removes the customization.

#### Parameters

##### id

keyof `T` & `string`

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md) \| `null`

#### Returns

[`AppHotkey`](../interfaces/AppHotkey.md)\<`string`, 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null`\>[]

Conflicting app hotkeys. When any exist, nothing changes.

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [app-hotkeys.ts:395](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L395)

Updates callbacks and other options without resetting custom hotkeys.

#### Parameters

##### options

`Omit`\<[`AppHotkeysStoreOptions`](../interfaces/AppHotkeysStoreOptions.md)\<`T`\>, `"customHotkeys"`\>

#### Returns

`void`
