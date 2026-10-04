---
id: EmberHotkeysScope
title: EmberHotkeysScope
---

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L14)

Helpers, modifiers, and recorder factories with shared defaults. Owners retain their own cleanup.

## Properties

### onHotkey

```ts
onHotkey: typeof onHotkey;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L15)

***

### onHotkeys

```ts
onHotkeys: typeof onHotkeys;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L16)

***

### useHotkey

```ts
useHotkey: typeof useHotkey;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L17)

***

### useHotkeyRecorder

```ts
useHotkeyRecorder: (owner, options) => EmberHotkeyRecorder;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L21)

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

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L18)

***

### useHotkeySequence

```ts
useHotkeySequence: typeof useHotkeySequence;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L19)

***

### useHotkeySequenceRecorder

```ts
useHotkeySequenceRecorder: (owner, options) => EmberHotkeySequenceRecorder;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L22)

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

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L20)
