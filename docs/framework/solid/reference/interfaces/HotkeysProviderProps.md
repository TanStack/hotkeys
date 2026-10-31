---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [HotkeysProvider.tsx:52](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L52)

## Extends

- `HotkeysProviderScopeProps`

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [HotkeysProvider.tsx:58](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L58)

Every app hotkey, from `defineAppHotkeys`. Read when the provider is
created; listed by `createAppHotkeyList` whether or not they are registered.

***

### children

```ts
children: Element;
```

Defined in: [HotkeysProvider.tsx:53](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L53)

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [HotkeysProvider.tsx:65](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L65)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [HotkeysProvider.tsx:69](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L69)

Merged with the parent provider's defaults.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProvider.tsx:67](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L67)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`
