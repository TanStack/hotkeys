---
id: AppHotkeyListItem
title: AppHotkeyListItem
---

Defined in: [app-hotkeys.ts:308](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L308)

One row of an app hotkey cheat sheet.

## Type Parameters

### T

`T` *extends* [`AppHotkey`](AppHotkey.md) = [`AppHotkey`](AppHotkey.md)

## Properties

### appHotkey

```ts
appHotkey: T;
```

Defined in: [app-hotkeys.ts:309](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L309)

***

### isCustom

```ts
isCustom: boolean;
```

Defined in: [app-hotkeys.ts:312](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L312)

Whether the effective hotkey differs from the declared default.

***

### registrations

```ts
registrations: HotkeyRegistrationView[];
```

Defined in: [app-hotkeys.ts:314](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L314)

Live registrations of this app hotkey (for example, one per list row).

***

### status

```ts
status: AppHotkeyStatus;
```

Defined in: [app-hotkeys.ts:310](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L310)
