---
id: HotkeyRegistration
title: HotkeyRegistration
---

Defined in: [hotkey-manager.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L61)

A registered hotkey handler in the HotkeyManager.

## Properties

### activeMatch?

```ts
optional activeMatch?: object;
```

Defined in: [hotkey-manager.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L67)

The concrete key/code that activated a requireReset registration.

#### code

```ts
code: string;
```

#### key

```ts
key: string;
```

***

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L63)

The callback to invoke

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L65)

Whether this registration has fired and needs reset (for requireReset)

***

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey-manager.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L69)

The original hotkey string

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L71)

Unique identifier for this registration

***

### options

```ts
options: HotkeyOptions;
```

Defined in: [hotkey-manager.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L73)

Options for this registration

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey-manager.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L75)

The parsed hotkey

***

### target

```ts
target: Document | Window | HTMLElement;
```

Defined in: [hotkey-manager.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L77)

The resolved target element for this registration

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L79)

How many times this registration's callback has been triggered
