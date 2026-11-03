---
id: onHotkey
title: onHotkey
---

Defined in: [packages/ember-hotkeys/src/onHotkey.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/onHotkey.ts#L15)

Attaches a hotkey (chord, sequence, or app hotkey) to the element that owns
the modifier. `undefined`, `null`, or `''` registers nothing, for an
optional shortcut.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`ElementHotkeyOptions`](../type-aliases/ElementHotkeyOptions.md);
     `Positional`: \[`RegisterableHotkey` \| `AppHotkey` \| `null` \| `undefined`, `HotkeyCallback`\];
  \};
  `Element`: `HTMLElement`;
\}\>

## Constructors

### Constructor

```ts
new onHotkey(owner, args): OnHotkey;
```

Defined in: node\_modules/.pnpm/ember-modifier@4.2.2\_@babel+core@7.29.7\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-modifier/declarations/-private/class-based/modifier.d.ts:26

#### Parameters

##### owner

`Owner`

An instance of an Owner (for service injection etc.).

##### args

`ArgsFor`\<\{
  `Args`: \{
     `Named`: [`ElementHotkeyOptions`](../type-aliases/ElementHotkeyOptions.md);
     `Positional`: \[
        \| `RegisterableHotkey`
        \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
        \| `null`
       \| `undefined`, `HotkeyCallback`\];
  \};
  `Element`: `HTMLElement`;
\}\>

The positional and named arguments passed to the modifier.

#### Returns

`OnHotkey`

#### Inherited from

```ts
Modifier<{
  Element: HTMLElement
  Args: {
    Positional: [
      RegisterableHotkey | AppHotkey | null | undefined,
      HotkeyCallback,
    ]
    Named: ElementHotkeyOptions
  }
}>.constructor
```

## Properties

### \[Invoke\]

```ts
[Invoke]: (element, ...args) => ModifierReturn;
```

Defined in: node\_modules/.pnpm/@glint+template@1.9.0/node\_modules/@glint/template/-private/integration.d.ts:22

#### Parameters

##### element

`HTMLElement`

##### args

...\[
  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| `null`
  \| `undefined`, `HotkeyCallback`, `NamedArgs`\<[`ElementHotkeyOptions`](../type-aliases/ElementHotkeyOptions.md)\>\]

#### Returns

`ModifierReturn`

#### Inherited from

```ts
Modifier.[Invoke]
```

## Methods

### modify()

```ts
modify(
   element, 
   positional, 
   options): void;
```

Defined in: [packages/ember-hotkeys/src/onHotkey.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/onHotkey.ts#L27)

Called when the modifier is installed and any time any tracked state used
in the modifier changes.

If you need to do first-time-only setup, create a class field representing
the initialization state and check it when running the hook. That is also
where and when you should use `registerDestructor` for any teardown you
need to do. For example:

```js
function disconnect(instance) {
 instance.observer?.disconnect();
}

class IntersectionObserver extends Modifier {
  observer;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, disconnect);
  }

  modify(element, callback, options) {
    disconnect(this);

    this.observer = new IntersectionObserver(callback, options);
    this.observer.observe(element);
  }
}
```

#### Parameters

##### element

`HTMLElement`

The element to which the modifier is applied.

##### positional

\[
  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| `null`
  \| `undefined`, `HotkeyCallback`\]

The positional arguments to the modifier.

##### options

[`ElementHotkeyOptions`](../type-aliases/ElementHotkeyOptions.md)

#### Returns

`void`

#### Overrides

```ts
Modifier.modify
```
