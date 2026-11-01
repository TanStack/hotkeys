---
id: ProvideHotkeysOptions
title: ProvideHotkeysOptions
---

Defined in: [hotkeys-provider.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L53)

Options for `provideHotkeys`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
```

Defined in: [hotkeys-provider.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L75)

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

Defined in: [hotkeys-provider.ts:82](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L82)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: MaybeGetter<HotkeysProviderOptions>;
```

Defined in: [hotkeys-provider.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L59)

Merged with the parent provider's defaults. A getter runs in the
provider's injection context, so it can `inject(REQUEST)` to set
`platform` from the request during server rendering.

***

### enabled?

```ts
optional enabled?: MaybeGetter<boolean | undefined>;
```

Defined in: [hotkeys-provider.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L70)

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

Defined in: [hotkeys-provider.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L68)

See `HotkeysProviderScopeProps['exclusive']`.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [hotkeys-provider.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L84)

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

Defined in: [hotkeys-provider.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L66)

See `HotkeysProviderScopeProps['scope']`. Getters, here and for
`exclusive` and `enabled`, run in the provider's injection context, so
they can `inject()` the component that provides them and read its
signals.
