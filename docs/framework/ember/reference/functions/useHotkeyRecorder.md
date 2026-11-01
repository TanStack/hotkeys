---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

## Call Signature

```ts
function useHotkeyRecorder(
   owner, 
   options, 
scope?): EmberHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L28)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.
Pass a scope from `createHotkeysScope` to apply its `hotkeyRecorder`
defaults.

### Parameters

#### owner

`object`

#### options

`HotkeyChordRecorderOptions`

#### scope?

[`EmberHotkeysScope`](../interfaces/EmberHotkeysScope.md)

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)\<`HotkeyChord`\>

## Call Signature

```ts
function useHotkeyRecorder(
   owner, 
   options, 
   scope?): EmberHotkeyRecorder;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L33)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.
Pass a scope from `createHotkeysScope` to apply its `hotkeyRecorder`
defaults.

### Parameters

#### owner

`object`

#### options

`HotkeySequenceRecorderOptions`

#### scope?

[`EmberHotkeysScope`](../interfaces/EmberHotkeysScope.md)

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)

## Call Signature

```ts
function useHotkeyRecorder(
   owner, 
   options, 
   scope?): EmberHotkeyRecorder;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L40)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.
Pass a scope from `createHotkeysScope` to apply its `hotkeyRecorder`
defaults.

### Parameters

#### owner

`object`

#### options

() => `HotkeySequenceRecorderOptions`

#### scope?

[`EmberHotkeysScope`](../interfaces/EmberHotkeysScope.md)

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)

## Call Signature

```ts
function useHotkeyRecorder(
   owner, 
   options, 
scope?): EmberHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L45)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.
Pass a scope from `createHotkeysScope` to apply its `hotkeyRecorder`
defaults.

### Parameters

#### owner

`object`

#### options

() => `HotkeyChordRecorderOptions`

#### scope?

[`EmberHotkeysScope`](../interfaces/EmberHotkeysScope.md)

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)\<`HotkeyChord`\>

## Call Signature

```ts
function useHotkeyRecorder(
   owner, 
   options, 
   scope?): EmberHotkeyRecorder;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L50)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.
Pass a scope from `createHotkeysScope` to apply its `hotkeyRecorder`
defaults.

### Parameters

#### owner

`object`

#### options

() => `HotkeyRecorderOptions`

#### scope?

[`EmberHotkeysScope`](../interfaces/EmberHotkeysScope.md)

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)
