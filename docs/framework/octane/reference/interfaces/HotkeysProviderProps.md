---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [HotkeysProvider.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L42)

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [HotkeysProvider.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L49)

Every app hotkey, from `defineAppHotkeys`. Read when the provider first
renders; listed by `useAppHotkeyList` whether or not they are registered.

***

### children?

```ts
optional children?: unknown;
```

Defined in: [HotkeysProvider.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L43)

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [HotkeysProvider.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L54)

Starting custom hotkeys, such as saved data. Read once; the provider owns
the state afterwards. Invalid entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: DefaultHotkeysOptions;
```

Defined in: [HotkeysProvider.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L44)

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProvider.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L56)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`
