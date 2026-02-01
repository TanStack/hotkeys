---
id: HotkeyRegistration
title: HotkeyRegistration
---

# Interface: HotkeyRegistration

Defined in: [types.ts:445](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L445)

A registered hotkey handler in the HotkeyManager.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [types.ts:453](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L453)

The callback to invoke

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [types.ts:457](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L457)

Whether this registration has fired and needs reset (for requireReset)

***

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [types.ts:449](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L449)

The original hotkey string

***

### id

```ts
id: string;
```

Defined in: [types.ts:447](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L447)

Unique identifier for this registration

***

### options

```ts
options: HotkeyOptions;
```

Defined in: [types.ts:455](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L455)

Options for this registration

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [types.ts:451](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L451)

The parsed hotkey
