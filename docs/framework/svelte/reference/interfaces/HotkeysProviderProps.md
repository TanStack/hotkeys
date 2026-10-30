---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L53)

Options for `setHotkeysContext` and props for `HotkeysProvider`.

## Extends

- [`HotkeysContextOptions`](HotkeysContextOptions.md)

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L43)

Every app hotkey, from `defineAppHotkeys`. Read when the context is set;
listed by `getAppHotkeyList` whether or not they are registered.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`appHotkeys`](HotkeysContextOptions.md#apphotkeys)

***

### children

```ts
children: Snippet;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L54)

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L48)

Starting custom hotkeys, such as saved data. Read once; the context owns
the state afterwards. Invalid entries are ignored with a warning.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`customHotkeys`](HotkeysContextOptions.md#customhotkeys)

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L38)

Merged with the parent context's defaults.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`defaultOptions`](HotkeysContextOptions.md#defaultoptions)

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L50)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`onCustomHotkeysChange`](HotkeysContextOptions.md#oncustomhotkeyschange)
