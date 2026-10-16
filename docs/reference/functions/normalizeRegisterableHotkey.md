---
id: normalizeRegisterableHotkey
title: normalizeRegisterableHotkey
---

## Call Signature

```ts
function normalizeRegisterableHotkey(hotkey, platform?): HotkeyChord;
```

Defined in: [parse.ts:245](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L245)

Normalizes a chord (string or [RawHotkey](../type-aliases/RawHotkey.md) object) or a sequence to canonical form.
Each sequence step is normalized, and a one-step sequence becomes its chord.
Use this in framework adapters instead of branching on `formatHotkey(rawHotkeyToParsedHotkey(...))`.

### Parameters

#### hotkey

[`RegisterableHotkeyChord`](../type-aliases/RegisterableHotkeyChord.md)

#### platform?

`"mac"` \| `"windows"` \| `"linux"`

### Returns

[`HotkeyChord`](../type-aliases/HotkeyChord.md)

## Call Signature

```ts
function normalizeRegisterableHotkey(hotkey, platform?): Hotkey;
```

Defined in: [parse.ts:249](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L249)

Normalizes a chord (string or [RawHotkey](../type-aliases/RawHotkey.md) object) or a sequence to canonical form.
Each sequence step is normalized, and a one-step sequence becomes its chord.
Use this in framework adapters instead of branching on `formatHotkey(rawHotkeyToParsedHotkey(...))`.

### Parameters

#### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

#### platform?

`"mac"` \| `"windows"` \| `"linux"`

### Returns

[`Hotkey`](../type-aliases/Hotkey.md)
