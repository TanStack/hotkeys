---
id: HotkeyConflictOptions
title: HotkeyConflictOptions
---

Defined in: [conflicts.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L18)

## Properties

### events?

```ts
optional events?: readonly KeyboardEvent[];
```

Defined in: [conflicts.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L34)

Source events allow detecting physical/logical overlap on the recorded layout.

***

### eventType?

```ts
optional eventType?: "keyup" | "keydown";
```

Defined in: [conflicts.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L24)

Intended event type. Default: keydown.

***

### exclude?

```ts
optional exclude?: (registration) => boolean;
```

Defined in: [conflicts.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L30)

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

Defined in: [conflicts.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L28)

IDs of registrations being edited.

***

### includeDisabled?

```ts
optional includeDisabled?: boolean;
```

Defined in: [conflicts.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L26)

Include disabled registrations. Default: false.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [conflicts.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L32)

Platform used to resolve Mod in the candidate. Registrations retain their own platform.

***

### scope?

```ts
optional scope?: "all" | "overlapping";
```

Defined in: [conflicts.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L22)

Check all targets instead of overlapping targets. Default: overlapping.

***

### target?

```ts
optional target?: Document | Window | HTMLElement;
```

Defined in: [conflicts.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L20)

Intended registration target. Defaults to document; disjoint targets are excluded.
