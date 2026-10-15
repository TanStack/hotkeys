---
id: HotkeyOptions
title: HotkeyOptions
---

Defined in: [hotkey-manager.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L45)

Options shared by chords and sequences.

## Extended by

- [`HotkeyChordOptions`](HotkeyChordOptions.md)
- [`HotkeySequenceOptions`](HotkeySequenceOptions.md)

## Properties

### appHotkeyId?

```ts
optional appHotkeyId?: string;
```

Defined in: [hotkey-manager.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L76)

Id of the app hotkey this registration implements. Adapters set this when registering an app hotkey from `defineAppHotkeys`.

***

### conflictBehavior?

```ts
optional conflictBehavior?: ConflictBehavior;
```

Defined in: [hotkey-manager.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L47)

Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn'

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [hotkey-manager.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L53)

Soft-disable: when `false`, the callback does not run but the registration
stays in `HotkeyManager` (and in devtools). Toggling this should update the
existing handle via `setOptions` rather than unregistering. Defaults to `true`.

***

### eventType?

```ts
optional eventType?: "keyup" | "keydown";
```

Defined in: [hotkey-manager.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L55)

The event type to listen for. Defaults to 'keydown'

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean;
```

Defined in: [hotkey-manager.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L64)

Ignore events from text inputs, textarea, select, and contenteditable.
Document/window targets also preserve unmodified Space/Enter on native
buttons and Enter on links. Explicit element targets can override activation.
Defaults based on the hotkey (the first step of a sequence): true for single
keys and Shift/Alt combos; false for Ctrl/Meta shortcuts and Escape. Set
false to handle keys even in these controls.

***

### meta?

```ts
optional meta?: HotkeyMeta;
```

Defined in: [hotkey-manager.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L74)

Optional metadata (name, description, custom fields via declaration merging)

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-manager.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L66)

The target platform for resolving 'Mod'

***

### preventDefault?

```ts
optional preventDefault?: boolean;
```

Defined in: [hotkey-manager.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L68)

Prevent the default browser action when the hotkey matches. Defaults to true

***

### stopPropagation?

```ts
optional stopPropagation?: boolean;
```

Defined in: [hotkey-manager.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L70)

Stop event propagation when the hotkey matches. Defaults to true

***

### target?

```ts
optional target?: Target | null;
```

Defined in: [hotkey-manager.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L72)

The DOM element to attach the event listener to. Defaults to document.
