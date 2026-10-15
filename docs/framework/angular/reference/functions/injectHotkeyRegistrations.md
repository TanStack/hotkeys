---
id: injectHotkeyRegistrations
title: injectHotkeyRegistrations
---

```ts
function injectHotkeyRegistrations(): Signal<HotkeyRegistrationView[]>;
```

Defined in: [injectHotkeyRegistrations.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRegistrations.ts#L29)

Angular inject-based API that reactively reads every hotkey registration,
chords and sequences, from the singleton HotkeyManager. Narrow each view
with `kind`.

This does NOT require `provideHotkeys`.

## Returns

`Signal`\<`HotkeyRegistrationView`[]\>

A signal of all registrations, without callbacks

## Example

```ts
@Component({
  template: `
    @for (reg of registrations(); track reg.id) {
      <li>{{ reg.options.meta?.name }}</li>
    }
  `,
})
export class ShortcutPalette {
  registrations = injectHotkeyRegistrations()
}
```
