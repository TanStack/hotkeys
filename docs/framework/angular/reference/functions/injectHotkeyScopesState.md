---
id: injectHotkeyScopesState
title: injectHotkeyScopesState
---

```ts
function injectHotkeyScopesState(): Signal<HotkeyScopesState>;
```

Defined in: [injectHotkeyScopesState.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyScopesState.ts#L28)

Angular inject-based API that returns a signal of the hotkey manager's
scope state: the active scopes, the exclusive scope that owns the keyboard,
and the scopes it allows or suspends. Updates when scopes activate or
release.

## Returns

`Signal`\<`HotkeyScopesState`\>

Signal of the current scope state

## Example

```ts
@Component({
  template: `
    @if (scopes().exclusive; as exclusive) {
      <p>Shortcuts belong to {{ exclusive }}</p>
    }
  `,
})
export class KeyboardOwnerComponent {
  scopes = injectHotkeyScopesState()
}
```
