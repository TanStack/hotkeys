---
id: provideHotkeys
title: provideHotkeys
---

```ts
function provideHotkeys(options?): Provider;
```

Defined in: [hotkeys-provider.ts:262](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L262)

Provides default options, app hotkeys, and the user's custom hotkeys to an
injector, such as the application or a component.

Provide it in a component to create a hotkey scope. A nested provider
inherits app hotkeys and merges default options. With `scope`, hotkeys
injected in the component and its children fire only while it exists and
is enabled; with `exclusive`, only they fire. The scope activates when the
first hotkey in it is injected. Angular creates the provider lazily, so a
component with no hotkeys of its own calls `injectHotkeysContext()` to
activate its scope.

## Parameters

### options?

[`ProvideHotkeysOptions`](../interfaces/ProvideHotkeysOptions.md) = `{}`

## Returns

`Provider`

## Examples

```ts
bootstrapApplication(App, {
  providers: [
    provideHotkeys({
      appHotkeys,
      customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
      onCustomHotkeysChange: (custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom)),
    }),
  ],
})
```

```ts
@Component({
  selector: 'app-edit-dialog',
  providers: [provideHotkeys({ scope: 'edit-dialog', exclusive: true })],
  template: `...`,
})
export class EditDialog {
  constructor() {
    injectHotkey('Escape', () => this.close())
  }
}
```

```ts
// An overlay with no hotkeys that suspends the page's hotkeys.
@Component({
  selector: 'app-loading-overlay',
  providers: [provideHotkeys({ scope: 'loading', exclusive: true })],
  template: `...`,
})
export class LoadingOverlay {
  constructor() {
    injectHotkeysContext()
  }
}
```

```ts
// A scope that follows the providing component's input.
@Component({
  selector: 'app-folder',
  providers: [
    provideHotkeys({
      scope: () => inject(Folder).name(),
      enabled: () => inject(Folder).current(),
    }),
  ],
  template: `...`,
})
export class Folder {
  readonly name = input.required<string>()
  readonly current = input(false)
}
```
