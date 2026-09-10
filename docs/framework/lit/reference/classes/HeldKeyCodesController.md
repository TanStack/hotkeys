---
id: HeldKeyCodesController
title: HeldKeyCodesController
---

# Class: HeldKeyCodesController

Defined in: [controllers/held-key-codes.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-key-codes.ts#L27)

A Lit ReactiveController that tracks all currently held key names to their physical `event.code` values.

Subscribes to the global KeyStateTracker and triggers host updates
whenever keys are pressed or released.

## Example

```ts
class KeyDisplay extends LitElement {
  private heldKeyCodes = new HeldKeyCodesController(this)

  render() {
    const heldCodes = Object.entries(this.heldKeyCodes.value).map(([key, code]) => `${key}: ${code}`).join(' + ')
    return html`
      <div>
        Currently pressed: ${heldCodes || 'None'}
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
new HeldKeyCodesController(_host): HeldKeyCodesController;
```

Defined in: [controllers/held-key-codes.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-key-codes.ts#L41)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller.

#### Returns

`HeldKeyCodesController`

## Accessors

### value

#### Get Signature

```ts
get value(): Record<string, string>;
```

Defined in: [controllers/held-key-codes.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-key-codes.ts#L34)

Map of currently held key names to their physical `event.code` values.

##### Returns

`Record`\<`string`, `string`\>

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/held-key-codes.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-key-codes.ts#L46)

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

Defined in: [controllers/held-key-codes.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/held-key-codes.ts#L62)

Unsubscribes from the tracker store and stops tracking the held key codes.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```
