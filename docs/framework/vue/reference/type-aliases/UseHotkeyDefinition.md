---
id: UseHotkeyDefinition
title: UseHotkeyDefinition
---

```ts
type UseHotkeyDefinition = 
  | {
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<RegisterableHotkeyChord>;
  options?: MaybeRefOrGetter<UseHotkeyChordOptions>;
}
  | {
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<RegisterableHotkeySequence>;
  options?: MaybeRefOrGetter<UseHotkeySequenceOptions>;
}
  | {
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<AppHotkey>;
  options?: MaybeRefOrGetter<UseAppHotkeyOptions>;
}
  | {
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<RegisterableHotkey | null | undefined>;
  options?: MaybeRefOrGetter<UseHotkeyOptions>;
};
```

Defined in: [useHotkeys.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeys.ts#L36)

One hotkey for `useHotkeys`. The hotkey and options may be refs or getters.
Chords accept `requireReset`; sequences accept `timeout`; hotkeys of unknown
kind accept only shared options.

## Union Members

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<RegisterableHotkeyChord>;
  options?: MaybeRefOrGetter<UseHotkeyChordOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

The function to call when the hotkey is pressed

#### hotkey

```ts
hotkey: MaybeRefOrGetter<RegisterableHotkeyChord>;
```

A chord string such as `'Mod+S'`, or a chord object

#### options?

```ts
optional options?: MaybeRefOrGetter<UseHotkeyChordOptions>;
```

Per-hotkey options (merged on top of commonOptions)

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<RegisterableHotkeySequence>;
  options?: MaybeRefOrGetter<UseHotkeySequenceOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: MaybeRefOrGetter<RegisterableHotkeySequence>;
```

A sequence such as `['G', 'G']`, with each step a string or an object

#### options?

```ts
optional options?: MaybeRefOrGetter<UseHotkeySequenceOptions>;
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<AppHotkey>;
  options?: MaybeRefOrGetter<UseAppHotkeyOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: MaybeRefOrGetter<AppHotkey>;
```

An app hotkey from `defineAppHotkeys`

#### options?

```ts
optional options?: MaybeRefOrGetter<UseAppHotkeyOptions>;
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeRefOrGetter<RegisterableHotkey | null | undefined>;
  options?: MaybeRefOrGetter<UseHotkeyOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: MaybeRefOrGetter<RegisterableHotkey | null | undefined>;
```

A hotkey whose kind is not known statically. Accepts only shared
options. `undefined`, `null`, or `''` registers nothing.

#### options?

```ts
optional options?: MaybeRefOrGetter<UseHotkeyOptions>;
```
