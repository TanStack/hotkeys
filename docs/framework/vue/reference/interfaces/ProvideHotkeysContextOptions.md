---
id: ProvideHotkeysContextOptions
title: ProvideHotkeysContextOptions
---

Defined in: [HotkeysProviderContext.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L38)

Options for `provideHotkeysContext`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: MaybeRefOrGetter<
  | Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>
| undefined>;
```

Defined in: [HotkeysProviderContext.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L44)

Every app hotkey, from `defineAppHotkeys`. Read when the context is
provided; later changes update the declarations.

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [HotkeysProviderContext.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L49)

Starting custom hotkeys, such as saved data. Read once; the context owns
the state afterwards. Invalid entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: MaybeRefOrGetter<HotkeysProviderOptions | undefined>;
```

Defined in: [HotkeysProviderContext.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L39)

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProviderContext.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L51)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`
