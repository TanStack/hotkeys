---
id: WithTarget
title: WithTarget
---

```ts
type WithTarget<TOptions, TTarget> = Omit<TOptions, "target" | "appHotkeyId"> & object;
```

Defined in: [adapter.ts:188](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L188)

Options with a framework-specific target, such as a ref.

## Type Declaration

### target?

```ts
optional target?: TTarget;
```

The element to listen on. Defaults to document.

## Type Parameters

### TOptions

`TOptions`

### TTarget

`TTarget`
