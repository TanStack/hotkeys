---
id: AppHotkeyInput
title: AppHotkeyInput
---

Defined in: [app-hotkeys.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L49)

One declaration passed to `defineAppHotkeys`.

## Properties

### hotkey

```ts
hotkey: Hotkey | null;
```

Defined in: [app-hotkeys.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L51)

Default hotkey: a chord, a sequence, or `null` for an action without a default.

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [app-hotkeys.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L53)

Display metadata for cheat sheets and settings screens.

***

### options?

```ts
optional options?: AppHotkeyOptions;
```

Defined in: [app-hotkeys.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L65)

Options that describe the hotkey itself. Chord defaults accept
`requireReset`; sequence defaults accept `timeout`.

***

### scope?

```ts
optional scope?: string;
```

Defined in: [app-hotkeys.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L60)

Scope this hotkey fires in, such as `'editor'`. Overrides the scope of the
provider it registers under. App hotkeys in different scopes may share a
hotkey; one in the `'global'` scope conflicts with any app hotkey that
shares its hotkey.
