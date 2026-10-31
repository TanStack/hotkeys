---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [HotkeysProvider.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L53)

## Extends

- `HotkeysProviderScopeProps`

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [HotkeysProvider.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L61)

Every app hotkey, from `defineAppHotkeys`. Read when the provider first
renders; listed by `useAppHotkeyList` whether or not they are registered.

***

### children?

```ts
optional children?: unknown;
```

Defined in: [HotkeysProvider.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L54)

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [HotkeysProvider.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L68)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: DefaultHotkeysOptions;
```

Defined in: [HotkeysProvider.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L56)

Merged with the parent provider's defaults.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProvider.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L70)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`
