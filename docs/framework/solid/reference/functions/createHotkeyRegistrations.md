---
id: createHotkeyRegistrations
title: createHotkeyRegistrations
---

```ts
function createHotkeyRegistrations(): () => HotkeyRegistrationView[];
```

Defined in: [createHotkeyRegistrations.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRegistrations.ts#L21)

Solid primitive that reactively reads every hotkey registration, chords and
sequences, from the singleton HotkeyManager. Narrow each view with `kind`.

This primitive does NOT require the HotkeysProvider.

## Returns

An accessor for all registrations, without callbacks

() => `HotkeyRegistrationView`[]

## Example

```tsx
const registrations = createHotkeyRegistrations()
<For each={registrations()}>
  {(reg) => <li>{reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}</li>}
</For>
```
