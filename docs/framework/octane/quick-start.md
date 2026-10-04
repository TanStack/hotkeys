---
title: Quick Start
id: quick-start
---

Install `@tanstack/octane-hotkeys` with the [installation instructions](../../installation). This guide builds a save shortcut and shows the component lifecycle used by the other APIs.

## Your first hotkey

Put this code in a `.tsrx` file compiled with the Octane toolchain. Add `<div id="root"></div>` to the host HTML.

```tsx
import { createRoot, delegateEvents, useState } from 'octane'
import { useHotkey, formatForDisplay } from '@tanstack/octane-hotkeys'

delegateEvents(['click'])

function Editor() @{
	const [count, setCount] = useState(0)
	const [enabled, setEnabled] = useState(true)
	useHotkey('Mod+S', () => setCount((value) => value + 1), { enabled })

	<div>
		<button type="button" onClick={() => setEnabled(!enabled)}>Toggle shortcut</button>
		<p>Press <kbd>{formatForDisplay('Mod+S')}</kbd>. Saved {count} times.</p>
	</div>
}

const root = createRoot(document.getElementById('root')!)
root.render(Editor)
```

Press Command+S on macOS or Control+S on Windows and Linux. The count increases and the browser save dialog is prevented. The toggle disables execution while preserving the registration.

`Mod` resolves to the primary platform modifier. Use `Mod+[KeyS]` instead when the shortcut must follow the physical S position.

## Registration and cleanup

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler supplies hook identity, so call hooks at stable component call sites. Use the plural hooks for lists that change length. Do not supply the compiler's internal slot argument yourself.

Registration callbacks and options refresh after each commit. Registrations and recorder subscriptions are released when the component unmounts. Element targets are DOM nodes, not React ref objects. Use a callback ref that updates component state so the hook sees a newly mounted or replaced element.

## Common patterns

### Multiple hotkeys


```tsx
useHotkey('Mod+S', () => console.log('Save'))
useHotkey('Mod+Z', () => console.log('Undo'))
useHotkey('Mod+Shift+Z', () => console.log('Redo'))
```

Each registration is independent. For a dynamic list, use `useHotkeys` as shown in the [hotkeys guide](./guides/hotkeys.md#registering-multiple-hotkeys).

### Scoped hotkeys

Pass an actual element as `target`. A `null` target defers registration until the element exists. Make the element focusable with `tabindex="0"`. See the [complete scoped example](./guides/hotkeys.md#target).

### Conditional hotkeys


```tsx
useHotkey('Mod+S', () => console.log("Save"), { enabled })
```

Use Octane component state for the enabled flag.

### Multi-key sequences


```tsx
useHotkeySequence(['G', 'G'], () => window.scrollTo({ top: 0 }))
```

Release G between presses. Automatic key repeats do not advance sequences.

### Tracking held keys and displaying hints


```tsx
import { useHeldKeys, useHeldKeyCodes, useKeyHold, useHotkeyHint } from '@tanstack/octane-hotkeys'

export function KeyStatus() @{
	const held = useHeldKeys()
	const codes = useHeldKeyCodes()
	const shift = useKeyHold('Shift')
	const hint = useHotkeyHint('Mod+S')

	<div>
		<p>{held.join(' + ') || 'No keys held'}</p>
		@for (const key of held) {
			<p>{key}: {codes[key]}</p>
		}
		@if (shift) { <button type="button">Delete permanently</button> }
		@if (hint) { <kbd>Save</kbd> }
	</div>
}
```

Use `formatForDisplay(binding)` for platform-specific labels. Keep the original binding in state; a display label is not a registration string.

## Default options provider

Place the provider above components that call hotkey hooks.

```tsx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'

export function Root() @{
	<div>
		<HotkeysProvider defaultOptions={{
			hotkey: { preventDefault: true },
			hotkeySequence: { timeout: 1500 },
			hotkeyRecorder: { onCancel: () => console.log('Cancelled') },
			hotkeySequenceRecorder: { idleTimeoutMs: 2000 },
		}}>
			<Editor />
		</HotkeysProvider>
	</div>
}
```

`useDefaultHotkeysOptions()` reads the nearest provider's defaults and returns an empty object outside a provider. `useHotkeysContext()` returns `{ defaultOptions }`, or `null` outside a provider. Nested providers replace the outer defaults; call-specific options and per-definition options still take precedence.

## Examples and next steps

- [Hotkeys](./guides/hotkeys)
- [Sequences](./guides/sequences)
- [Hotkey recording](./guides/hotkey-recording)
- [Sequence recording](./guides/sequence-recording)
- [Key state tracking](./guides/key-state-tracking)
- [Formatting and display](./guides/formatting-display)
- [Kitchen sink](./examples/kitchen-sink)
- [API reference](./reference/index)
