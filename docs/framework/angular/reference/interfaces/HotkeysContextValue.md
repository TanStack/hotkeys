---
id: HotkeysContextValue
title: HotkeysContextValue
---

Defined in: [hotkeys-provider.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L74)

## Properties

### appHotkeysState

```ts
readonly appHotkeysState: Signal<
  | AppHotkeysState<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
| null>;
```

Defined in: [hotkeys-provider.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L81)

Tracks app hotkeys and custom hotkeys so signals and effects re-run.

***

### appHotkeysStore

```ts
readonly appHotkeysStore: 
  | AppHotkeysStore<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [hotkeys-provider.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L79)

***

### defaultOptions

```ts
readonly defaultOptions: HotkeysProviderOptions;
```

Defined in: [hotkeys-provider.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L76)

Merged with every ancestor provider's defaults, including `hotkey.scope`.

***

### enabled

```ts
readonly enabled: Signal<boolean>;
```

Defined in: [hotkeys-provider.ts:78](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L78)

Whether this provider and every ancestor are enabled.
