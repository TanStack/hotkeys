---
id: ProvideHotkeysContextOptions
title: ProvideHotkeysContextOptions
---

Defined in: [HotkeysProviderContext.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L58)

Options for `provideHotkeysContext`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: MaybeRefOrGetter<
  | Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>
| undefined>;
```

Defined in: [HotkeysProviderContext.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L71)

Every app hotkey, from `defineAppHotkeys`. Read when the context is
provided; later changes update the declarations.

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [HotkeysProviderContext.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L76)

Starting custom hotkeys, such as saved data. Read once; the context owns
the state afterwards. Invalid entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: MaybeRefOrGetter<HotkeysProviderOptions | undefined>;
```

Defined in: [HotkeysProviderContext.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L60)

Merged with the parent context's defaults.

***

### enabled?

```ts
optional enabled?: MaybeRefOrGetter<boolean | undefined>;
```

Defined in: [HotkeysProviderContext.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L66)

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

Defined in: [HotkeysProviderContext.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L64)

See `HotkeysProviderScopeProps['exclusive']`.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProviderContext.ts:78](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L78)

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

Defined in: [HotkeysProviderContext.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L62)

See `HotkeysProviderScopeProps['scope']`.
