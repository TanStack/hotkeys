---
id: ProvideHotkeysOptions
title: ProvideHotkeysOptions
---

Defined in: [hotkeys-provider.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L47)

Options for `provideHotkeys`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [hotkeys-provider.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L65)

Every app hotkey, from `defineAppHotkeys`. Listed by
`injectAppHotkeyList` whether or not they are registered.

***

### customHotkeys?

```ts
optional customHotkeys?: MaybeGetter<
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null
| undefined>;
```

Defined in: [hotkeys-provider.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L72)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: HotkeysProviderOptions;
```

Defined in: [hotkeys-provider.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L49)

Merged with the parent provider's defaults.

***

### enabled?

```ts
optional enabled?: MaybeGetter<boolean | undefined>;
```

Defined in: [hotkeys-provider.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L60)

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

Defined in: [hotkeys-provider.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L58)

See `HotkeysProviderScopeProps['exclusive']`.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [hotkeys-provider.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L74)

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

Defined in: [hotkeys-provider.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L56)

See `HotkeysProviderScopeProps['scope']`. Getters, here and for
`exclusive` and `enabled`, run in the provider's injection context, so
they can `inject()` the component that provides them and read its
signals.
