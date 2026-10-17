---
id: ProvideHotkeysContextOptions
title: ProvideHotkeysContextOptions
---

Defined in: [HotkeysProviderContext.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L55)

Options for `provideHotkeysContext`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: MaybeRefOrGetter<
  | Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>
| undefined>;
```

Defined in: [HotkeysProviderContext.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L68)

Every app hotkey, from `defineAppHotkeys`. Read when the context is
provided; later changes update the declarations.

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [HotkeysProviderContext.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L73)

Starting custom hotkeys, such as saved data. Read once; the context owns
the state afterwards. Invalid entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: MaybeRefOrGetter<HotkeysProviderOptions | undefined>;
```

Defined in: [HotkeysProviderContext.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L57)

Merged with the parent context's defaults.

***

### enabled?

```ts
optional enabled?: MaybeRefOrGetter<boolean | undefined>;
```

Defined in: [HotkeysProviderContext.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L63)

See `HotkeysProviderScopeProps['enabled']`.

***

### exclusive?

```ts
optional exclusive?: MaybeRefOrGetter<
  | boolean
  | {
}
| undefined>;
```

Defined in: [HotkeysProviderContext.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L61)

See `HotkeysProviderScopeProps['exclusive']`.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProviderContext.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L75)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`

***

### scope?

```ts
optional scope?: MaybeRefOrGetter<string | undefined>;
```

Defined in: [HotkeysProviderContext.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L59)

See `HotkeysProviderScopeProps['scope']`.
