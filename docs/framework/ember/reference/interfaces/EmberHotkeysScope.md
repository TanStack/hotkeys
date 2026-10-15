---
id: EmberHotkeysScope
title: EmberHotkeysScope
---

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L12)

Helpers, modifiers, and recorder factories with shared defaults. Owners retain their own cleanup.

## Properties

### onHotkey

```ts
onHotkey: typeof onHotkey;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L13)

***

### onHotkeys

```ts
onHotkeys: typeof onHotkeys;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L14)

***

### useHotkey

```ts
useHotkey: typeof useHotkey;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L15)

***

### useHotkeyRecorder

```ts
useHotkeyRecorder: {
  (owner, options): EmberHotkeyRecorder<HotkeyChord>;
  (owner, options): EmberHotkeyRecorder;
  (owner, options): EmberHotkeyRecorder;
  (owner, options): EmberHotkeyRecorder<HotkeyChord>;
  (owner, options): EmberHotkeyRecorder;
};
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L17)

#### Call Signature

```ts
(owner, options): EmberHotkeyRecorder<HotkeyChord>;
```

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

##### Parameters

###### owner

`object`

###### options

`HotkeyChordRecorderOptions`

##### Returns

[`EmberHotkeyRecorder`](EmberHotkeyRecorder.md)\<`HotkeyChord`\>

#### Call Signature

```ts
(owner, options): EmberHotkeyRecorder;
```

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

##### Parameters

###### owner

`object`

###### options

`HotkeySequenceRecorderOptions`

##### Returns

[`EmberHotkeyRecorder`](EmberHotkeyRecorder.md)

#### Call Signature

```ts
(owner, options): EmberHotkeyRecorder;
```

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

##### Parameters

###### owner

`object`

###### options

() => `HotkeySequenceRecorderOptions`

##### Returns

[`EmberHotkeyRecorder`](EmberHotkeyRecorder.md)

#### Call Signature

```ts
(owner, options): EmberHotkeyRecorder<HotkeyChord>;
```

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

##### Parameters

###### owner

`object`

###### options

() => `HotkeyChordRecorderOptions`

##### Returns

[`EmberHotkeyRecorder`](EmberHotkeyRecorder.md)\<`HotkeyChord`\>

#### Call Signature

```ts
(owner, options): EmberHotkeyRecorder;
```

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

##### Parameters

###### owner

`object`

###### options

() => `HotkeyRecorderOptions`

##### Returns

[`EmberHotkeyRecorder`](EmberHotkeyRecorder.md)

***

### useHotkeys

```ts
useHotkeys: typeof useHotkeys;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L16)
