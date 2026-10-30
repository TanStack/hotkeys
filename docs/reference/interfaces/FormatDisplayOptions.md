---
id: FormatDisplayOptions
title: FormatDisplayOptions
---

Defined in: [format.ts:247](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L247)

Options for formatting hotkeys for display.

## Properties

### keyLabels?

```ts
optional keyLabels?: Readonly<Record<string, string>>;
```

Defined in: [format.ts:262](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L262)

Final display overrides for logical keys or physical codes; take precedence over layoutMap. Never changes matching.

***

### layoutMap?

```ts
optional layoutMap?: object;
```

Defined in: [format.ts:260](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L260)

An already-resolved code-to-key map, such as KeyboardLayoutMap or Map.
Used only for physical bindings. Mapped keys receive normal display formatting;
missing or empty entries use conventional fallback labels. The caller owns
loading and refreshing the map; this formatter never calls browser APIs.

#### get

```ts
get: (code) => string | undefined;
```

##### Parameters

###### code

`string`

##### Returns

`string` \| `undefined`

***

### parts?

```ts
optional parts?: boolean;
```

Defined in: [format.ts:253](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L253)

Return individual key labels instead of a joined string. Default: false.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [format.ts:249](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L249)

The target platform. Defaults to auto-detection.

***

### separatorToken?

```ts
optional separatorToken?: string | null;
```

Defined in: [format.ts:264](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L264)

Override the separator between display tokens. Defaults to platform-specific formatting when null/undefined.

***

### sequenceSeparator?

```ts
optional sequenceSeparator?: string;
```

Defined in: [format.ts:266](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L266)

Separator between sequence steps. Default: a space.

***

### useSymbols?

```ts
optional useSymbols?: 
  | boolean
  | {
  keys?: boolean;
  modifiers?: boolean;
};
```

Defined in: [format.ts:251](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L251)

Whether to use symbols for the display. Defaults to true.
