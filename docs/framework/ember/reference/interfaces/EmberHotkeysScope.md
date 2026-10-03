---
id: EmberHotkeysScope
title: EmberHotkeysScope
---

Defined in: packages/ember-hotkeys/src/createHotkeysScope.ts:12

Helpers and recorder factories with shared defaults. Owners retain their own cleanup.

## Properties

### useHotkey

```ts
useHotkey: typeof useHotkey;
```

Defined in: packages/ember-hotkeys/src/createHotkeysScope.ts:13

***

### useHotkeyRecorder

```ts
useHotkeyRecorder: (owner, options) => EmberHotkeyRecorder;
```

Defined in: packages/ember-hotkeys/src/createHotkeysScope.ts:17

Creates an owned recorder with autotracked state and current callback options.

#### Parameters

##### owner

`object`

##### options

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeyRecorderOptions`\>

#### Returns

[`EmberHotkeyRecorder`](EmberHotkeyRecorder.md)

***

### useHotkeys

```ts
useHotkeys: typeof useHotkeys;
```

Defined in: packages/ember-hotkeys/src/createHotkeysScope.ts:14

***

### useHotkeySequence

```ts
useHotkeySequence: typeof useHotkeySequence;
```

Defined in: packages/ember-hotkeys/src/createHotkeysScope.ts:15

***

### useHotkeySequenceRecorder

```ts
useHotkeySequenceRecorder: (owner, options) => EmberHotkeySequenceRecorder;
```

Defined in: packages/ember-hotkeys/src/createHotkeysScope.ts:18

Creates an owned sequence recorder with explicit commit and cancel controls.

#### Parameters

##### owner

`object`

##### options

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeySequenceRecorderOptions`\>

#### Returns

[`EmberHotkeySequenceRecorder`](EmberHotkeySequenceRecorder.md)

***

### useHotkeySequences

```ts
useHotkeySequences: typeof useHotkeySequences;
```

Defined in: packages/ember-hotkeys/src/createHotkeysScope.ts:16
