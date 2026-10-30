---
id: AdapterOptionsFor
title: AdapterOptionsFor
---

```ts
type AdapterOptionsFor<T, TTarget> = [T] extends [never] ? AdapterCommonOptions<TTarget> : T extends readonly [unknown] ? AdapterChordOptions<TTarget> : T extends ReadonlyArray<unknown> ? AdapterSequenceOptions<TTarget> : AdapterChordOptions<TTarget>;
```

Defined in: [adapter.ts:187](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L187)

Chord options for chords, sequence options for sequences.

## Type Parameters

### T

`T` *extends* `RegisterableHotkey`

### TTarget

`TTarget`
