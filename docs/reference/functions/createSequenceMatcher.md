---
id: createSequenceMatcher
title: createSequenceMatcher
---

# Function: createSequenceMatcher()

```ts
function createSequenceMatcher(sequence, options): object;
```

Defined in: [sequence.ts:332](https://github.com/TanStack/keys/blob/main/packages/keys/src/sequence.ts#L332)

Creates a simple sequence matcher for one-off use.

## Parameters

### sequence

[`HotkeySequence`](../type-aliases/HotkeySequence.md)

The sequence of hotkeys to match

### options

Options including timeout

#### platform?

`"mac"` \| `"windows"` \| `"linux"`

#### timeout?

`number`

## Returns

`object`

An object with match() and reset() methods

### getProgress()

```ts
getProgress: () => number;
```

#### Returns

`number`

### match()

```ts
match: (event) => boolean;
```

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`boolean`

### reset()

```ts
reset: () => void;
```

#### Returns

`void`

## Example

```ts
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 500 })

document.addEventListener('keydown', (event) => {
  if (matcher.match(event)) {
    console.log('Sequence matched!')
  }
})
```
