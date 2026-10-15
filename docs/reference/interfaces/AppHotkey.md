---
id: AppHotkey
title: AppHotkey
---

Defined in: [app-hotkeys.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L69)

A declared app hotkey. It never holds a callback: register it with
`useHotkey(appHotkey, callback)` or the equivalent adapter API.

`TDefault` is the kind of the declared default (`HotkeyChord`,
`HotkeySequence`, or `null`). Adapters use it to type kind-specific options.

## Type Parameters

### TId

`TId` *extends* `string` = `string`

### TDefault

`TDefault` *extends* 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null` = 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null`

## Properties

### ~appHotkey

```ts
readonly ~appHotkey: true;
```

Defined in: [app-hotkeys.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L75)

Brand that distinguishes app hotkeys from raw hotkey objects.

***

### context?

```ts
readonly optional context?: string;
```

Defined in: [app-hotkeys.ts:83](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L83)

***

### defaultHotkey

```ts
readonly defaultHotkey: TDefault;
```

Defined in: [app-hotkeys.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L81)

Hotkey declared in `defineAppHotkeys`.

***

### hotkey

```ts
readonly hotkey: Hotkey | null;
```

Defined in: [app-hotkeys.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L79)

Effective hotkey: the user's custom hotkey, or the default. `null` means unbound.

***

### id

```ts
readonly id: TId;
```

Defined in: [app-hotkeys.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L77)

Stable id. Saved custom hotkeys are keyed by this value.

***

### meta?

```ts
readonly optional meta?: HotkeyMeta;
```

Defined in: [app-hotkeys.ts:82](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L82)

***

### options?

```ts
readonly optional options?: AppHotkeyOptions;
```

Defined in: [app-hotkeys.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L84)
