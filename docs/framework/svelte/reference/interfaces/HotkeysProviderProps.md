---
id: HotkeysProviderProps
title: HotkeysProviderProps
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L51)

Options for `setHotkeysContext` and props for `HotkeysProvider`.

## Extends

- [`HotkeysContextOptions`](HotkeysContextOptions.md)

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L41)

Every app hotkey, from `defineAppHotkeys`. Read when the context is set;
listed by `getAppHotkeyList` whether or not they are registered.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`appHotkeys`](HotkeysContextOptions.md#apphotkeys)

***

### children

```ts
children: Snippet;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L52)

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L46)

Starting custom hotkeys, such as saved data. Read once; the context owns
the state afterwards. Invalid entries are ignored with a warning.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`customHotkeys`](HotkeysContextOptions.md#customhotkeys)

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L36)

Merged with the parent context's defaults.

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`defaultOptions`](HotkeysContextOptions.md#defaultoptions)

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L48)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`

#### Inherited from

[`HotkeysContextOptions`](HotkeysContextOptions.md).[`onCustomHotkeysChange`](HotkeysContextOptions.md#oncustomhotkeyschange)
