---
id: useHotkeys
title: useHotkeys
---

```ts
function useHotkeys(hotkeys, commonOptions?): void;
```

Defined in: [useHotkeys.ts:90](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeys.ts#L90)

Vue composable for registering several hotkeys at once: chords, sequences,
and app hotkeys. The list, each hotkey, and options may be refs or getters.

Options merge in this order: provider defaults, app hotkey declaration,
commonOptions, per-hotkey options. Each option applies only to the kinds
that support it. Unbound app hotkeys and empty sequences register nothing.
A target that resolves to `null` skips registration until it is set.

## Parameters

### hotkeys

`MaybeRefOrGetter`\<readonly [`UseHotkeyDefinition`](../type-aliases/UseHotkeyDefinition.md)[]\>

### commonOptions?

`MaybeRefOrGetter`\<[`UseHotkeyCommonOptions`](../type-aliases/UseHotkeyCommonOptions.md)\> = `{}`

## Returns

`void`

## Example

```ts
useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
])
```
