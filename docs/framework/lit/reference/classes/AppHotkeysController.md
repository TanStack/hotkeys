---
id: AppHotkeysController
title: AppHotkeysController
---

Defined in: [controllers/app-hotkeys.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L41)

A Lit ReactiveController for app hotkeys provided with `provideAppHotkeys`:
the effective app hotkeys, a cheat sheet list with live status, and the
user's custom hotkeys. Requests an update when any of them change.

## Example

```ts
class CheatSheet extends LitElement {
  private app = new AppHotkeysController(this)

  render() {
    return html`<ul>
      ${this.app.list.map(
        ({ appHotkey, status }) => html`<li>${appHotkey.meta?.name}: ${status}</li>`,
      )}
    </ul>`
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new AppHotkeysController(_host): AppHotkeysController;
```

Defined in: [controllers/app-hotkeys.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L44)

#### Parameters

##### \_host

`ReactiveControllerHost`

#### Returns

`AppHotkeysController`

## Accessors

### appHotkeys

#### Get Signature

```ts
get appHotkeys(): RegisteredAppHotkeys;
```

Defined in: [controllers/app-hotkeys.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L49)

Effective app hotkeys, typed by `Register`.

##### Returns

`RegisteredAppHotkeys`

***

### customHotkeys

#### Get Signature

```ts
get customHotkeys(): CustomHotkeys;
```

Defined in: [controllers/app-hotkeys.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L65)

The user's hotkeys that differ from the defaults.

##### Returns

`CustomHotkeys`

***

### list

#### Get Signature

```ts
get list(): AppHotkeyListItem<AppHotkey<string, HotkeyChord | HotkeySequence | null>>[];
```

Defined in: [controllers/app-hotkeys.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L54)

Every app hotkey with its live status, in declaration order.

##### Returns

`AppHotkeyListItem`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>[]

## Methods

### findConflicts()

```ts
findConflicts(id, hotkey): AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [controllers/app-hotkeys.ts:91](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L91)

Other app hotkeys that would collide if `id` used `hotkey`.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]

***

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/app-hotkeys.ts:98](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L98)

Called when the host is connected to the component tree. For custom
element hosts, this corresponds to the `connectedCallback()` lifecycle,
which is only called when the component is connected to the document.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostConnected
```

***

### hostDisconnected()

```ts
hostDisconnected(): void;
```

Defined in: [controllers/app-hotkeys.ts:108](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L108)

Called when the host is disconnected from the component tree. For custom
element hosts, this corresponds to the `disconnectedCallback()` lifecycle,
which is called the host or an ancestor component is disconnected from the
document.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```

***

### resetCustomHotkey()

```ts
resetCustomHotkey(id): void;
```

Defined in: [controllers/app-hotkeys.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L81)

Restores the default hotkey for an app hotkey.

#### Parameters

##### id

`string`

#### Returns

`void`

***

### resetCustomHotkeys()

```ts
resetCustomHotkeys(): void;
```

Defined in: [controllers/app-hotkeys.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L86)

Restores every default hotkey.

#### Returns

`void`

***

### setCustomHotkey()

```ts
setCustomHotkey(id, hotkey): AppHotkey<string, HotkeyChord | HotkeySequence | null>[];
```

Defined in: [controllers/app-hotkeys.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/app-hotkeys.ts#L73)

Sets the user's hotkey for an app hotkey. `null` unbinds it.
Returns conflicting app hotkeys; when any exist, nothing changes.

#### Parameters

##### id

`string`

##### hotkey

`Hotkey` \| `null`

#### Returns

`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>[]
