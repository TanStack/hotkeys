---
id: HotkeyRegistration
title: HotkeyRegistration
---

# Interface: HotkeyRegistration

Defined in: [hotkey-manager.ts:36](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L36)

A registered hotkey handler in the HotkeyManager.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:44](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L44)

The callback to invoke

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:48](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L48)

Whether this registration has fired and needs reset (for requireReset)

***

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey-manager.ts:40](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L40)

The original hotkey string

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:38](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L38)

Unique identifier for this registration

***

### options

```ts
options: HotkeyOptions;
```

Defined in: [hotkey-manager.ts:46](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L46)

Options for this registration

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey-manager.ts:42](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L42)

The parsed hotkey

***

### target

```ts
target: Document | Window | HTMLElement;
```

Defined in: [hotkey-manager.ts:50](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey-manager.ts#L50)

The resolved target element for this registration
