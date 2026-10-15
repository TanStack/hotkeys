---
id: injectHotkeyRecorder
title: injectHotkeyRecorder
---

## Call Signature

```ts
function injectHotkeyRecorder(options): AngularHotkeyRecorder<HotkeyChord>;
```

Defined in: [injectHotkeyRecorder.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L70)

Angular inject-based API for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence. Escape cancels;
Backspace/Delete removes the last step or clears.

### Parameters

#### options

`HotkeyChordRecorderOptions`

Configuration options for the recorder (or getter)

### Returns

[`AngularHotkeyRecorder`](../interfaces/AngularHotkeyRecorder.md)\<`HotkeyChord`\>

Object with recording state signals and control functions

### Example

```ts
@Component({ ... })
export class ShortcutSettingsComponent {
  shortcut = signal<Hotkey>('Mod+S')
  recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => this.shortcut.set(hotkey),
    onCancel: () => console.log('Recording cancelled'),
  })

  constructor() {
    injectHotkey(
      () => this.shortcut(),
      () => this.handleSave(),
    )
  }
}
```

## Call Signature

```ts
function injectHotkeyRecorder(options): AngularHotkeyRecorder;
```

Defined in: [injectHotkeyRecorder.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L73)

Angular inject-based API for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence. Escape cancels;
Backspace/Delete removes the last step or clears.

### Parameters

#### options

`HotkeySequenceRecorderOptions`

Configuration options for the recorder (or getter)

### Returns

[`AngularHotkeyRecorder`](../interfaces/AngularHotkeyRecorder.md)

Object with recording state signals and control functions

### Example

```ts
@Component({ ... })
export class ShortcutSettingsComponent {
  shortcut = signal<Hotkey>('Mod+S')
  recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => this.shortcut.set(hotkey),
    onCancel: () => console.log('Recording cancelled'),
  })

  constructor() {
    injectHotkey(
      () => this.shortcut(),
      () => this.handleSave(),
    )
  }
}
```

## Call Signature

```ts
function injectHotkeyRecorder(options): AngularHotkeyRecorder;
```

Defined in: [injectHotkeyRecorder.ts:78](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L78)

Angular inject-based API for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence. Escape cancels;
Backspace/Delete removes the last step or clears.

### Parameters

#### options

() => `HotkeySequenceRecorderOptions`

Configuration options for the recorder (or getter)

### Returns

[`AngularHotkeyRecorder`](../interfaces/AngularHotkeyRecorder.md)

Object with recording state signals and control functions

### Example

```ts
@Component({ ... })
export class ShortcutSettingsComponent {
  shortcut = signal<Hotkey>('Mod+S')
  recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => this.shortcut.set(hotkey),
    onCancel: () => console.log('Recording cancelled'),
  })

  constructor() {
    injectHotkey(
      () => this.shortcut(),
      () => this.handleSave(),
    )
  }
}
```

## Call Signature

```ts
function injectHotkeyRecorder(options): AngularHotkeyRecorder<HotkeyChord>;
```

Defined in: [injectHotkeyRecorder.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L81)

Angular inject-based API for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence. Escape cancels;
Backspace/Delete removes the last step or clears.

### Parameters

#### options

() => `HotkeyChordRecorderOptions`

Configuration options for the recorder (or getter)

### Returns

[`AngularHotkeyRecorder`](../interfaces/AngularHotkeyRecorder.md)\<`HotkeyChord`\>

Object with recording state signals and control functions

### Example

```ts
@Component({ ... })
export class ShortcutSettingsComponent {
  shortcut = signal<Hotkey>('Mod+S')
  recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => this.shortcut.set(hotkey),
    onCancel: () => console.log('Recording cancelled'),
  })

  constructor() {
    injectHotkey(
      () => this.shortcut(),
      () => this.handleSave(),
    )
  }
}
```

## Call Signature

```ts
function injectHotkeyRecorder(options): AngularHotkeyRecorder;
```

Defined in: [injectHotkeyRecorder.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L84)

Angular inject-based API for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence. Escape cancels;
Backspace/Delete removes the last step or clears.

### Parameters

#### options

() => `HotkeyRecorderOptions`

Configuration options for the recorder (or getter)

### Returns

[`AngularHotkeyRecorder`](../interfaces/AngularHotkeyRecorder.md)

Object with recording state signals and control functions

### Example

```ts
@Component({ ... })
export class ShortcutSettingsComponent {
  shortcut = signal<Hotkey>('Mod+S')
  recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => this.shortcut.set(hotkey),
    onCancel: () => console.log('Recording cancelled'),
  })

  constructor() {
    injectHotkey(
      () => this.shortcut(),
      () => this.handleSave(),
    )
  }
}
```
