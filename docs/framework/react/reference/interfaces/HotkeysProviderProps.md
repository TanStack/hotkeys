---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [HotkeysProvider.tsx:40](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L40)

## Type Parameters

### T

`T` *extends* `AppHotkeys` = `AppHotkeys`

## Properties

### appHotkeys?

```ts
optional appHotkeys?: T;
```

Defined in: [HotkeysProvider.tsx:46](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L46)

Every app hotkey, from `defineAppHotkeys`. Listed by `useAppHotkeyList`
whether or not their components have mounted.

***

### children

```ts
children: ReactNode;
```

Defined in: [HotkeysProvider.tsx:41](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L41)

***

### customHotkeys?

```ts
optional customHotkeys?: CustomHotkeys<T> | null;
```

Defined in: [HotkeysProvider.tsx:51](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L51)

Starting custom hotkeys, such as saved data. Read once; the provider owns
the state afterwards. Invalid entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [HotkeysProvider.tsx:54](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L54)

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProvider.tsx:53](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L53)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`\<`T`\>

#### Returns

`void`
