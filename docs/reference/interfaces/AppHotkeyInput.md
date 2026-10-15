---
id: AppHotkeyInput
title: AppHotkeyInput
---

Defined in: [app-hotkeys.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L44)

One declaration passed to `defineAppHotkeys`.

## Properties

### context?

```ts
optional context?: string;
```

Defined in: [app-hotkeys.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L54)

Label for where this hotkey applies, such as `'editor'`. App hotkeys with
different contexts may share a hotkey; one without a context conflicts with
any app hotkey that shares its hotkey. It does not affect matching.

***

### hotkey

```ts
hotkey: Hotkey | null;
```

Defined in: [app-hotkeys.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L46)

Default hotkey: a chord, a sequence, or `null` for an action without a default.

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [app-hotkeys.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L48)

Display metadata for cheat sheets and settings screens.

***

### options?

```ts
optional options?: AppHotkeyOptions;
```

Defined in: [app-hotkeys.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L59)

Options that describe the hotkey itself. Chord defaults accept
`requireReset`; sequence defaults accept `timeout`.
