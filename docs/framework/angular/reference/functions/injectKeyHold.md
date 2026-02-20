---
id: injectKeyHold
title: injectKeyHold
---

# Function: injectKeyHold()

```ts
function injectKeyHold(key): Signal<boolean>;
```

Defined in: [injectKeyHold.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectKeyHold.ts#L40)

Angular inject-based API that returns a signal that is true when the given key is held.

Subscribes to the global KeyStateTracker and uses a computed to determine
if the specified key is held.

## Parameters

### key

The key to check (e.g. 'Shift', 'Control', 'Space') - can be a getter function

`HeldKey` | () => `HeldKey`

## Returns

`Signal`\<`boolean`\>

Signal that returns true if the key is currently held down

## Examples

```ts
@Component({
  template: `{{ isShiftHeld() ? 'Shift is pressed!' : 'Press Shift' }}`,
})
export class ShiftIndicatorComponent {
  isShiftHeld = injectKeyHold('Shift')
}
```

```ts
@Component({
  template: `
    <span [style.opacity]="ctrl() ? 1 : 0.3">Ctrl</span>
    <span [style.opacity]="shift() ? 1 : 0.3">Shift</span>
  `,
})
export class ModifierIndicatorsComponent {
  ctrl = injectKeyHold('Control')
  shift = injectKeyHold('Shift')
}
```
