---
id: HotkeyRegistration
title: HotkeyRegistration
---

# Interface: HotkeyRegistration

Defined in: [hotkey-manager.ts:51](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L51)

A registered hotkey handler in the HotkeyManager.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:53](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L53)

The callback to invoke

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:55](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L55)

Whether this registration has fired and needs reset (for requireReset)

***

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey-manager.ts:57](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L57)

The original hotkey string

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:59](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L59)

Unique identifier for this registration

***

### options

```ts
options: HotkeyOptions;
```

Defined in: [hotkey-manager.ts:61](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L61)

Options for this registration

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey-manager.ts:63](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L63)

The parsed hotkey

***

### target

```ts
target: Document | Window | HTMLElement;
```

Defined in: [hotkey-manager.ts:65](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L65)

The resolved target element for this registration

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:67](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L67)

How many times this registration's callback has been triggered
