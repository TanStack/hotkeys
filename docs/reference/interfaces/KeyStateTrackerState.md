---
id: KeyStateTrackerState
title: KeyStateTrackerState
---

# Interface: KeyStateTrackerState

Defined in: [key-state-tracker.ts:7](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L7)

State interface for the KeyStateTracker.

## Properties

### heldCodes

```ts
heldCodes: Record<string, string>;
```

Defined in: [key-state-tracker.ts:16](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L16)

Map from normalized key name to the physical `event.code` (e.g. "KeyA", "ShiftLeft").
Useful for debugging which physical key was pressed.

***

### heldKeys

```ts
heldKeys: string[];
```

Defined in: [key-state-tracker.ts:11](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L11)

Array of currently held key names (normalized, e.g. "Control", "A").
