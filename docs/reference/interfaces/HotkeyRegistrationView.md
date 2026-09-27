---
id: HotkeyRegistrationView
title: HotkeyRegistrationView
---

Defined in: [hotkey-manager.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L92)

Public view of a hotkey registration for display and introspection.
Omits the callback function which is an internal implementation detail.

## Properties

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:106](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L106)

Whether this registration has fired and needs reset (for requireReset)

***

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey-manager.ts:94](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L94)

The original hotkey string

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:96](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L96)

Unique identifier for this registration

***

### options

```ts
options: HotkeyOptions;
```

Defined in: [hotkey-manager.ts:98](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L98)

Options for this registration

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey-manager.ts:100](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L100)

The parsed hotkey

***

### target

```ts
target: Document | Window | HTMLElement;
```

Defined in: [hotkey-manager.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L102)

The resolved target element for this registration

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L104)

How many times this registration's callback has been triggered
