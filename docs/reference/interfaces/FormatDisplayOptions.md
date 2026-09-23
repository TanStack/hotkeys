---
id: FormatDisplayOptions
title: FormatDisplayOptions
---

Defined in: [format.ts:183](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L183)

Options for formatting hotkeys for display.

## Properties

### keyLabels?

```ts
optional keyLabels?: Readonly<Record<string, string>>;
```

Defined in: [format.ts:198](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L198)

Final display overrides for logical keys or physical codes; take precedence over layoutMap. Never changes matching.

***

### layoutMap?

```ts
optional layoutMap?: object;
```

Defined in: [format.ts:196](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L196)

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

Defined in: [format.ts:189](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L189)

Return individual key labels instead of a joined string. Default: false.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [format.ts:185](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L185)

The target platform. Defaults to auto-detection.

***

### separatorToken?

```ts
optional separatorToken?: string | null;
```

Defined in: [format.ts:200](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L200)

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

Defined in: [format.ts:187](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L187)

Whether to use symbols for the display. Defaults to true.
