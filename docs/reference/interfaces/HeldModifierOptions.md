---
id: HeldModifierOptions
title: HeldModifierOptions
---

Defined in: [hint.ts:6](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hint.ts#L6)

## Properties

### exact?

```ts
optional exact: boolean;
```

Defined in: [hint.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hint.ts#L10)

Require every binding modifier to be held. Default: false (nonempty subset).

***

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [hint.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hint.ts#L8)

Resolve Mod for this platform. Defaults to platform detection.
