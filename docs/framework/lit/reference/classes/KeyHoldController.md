---
id: KeyHoldController
title: KeyHoldController
---

# Class: KeyHoldController

Defined in: [controllers/key-hold.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/key-hold.ts#L43)

A Lit ReactiveController that tracks whether a specific key is currently held.

Subscribes to the global KeyStateTracker and triggers host updates
when the held state of the specified key changes.

## Examples

```ts
class MyElement extends LitElement {
  private shiftHold = new KeyHoldController(this, 'Shift')

  render() {
    return html`
      <div style="opacity: ${this.shiftHold.value ? 1 : 0.5}">
        ${this.shiftHold.value ? 'Shift is pressed!' : 'Press Shift'}
      </div>
    `
  }
}
```

```ts
class ModifierIndicators extends LitElement {
  private ctrl = new KeyHoldController(this, 'Control')
  private shift = new KeyHoldController(this, 'Shift')
  private alt = new KeyHoldController(this, 'Alt')

  render() {
    return html`
      <span style="opacity: ${this.ctrl.value ? 1 : 0.3}">Ctrl</span>
      <span style="opacity: ${this.shift.value ? 1 : 0.3}">Shift</span>
      <span style="opacity: ${this.alt.value ? 1 : 0.3}">Alt</span>
    `
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new KeyHoldController(_host, _key): KeyHoldController;
```

Defined in: [controllers/key-hold.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/key-hold.ts#L58)

#### Parameters

##### \_host

`ReactiveControllerHost`

##### \_key

`IndividualKey`

#### Returns

`KeyHoldController`

## Accessors

### value

#### Get Signature

```ts
get value(): boolean;
```

Defined in: [controllers/key-hold.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/key-hold.ts#L50)

Whether the tracked key is currently held down.

##### Returns

`boolean`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/key-hold.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/key-hold.ts#L65)

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

Defined in: [controllers/key-hold.ts:83](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/key-hold.ts#L83)

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
