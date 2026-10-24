---
id: HotkeyScopesStateController
title: HotkeyScopesStateController
---

Defined in: controllers/hotkey-scopes-state.ts:22

A Lit ReactiveController that reads the hotkey manager's scope state: the
active scopes, the exclusive scope that owns the keyboard, and the scopes it
allows or suspends. Triggers host updates when scopes activate or release.

## Example

```ts
class KeyboardOwner extends LitElement {
  private scopes = new HotkeyScopesStateController(this)

  render() {
    const { exclusive } = this.scopes.value
    return exclusive ? html`<p>Shortcuts belong to ${exclusive}</p>` : nothing
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HotkeyScopesStateController(_host): HotkeyScopesStateController;
```

Defined in: controllers/hotkey-scopes-state.ts:34

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller.

#### Returns

`HotkeyScopesStateController`

## Accessors

### value

#### Get Signature

```ts
get value(): HotkeyScopesState;
```

Defined in: controllers/hotkey-scopes-state.ts:27

The current scope state.

##### Returns

`HotkeyScopesState`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: controllers/hotkey-scopes-state.ts:39

Subscribes to the scopes store and updates the host when it changes.

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

Defined in: controllers/hotkey-scopes-state.ts:47

Unsubscribes from the scopes store.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```
