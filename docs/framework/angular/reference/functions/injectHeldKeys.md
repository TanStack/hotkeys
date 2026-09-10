---
id: injectHeldKeys
title: injectHeldKeys
---

# Function: injectHeldKeys()

```ts
function injectHeldKeys(): Signal<string[]>;
```

Defined in: [injectHeldKeys.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHeldKeys.ts#L23)

Angular inject-based API that returns a signal of currently held keyboard keys.

Subscribes to the global KeyStateTracker and updates whenever keys are
pressed or released.

## Returns

`Signal`\<`string`[]\>

Signal of array of currently held key names

## Example

```ts
@Component({
  template: `<div>Currently pressed: {{ heldKeys().join(' + ') || 'None' }}</div>`,
})
export class KeyDisplayComponent {
  heldKeys = injectHeldKeys()
}
```
