---
id: HotkeyDecorator
title: HotkeyDecorator
---

```ts
type HotkeyDecorator<TContext> = {
<T>  (proto, name, descriptor?): void;
<THost, T>  (method, context): void;
};
```

Defined in: [decorators/hotkey.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/decorators/hotkey.ts#L21)

A method decorator for legacy (`experimentalDecorators`) and standard
decorators. The method's context parameter can be typed as the context for
the decorated hotkey's kind, such as `HotkeyChordCallbackContext`.

## Type Parameters

### TContext

`TContext` *extends* `HotkeyCallbackContext` = `HotkeyCallbackContext`

## Call Signature

```ts
<T>(
   proto, 
   name, 
   descriptor?): void;
```

### Type Parameters

#### T

`T` *extends* `HotkeyCallback`\<`TContext`\>

### Parameters

#### proto

`ReactiveElement`

#### name

`string` \| `symbol`

#### descriptor?

`TypedPropertyDescriptor`\<`T`\>

### Returns

`void`

## Call Signature

```ts
<THost, T>(method, context): void;
```

### Type Parameters

#### THost

`THost` *extends* `ReactiveElement`

#### T

`T` *extends* `HotkeyCallback`\<`TContext`\>

### Parameters

#### method

`T`

#### context

`ClassMethodDecoratorContext`\<`THost`, `T`\>

### Returns

`void`
