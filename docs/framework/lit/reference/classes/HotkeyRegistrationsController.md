---
id: HotkeyRegistrationsController
title: HotkeyRegistrationsController
---

Defined in: [controllers/hotkey-registrations.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L26)

A Lit ReactiveController that reads every hotkey registration, chords and
sequences, from the singleton HotkeyManager and requests an update when
they change. Narrow each view with `kind`.

## Example

```ts
class ShortcutPalette extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    return html`<ul>
      ${this.registrations.hotkeys.map(
        (reg) => html`<li>${reg.options.meta?.name}: ${formatForDisplay(reg.hotkey)}</li>`,
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
new HotkeyRegistrationsController(_host): HotkeyRegistrationsController;
```

Defined in: [controllers/hotkey-registrations.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L35)

#### Parameters

##### \_host

`ReactiveControllerHost`

#### Returns

`HotkeyRegistrationsController`

## Accessors

### hotkeys

#### Get Signature

```ts
get hotkeys(): HotkeyRegistrationView[];
```

Defined in: [controllers/hotkey-registrations.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L31)

Every registration, chords and sequences (public view, no callbacks).

##### Returns

`HotkeyRegistrationView`[]

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-registrations.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L39)

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

Defined in: [controllers/hotkey-registrations.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L54)

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
