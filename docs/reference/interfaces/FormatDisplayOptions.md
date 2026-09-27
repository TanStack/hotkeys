---
id: FormatDisplayOptions
title: FormatDisplayOptions
---

Defined in: [format.ts:195](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L195)

Options for formatting hotkeys for display.

## Properties

### keyLabels?

```ts
optional keyLabels?: Readonly<Record<string, string>>;
```

Defined in: [format.ts:210](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L210)

Final display overrides for logical keys or physical codes; take precedence over layoutMap. Never changes matching.

***

### layoutMap?

```ts
optional layoutMap?: object;
```

Defined in: [format.ts:208](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L208)

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

Defined in: [format.ts:201](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L201)

Return individual key labels instead of a joined string. Default: false.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [format.ts:197](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L197)

The target platform. Defaults to auto-detection.

***

### separatorToken?

```ts
optional separatorToken?: string | null;
```

Defined in: [format.ts:212](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L212)

Override the separator between display tokens. Defaults to platform-specific formatting when null/undefined.

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

Defined in: [format.ts:199](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L199)

Whether to use symbols for the display. Defaults to true.
