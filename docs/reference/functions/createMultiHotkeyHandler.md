---
id: createMultiHotkeyHandler
title: createMultiHotkeyHandler
---

# Function: createMultiHotkeyHandler()

```ts
function createMultiHotkeyHandler(handlers, options): (event) => void;
```

Defined in: [match.ts:145](https://github.com/TanStack/keys/blob/main/packages/keys/src/match.ts#L145)

Creates a handler that matches multiple hotkeys.

## Parameters

### handlers

A map of hotkey strings to their handlers

#### -?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### ,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### .?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### [?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### ]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### /?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### \?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### `?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### =?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### 9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Shift+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Alt+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Shift+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Alt+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Shift+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Control+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+-?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+,?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+.?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+[?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+]?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+/?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+\?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+`?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+=?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+0?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Shift+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Alt+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Shift+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Mod+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+A?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+ArrowDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+ArrowLeft?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+ArrowRight?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+ArrowUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+B?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Backspace?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+C?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+D?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Delete?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+E?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+End?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Enter?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Escape?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F1?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F10?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F11?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F12?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F2?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F3?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F4?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F5?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F6?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F7?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F8?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+F9?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+G?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+H?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Home?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+I?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+J?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+K?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+L?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+M?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Meta+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+N?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+O?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+P?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+PageDown?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+PageUp?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Q?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+R?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+S?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Shift+Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Space?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### T?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Tab?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### U?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### V?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### W?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### X?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Y?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

#### Z?

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

### options

[`CreateHotkeyHandlerOptions`](../interfaces/CreateHotkeyHandlerOptions.md) = `{}`

Options for matching and handling

## Returns

A function that can be used as an event handler

```ts
(event): void;
```

### Parameters

#### event

`KeyboardEvent`

### Returns

`void`

## Example

```ts
const handler = createMultiHotkeyHandler({
  'Mod+S': (event, { hotkey }) => handleSave(),
  'Mod+Z': (event, { hotkey }) => handleUndo(),
  'Mod+Shift+Z': (event, { hotkey }) => handleRedo(),
})

document.addEventListener('keydown', handler)
```
