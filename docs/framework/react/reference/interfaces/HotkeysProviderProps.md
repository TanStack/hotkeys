---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [HotkeysProvider.tsx:60](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L60)

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

Defined in: [HotkeysProvider.tsx:68](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L68)

Every app hotkey, from `defineAppHotkeys`. Listed by `useAppHotkeyList`
whether or not their components have mounted.

***

### children

```ts
children: ReactNode;
```

Defined in: [HotkeysProvider.tsx:63](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L63)

***

### customHotkeys?

```ts
optional customHotkeys?: CustomHotkeys<T> | null;
```

Defined in: [HotkeysProvider.tsx:75](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L75)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [HotkeysProvider.tsx:79](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L79)

Merged with the parent provider's defaults.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProvider.tsx:77](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L77)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`\<`T`\>

#### Returns

`void`
