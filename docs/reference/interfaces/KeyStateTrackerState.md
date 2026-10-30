---
id: KeyStateTrackerState
title: KeyStateTrackerState
---

Defined in: [key-state-tracker.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L8)

State interface for the KeyStateTracker.

## Properties

### heldCodes

```ts
heldCodes: Record<string, string>;
```

Defined in: [key-state-tracker.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L17)

Map from normalized key name to the physical `event.code` (e.g. "KeyA", "ShiftLeft").
Useful for debugging which physical key was pressed.

***

### heldKeys

```ts
heldKeys: string[];
```

Defined in: [key-state-tracker.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L12)

Array of currently held key names (normalized, e.g. "Control", "A").
