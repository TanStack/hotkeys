---
id: ProvideHotkeysOptions
title: ProvideHotkeysOptions
---

Defined in: [hotkeys-provider.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L44)

Options for `provideHotkeys`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [hotkeys-provider.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L62)

Every app hotkey, from `defineAppHotkeys`. Listed by
`injectAppHotkeyList` whether or not they are registered.

***

### customHotkeys?

```ts
optional customHotkeys?: 
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [hotkeys-provider.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L67)

Starting custom hotkeys, such as saved data. Read once; the provider owns
the state afterwards. Invalid entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [hotkeys-provider.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L46)

Merged with the parent provider's defaults.

***

### enabled?

```ts
optional enabled?: MaybeGetter<boolean | undefined>;
```

Defined in: [hotkeys-provider.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L57)

See `HotkeysProviderScopeProps['enabled']`.

***

### exclusive?

```ts
optional exclusive?: MaybeGetter<
  | boolean
  | {
}
| undefined>;
```

Defined in: [hotkeys-provider.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L55)

See `HotkeysProviderScopeProps['exclusive']`.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [hotkeys-provider.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L69)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

`CustomHotkeys`

#### Returns

`void`

***

### scope?

```ts
optional scope?: MaybeGetter<string | undefined>;
```

Defined in: [hotkeys-provider.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L53)

See `HotkeysProviderScopeProps['scope']`. Getters, here and for
`exclusive` and `enabled`, run in the provider's injection context, so
they can `inject()` the component that provides them and read its
signals.
