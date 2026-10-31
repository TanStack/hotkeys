---
id: hotkeyRecorderPlugin
title: hotkeyRecorderPlugin
---

```ts
function hotkeyRecorderPlugin(alpine): void;
```

Defined in: [hotkeyRecorderPlugin.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/hotkeyRecorderPlugin.ts#L11)

Installs $hotkeyRecorder, a function that creates recorders owned by its
element. It is separate from `hotkeysPlugin`, so apps that don't record
hotkeys don't ship the recorder.

## Parameters

### alpine

`Alpine`

## Returns

`void`
