---
id: HotkeysContextOptions
title: HotkeysContextOptions
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L36)

Options for `setHotkeysContext` and props for `HotkeysProvider`.

## Extends

- `HotkeysProviderScopeProps`

## Extended by

- [`HotkeysProviderProps`](HotkeysProviderProps.md)

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L43)

Every app hotkey, from `defineAppHotkeys`. Read when the context is set;
listed by `getAppHotkeyList` whether or not they are registered.

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L50)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L38)

Merged with the parent context's defaults.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L52)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`
