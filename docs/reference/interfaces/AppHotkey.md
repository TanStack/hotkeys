---
id: AppHotkey
title: AppHotkey
---

Defined in: [app-hotkeys.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L73)

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

Defined in: [app-hotkeys.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L79)

Brand that distinguishes app hotkeys from raw hotkey objects.

***

### defaultHotkey

```ts
readonly defaultHotkey: TDefault;
```

Defined in: [app-hotkeys.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L85)

Hotkey declared in `defineAppHotkeys`.

***

### hotkey

```ts
readonly hotkey: Hotkey | null;
```

Defined in: [app-hotkeys.ts:83](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L83)

Effective hotkey: the user's custom hotkey, or the default. `null` means unbound.

***

### id

```ts
readonly id: TId;
```

Defined in: [app-hotkeys.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L81)

Stable id. Saved custom hotkeys are keyed by this value.

***

### meta?

```ts
readonly optional meta?: HotkeyMeta;
```

Defined in: [app-hotkeys.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L86)

***

### options?

```ts
readonly optional options?: AppHotkeyOptions;
```

Defined in: [app-hotkeys.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L88)

***

### scope?

```ts
readonly optional scope?: string;
```

Defined in: [app-hotkeys.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L87)
