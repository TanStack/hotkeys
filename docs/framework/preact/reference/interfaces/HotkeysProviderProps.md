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

Defined in: [HotkeysProvider.tsx:59](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L59)

Starting custom hotkeys, such as saved data. Read once; the provider owns
the state afterwards. Invalid entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [HotkeysProvider.tsx:63](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L63)

Merged with the parent provider's defaults.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProvider.tsx:61](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L61)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`\<`T`\>

#### Returns

`void`
