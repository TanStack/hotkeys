# Scopes

- A scope is a name, not an instance. Two mounted providers with the same scope share it, and it stays active until both are gone.
- Hotkeys outside every scoped provider are in `'global'`, which is always active unless an exclusive scope suspends it.
- When hotkeys in two active scopes match the same key, a nested scope beats the scopes around it; otherwise the most recently activated scope wins. Only the winning scope's hotkeys run.
- The same hotkey in two scopes is not a duplicate, so there's no conflict warning.
- An `exclusive` scope suspends every other scope except scopes nested in it and those in `exclusive: { allow: ['global'] }`. With several exclusive scopes active, the one with the highest precedence owns the keyboard, so a dialog opened from a dialog suspends the first until it closes.
- A provider with `enabled: false` turns off its scope and every scope nested in it while staying mounted, for tabs and panes that stay rendered.
- A hotkey's `scope` option, or an app hotkey's declared `scope`, overrides the provider's.
- Scopes follow the component tree, not the DOM, so a portaled dialog keeps its scope.
- The hotkey that opens an exclusive dialog is suspended with the rest of the page. To close the dialog with the same keys, register that hotkey inside the dialog too.
- To show which scope owns the keyboard, use the adapter's scope state API, such as `useHotkeyScopesState()` in React. Don't subscribe to `manager.scopes` by hand.
- To list only hotkeys that can fire, filter the adapter's registrations by `status === 'active'`. `'suspended'` means the hotkey's scope is inactive or suspended, and `'disabled'` means `enabled: false`.
