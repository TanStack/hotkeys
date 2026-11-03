---
id: HotkeysContextValue
title: HotkeysContextValue
---

Defined in: [hotkeys-provider.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L88)

## Properties

### appHotkeysState

```ts
readonly appHotkeysState: Signal<
  | AppHotkeysState<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
| null>;
```

Defined in: [hotkeys-provider.ts:95](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L95)

Tracks app hotkeys and custom hotkeys so signals and effects re-run.

***

### appHotkeysStore

```ts
readonly appHotkeysStore: 
  | AppHotkeysStore<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [hotkeys-provider.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L93)

***

### defaultOptions

```ts
readonly defaultOptions: HotkeysProviderOptions;
```

Defined in: [hotkeys-provider.ts:90](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L90)

Merged with every ancestor provider's defaults, including `hotkey.scope`.

***

### enabled

```ts
readonly enabled: Signal<boolean>;
```

Defined in: [hotkeys-provider.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L92)

Whether this provider and every ancestor are enabled.
