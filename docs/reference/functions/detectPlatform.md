---
id: detectPlatform
title: detectPlatform
---

```ts
function detectPlatform(userAgent?): HotkeyPlatform;
```

Defined in: [platform.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/platform.ts#L32)

Detects a platform from a user agent string, or from the browser's
`navigator` when called without one.

Used internally to resolve platform-adaptive modifiers like 'Mod' (Command on Mac,
Control elsewhere) and for platform-specific hotkey formatting. During server
rendering, pass the request's `User-Agent` header to detect the user's
platform instead of the server's.

## Parameters

### userAgent?

`string`

A user agent string, such as a request's `User-Agent` header.
When omitted, reads `navigator`.

## Returns

[`HotkeyPlatform`](../type-aliases/HotkeyPlatform.md)

The detected platform: 'mac', 'windows', or 'linux'

## Remarks

Without a user agent, returns 'linux' on a server runtime (no
`navigator`, or Node, Deno, Bun, or Cloudflare Workers), where `navigator`
describes the server.

## Example

```ts
const platform = detectPlatform() // 'mac' | 'windows' | 'linux'
const modifier = resolveModifier('Mod', platform) // 'Meta' on Mac, 'Control' elsewhere

// On the server
detectPlatform(request.headers.get('user-agent') ?? undefined)
```
