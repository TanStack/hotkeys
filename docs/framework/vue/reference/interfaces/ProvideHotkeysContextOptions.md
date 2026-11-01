---
id: ProvideHotkeysContextOptions
title: ProvideHotkeysContextOptions
---

Defined in: [HotkeysProviderContext.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L66)

Options for `provideHotkeysContext`.

## Properties

### appHotkeys?

```ts
optional appHotkeys?: MaybeRefOrGetter<
  | Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>
| undefined>;
```

Defined in: [HotkeysProviderContext.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L79)

Every app hotkey, from `defineAppHotkeys`. Read when the context is
provided; later changes update the declarations.

***

### customHotkeys?

```ts
optional customHotkeys?: MaybeRefOrGetter<
  | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null
| undefined>;
```

Defined in: [HotkeysProviderContext.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L86)

The user's saved custom hotkeys. When the value changes, such as after
saved data loads or the user signs in, it replaces the current custom
hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
entries are ignored with a warning.

***

### defaultOptions?

```ts
optional defaultOptions?: MaybeRefOrGetter<HotkeysProviderOptions | undefined>;
```

Defined in: [HotkeysProviderContext.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L68)

Merged with the parent context's defaults.

***

### enabled?

```ts
optional enabled?: MaybeRefOrGetter<boolean | undefined>;
```

Defined in: [HotkeysProviderContext.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L74)

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

Defined in: [HotkeysProviderContext.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L72)

See `HotkeysProviderScopeProps['exclusive']`.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [HotkeysProviderContext.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L88)

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

Defined in: [HotkeysProviderContext.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L70)

See `HotkeysProviderScopeProps['scope']`.
