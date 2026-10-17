---
id: AppHotkeyInput
title: AppHotkeyInput
---

Defined in: [app-hotkeys.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L46)

One declaration passed to `defineAppHotkeys`.

## Properties

### hotkey

```ts
hotkey: Hotkey | null;
```

Defined in: [app-hotkeys.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L48)

Default hotkey: a chord, a sequence, or `null` for an action without a default.

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [app-hotkeys.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L50)

Display metadata for cheat sheets and settings screens.

***

### options?

```ts
optional options?: AppHotkeyOptions;
```

Defined in: [app-hotkeys.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L62)

Options that describe the hotkey itself. Chord defaults accept
`requireReset`; sequence defaults accept `timeout`.

***

### scope?

```ts
optional scope?: string;
```

Defined in: [app-hotkeys.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L57)

Scope this hotkey fires in, such as `'editor'`. Overrides the scope of the
provider it registers under. App hotkeys in different scopes may share a
hotkey; one in the `'global'` scope conflicts with any app hotkey that
shares its hotkey.
