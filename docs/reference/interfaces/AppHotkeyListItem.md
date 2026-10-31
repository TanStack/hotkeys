---
id: AppHotkeyListItem
title: AppHotkeyListItem
---

Defined in: [app-hotkeys.ts:384](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L384)

One row of an app hotkey cheat sheet.

## Type Parameters

### T

`T` *extends* [`AppHotkey`](AppHotkey.md) = [`AppHotkey`](AppHotkey.md)

## Properties

### appHotkey

```ts
appHotkey: T;
```

Defined in: [app-hotkeys.ts:385](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L385)

***

### isCustom

```ts
isCustom: boolean;
```

Defined in: [app-hotkeys.ts:388](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L388)

Whether the effective hotkey differs from the declared default.

***

### registrations

```ts
registrations: HotkeyRegistrationView[];
```

Defined in: [app-hotkeys.ts:390](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L390)

Live registrations of this app hotkey (for example, one per list row).

***

### status

```ts
status: AppHotkeyStatus;
```

Defined in: [app-hotkeys.ts:386](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L386)
