---
id: AppHotkeyInput
title: AppHotkeyInput
---

Defined in: [app-hotkeys.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L45)

One declaration passed to `defineAppHotkeys`.

## Properties

### context?

```ts
optional context?: string;
```

Defined in: [app-hotkeys.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L55)

Label for where this hotkey applies, such as `'editor'`. App hotkeys with
different contexts may share a hotkey; one without a context conflicts with
any app hotkey that shares its hotkey. It does not affect matching.

***

### hotkey

```ts
hotkey: Hotkey | null;
```

Defined in: [app-hotkeys.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L47)

Default hotkey: a chord, a sequence, or `null` for an action without a default.

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [app-hotkeys.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L49)

Display metadata for cheat sheets and settings screens.

***

### options?

```ts
optional options?: AppHotkeyOptions;
```

Defined in: [app-hotkeys.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L60)

Options that describe the hotkey itself. Chord defaults accept
`requireReset`; sequence defaults accept `timeout`.
