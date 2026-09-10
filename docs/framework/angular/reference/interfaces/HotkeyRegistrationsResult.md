---
id: HotkeyRegistrationsResult
title: HotkeyRegistrationsResult
---

# Interface: HotkeyRegistrationsResult

Defined in: [injectHotkeyRegistrations.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRegistrations.ts#L16)

Return type for injectHotkeyRegistrations.

## Properties

### hotkeys

```ts
hotkeys: Signal<HotkeyRegistrationView[]>;
```

Defined in: [injectHotkeyRegistrations.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRegistrations.ts#L18)

Signal for all registered hotkeys (public view, no callbacks)

***

### sequences

```ts
sequences: Signal<SequenceRegistrationView[]>;
```

Defined in: [injectHotkeyRegistrations.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRegistrations.ts#L20)

Signal for all registered sequences
