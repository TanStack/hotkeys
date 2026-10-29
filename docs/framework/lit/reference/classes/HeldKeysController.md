---
id: HeldKeysController
title: HeldKeysController
---

Defined in: [controllers/held-keys.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-keys.ts#L27)

A Lit ReactiveController that tracks all currently held keyboard keys.

Subscribes to the global KeyStateTracker and triggers host updates
whenever keys are pressed or released.

## Example

```ts
class KeyDisplay extends LitElement {
  private heldKeys = new HeldKeysController(this)

  render() {
    return html`
      <div>
        Currently pressed: ${this.heldKeys.value.join(' + ') || 'None'}
      </div>
    `
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HeldKeysController(_host): HeldKeysController;
```

Defined in: [controllers/held-keys.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-keys.ts#L41)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller.

#### Returns

`HeldKeysController`

## Accessors

### value

#### Get Signature

```ts
get value(): string[];
```

Defined in: [controllers/held-keys.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-keys.ts#L34)

Array of currently held key names.

##### Returns

`string`[]

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/held-keys.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-keys.ts#L46)

Subscribes to the tracker store and updates the internal state when changes occur.

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

Defined in: [controllers/held-keys.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-keys.ts#L61)

Unsubscribes from the tracker store and stops tracking the held keys.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```
