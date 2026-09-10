---
id: HotkeyRegistrationsResult
title: HotkeyRegistrationsResult
---

# Interface: HotkeyRegistrationsResult

Defined in: [createHotkeyRegistrations.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRegistrations.ts#L15)

Return type for createHotkeyRegistrations.

## Properties

### hotkeys()

```ts
hotkeys: () => HotkeyRegistrationView[];
```

Defined in: [createHotkeyRegistrations.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRegistrations.ts#L17)

Accessor for all registered hotkeys (public view, no callbacks)

#### Returns

`HotkeyRegistrationView`[]

***

### sequences()

```ts
sequences: () => SequenceRegistrationView[];
```

Defined in: [createHotkeyRegistrations.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRegistrations.ts#L19)

Accessor for all registered sequences

#### Returns

`SequenceRegistrationView`[]
