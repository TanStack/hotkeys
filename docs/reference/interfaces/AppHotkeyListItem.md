---
id: AppHotkeyListItem
title: AppHotkeyListItem
---

Defined in: [app-hotkeys.ts:311](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L311)

One row of an app hotkey cheat sheet.

## Type Parameters

### T

`T` *extends* [`AppHotkey`](AppHotkey.md) = [`AppHotkey`](AppHotkey.md)

## Properties

### appHotkey

```ts
appHotkey: T;
```

Defined in: [app-hotkeys.ts:312](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L312)

***

### isCustom

```ts
isCustom: boolean;
```

Defined in: [app-hotkeys.ts:315](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L315)

Whether the effective hotkey differs from the declared default.

***

### registrations

```ts
registrations: HotkeyRegistrationView[];
```

Defined in: [app-hotkeys.ts:317](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L317)

Live registrations of this app hotkey (for example, one per list row).

***

### status

```ts
status: AppHotkeyStatus;
```

Defined in: [app-hotkeys.ts:313](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L313)
