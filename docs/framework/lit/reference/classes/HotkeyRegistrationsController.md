---
id: HotkeyRegistrationsController
title: HotkeyRegistrationsController
---

# Class: HotkeyRegistrationsController

Defined in: [controllers/hotkey-registrations.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L35)

A Lit ReactiveController that tracks all hotkey and sequence registrations.

Subscribes to the singleton HotkeyManager and SequenceManager stores and
triggers host updates whenever registrations change.

## Example

```ts
class ShortcutPalette extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    return html`
      <ul>
        ${this.registrations.hotkeys.map(
          (reg) => html`<li>${reg.options.meta?.name ?? reg.hotkey}</li>`,
        )}
      </ul>
    `
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

Defined in: [controllers/hotkey-registrations.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L51)

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

Defined in: [controllers/hotkey-registrations.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L42)

All registered hotkeys (public view, no callbacks).

##### Returns

`HotkeyRegistrationView`[]

***

### sequences

#### Get Signature

```ts
get sequences(): SequenceRegistrationView[];
```

Defined in: [controllers/hotkey-registrations.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L47)

All registered sequences.

##### Returns

`SequenceRegistrationView`[]

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-registrations.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L55)

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

Defined in: [controllers/hotkey-registrations.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-registrations.ts#L81)

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
