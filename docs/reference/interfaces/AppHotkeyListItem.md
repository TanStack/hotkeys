---
id: AppHotkeyListItem
title: AppHotkeyListItem
---

Defined in: app-hotkeys.ts:307

One row of an app hotkey cheat sheet.

## Type Parameters

### T

`T` *extends* [`AppHotkey`](AppHotkey.md) = [`AppHotkey`](AppHotkey.md)

## Properties

### appHotkey

```ts
appHotkey: T;
```

Defined in: app-hotkeys.ts:308

***

### isCustom

```ts
isCustom: boolean;
```

Defined in: app-hotkeys.ts:311

Whether the effective hotkey differs from the declared default.

***

### registrations

```ts
registrations: HotkeyRegistrationView[];
```

Defined in: app-hotkeys.ts:313

Live registrations of this app hotkey (for example, one per list row).

***

### status

```ts
status: AppHotkeyStatus;
```

Defined in: app-hotkeys.ts:309
