---
id: hotkeysPlugin
title: hotkeysPlugin
---

```ts
function hotkeysPlugin(alpine): void;
```

Defined in: [hotkeysPlugin.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/hotkeysPlugin.ts#L11)

Installs $hotkeys, whose registrations and subscriptions belong to its
element. Every hotkeys scope, including ones from `createHotkeysScope`, uses
the Alpine instance passed here.

## Parameters

### alpine

`Alpine`

## Returns

`void`
