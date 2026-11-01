---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L62)

Options for `setHotkeysContext` and props for `HotkeysProvider`.

## Extends

- [`HotkeysContextOptions`](HotkeysContextOptions.md)

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L50)

Every app hotkey, from `defineAppHotkeys`. Read when the context is set;
listed by `getAppHotkeyList` whether or not they are registered.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`appHotkeys`](HotkeysContextOptions.md#apphotkeys)

***

### children

```ts
children: Snippet;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L63)

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L57)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`customHotkeys`](HotkeysContextOptions.md#customhotkeys)

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L45)

Merged with the parent context's defaults.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`defaultOptions`](HotkeysContextOptions.md#defaultoptions)

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L59)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`onCustomHotkeysChange`](HotkeysContextOptions.md#oncustomhotkeyschange)
