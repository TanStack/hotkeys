---
id: injectHeldKeyCodes
title: injectHeldKeyCodes
---

# Function: injectHeldKeyCodes()

```ts
function injectHeldKeyCodes(): Signal<Record<string, string>>;
```

Defined in: [injectHeldKeyCodes.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHeldKeyCodes.ts#L28)

Angular inject-based API that returns a signal of a map from held key names to their physical `event.code` values.

Useful for debugging which physical key was pressed (e.g. distinguishing
left vs right Shift via "ShiftLeft" / "ShiftRight").

## Returns

`Signal`\<`Record`\<`string`, `string`\>\>

Signal of record mapping normalized key names to their `event.code` values

## Example

```ts
@Component({
  template: `
    @for (key of heldKeys(); track key) {
      <kbd>{{ key }} <small>{{ heldCodes()[key] }}</small></kbd>
    }
  `,
})
export class KeyDebugComponent {
  heldKeys = injectHeldKeys()
  heldCodes = injectHeldKeyCodes()
}
```
