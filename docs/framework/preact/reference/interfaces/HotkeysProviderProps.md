---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [HotkeysProvider.tsx:46](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L46)

## Extends

- `HotkeysProviderScopeProps`

## Type Parameters

### T

`T` *extends* `AppHotkeys` = `AppHotkeys`

## Properties

### appHotkeys?

```ts
optional appHotkeys?: T;
```

Defined in: [HotkeysProvider.tsx:54](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L54)

Every app hotkey, from `defineAppHotkeys`. Listed by `useAppHotkeyList`
whether or not their components have mounted.

***

### children

```ts
children: ComponentChildren;
```

Defined in: [HotkeysProvider.tsx:49](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L49)

***

### customHotkeys?

```ts
optional customHotkeys?: CustomHotkeys<T> | null;
```

Defined in: [HotkeysProvider.tsx:61](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L61)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [HotkeysProvider.tsx:65](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L65)

Merged with the parent provider's defaults.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProvider.tsx:63](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L63)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`\<`T`\>

#### Returns

`void`
