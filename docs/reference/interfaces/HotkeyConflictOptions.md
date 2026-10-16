---
id: HotkeyConflictOptions
title: HotkeyConflictOptions
---

Defined in: [conflicts.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L19)

## Properties

### events?

```ts
optional events?: readonly KeyboardEvent[];
```

Defined in: [conflicts.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L35)

Source events allow detecting physical/logical overlap on the recorded layout.

***

### eventType?

```ts
optional eventType?: "keydown" | "keyup";
```

Defined in: [conflicts.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L25)

Intended event type. Default: keydown.

***

### exclude?

```ts
optional exclude?: (registration) => boolean;
```

Defined in: [conflicts.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L31)

Additional app-specific exclusions, such as all instances of one action.

#### Parameters

##### registration

[`HotkeyRegistrationView`](../type-aliases/HotkeyRegistrationView.md)

#### Returns

`boolean`

***

### excludeIds?

```ts
optional excludeIds?: readonly string[];
```

Defined in: [conflicts.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L29)

IDs of registrations being edited.

***

### includeDisabled?

```ts
optional includeDisabled?: boolean;
```

Defined in: [conflicts.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L27)

Include disabled registrations. Default: false.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [conflicts.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L33)

Platform used to resolve Mod in the candidate. Registrations retain their own platform.

***

### scope?

```ts
optional scope?: "all" | "overlapping";
```

Defined in: [conflicts.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L23)

Check all targets instead of overlapping targets. Default: overlapping.

***

### target?

```ts
optional target?: HTMLElement | Document | Window;
```

Defined in: [conflicts.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L21)

Intended registration target. Defaults to document; disjoint targets are excluded.
