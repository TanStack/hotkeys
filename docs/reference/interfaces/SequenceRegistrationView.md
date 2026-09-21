---
id: SequenceRegistrationView
title: SequenceRegistrationView
---

Defined in: [sequence-manager.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L73)

View of a sequence registration for devtools display.
Progress fields reflect an in-progress match (between first key and completion or timeout).

## Properties

### hasFired

```ts
hasFired: boolean;
```

Defined in: [sequence-manager.ts:80](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L80)

Whether this sequence has been triggered at least once.

***

### id

```ts
id: string;
```

Defined in: [sequence-manager.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L74)

***

### matchedStepCount

```ts
matchedStepCount: number;
```

Defined in: [sequence-manager.ts:82](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L82)

Steps matched in the current attempt (0 when idle or just completed).

***

### options

```ts
options: SequenceOptions;
```

Defined in: [sequence-manager.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L76)

***

### partialMatchLastKeyTime

```ts
partialMatchLastKeyTime: number;
```

Defined in: [sequence-manager.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L84)

`Date.now()` when the last step in the current attempt matched; 0 if none.

***

### sequence

```ts
sequence: HotkeySequence;
```

Defined in: [sequence-manager.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L75)

***

### target

```ts
target: Target;
```

Defined in: [sequence-manager.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L77)

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [sequence-manager.ts:78](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L78)
