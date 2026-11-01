---
id: ProvideHotkeysOptions
title: ProvideHotkeysOptions
---

Defined in: [hotkeys-provider.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L54)

Options for `provideHotkeys`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [hotkeys-provider.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L76)

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

Defined in: [hotkeys-provider.ts:83](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L83)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: MaybeGetter<HotkeysProviderOptions>;
```

Defined in: [hotkeys-provider.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L60)

Merged with the parent provider's defaults. A getter runs in the
provider's injection context, so it can `inject(REQUEST)` to set
`platform` from the request during server rendering.

***

### enabled?

```ts
optional enabled?: MaybeGetter<boolean | undefined>;
```

Defined in: [hotkeys-provider.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L71)

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

Defined in: [hotkeys-provider.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L69)

See `HotkeysProviderScopeProps['exclusive']`.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [hotkeys-provider.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L85)

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

Defined in: [hotkeys-provider.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L67)

See `HotkeysProviderScopeProps['scope']`. Getters, here and for
`exclusive` and `enabled`, run in the provider's injection context, so
they can `inject()` the component that provides them and read its
signals.
