---
id: HotkeyRegistration
title: HotkeyRegistration
---

# Interface: HotkeyRegistration

Defined in: [hotkey-manager.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L55)

A registered hotkey handler in the HotkeyManager.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L57)

The callback to invoke

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L59)

Whether this registration has fired and needs reset (for requireReset)

***

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey-manager.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L61)

The original hotkey string

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L63)

Unique identifier for this registration

***

### options

```ts
options: HotkeyOptions;
```

Defined in: [hotkey-manager.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L65)

Options for this registration

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey-manager.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L67)

The parsed hotkey

***

### target

```ts
target: HTMLElement | Document | Window;
```

Defined in: [hotkey-manager.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L69)

The resolved target element for this registration

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L71)

How many times this registration's callback has been triggered
