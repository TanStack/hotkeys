---
id: MAC_MODIFIER_LABELS
title: MAC_MODIFIER_LABELS
---

# Variable: MAC\_MODIFIER\_LABELS

```ts
const MAC_MODIFIER_LABELS: Record<CanonicalModifier | "Mod", string>;
```

Defined in: [constants.ts:522](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L522)

Modifier key labels for macOS display.

Used by formatting functions to display hotkeys with macOS-style text labels
(e.g., 'Control' for Control, 'Option' for Alt, 'Cmd' for Meta) instead of symbols.
This provides a familiar macOS look and feel in hotkey displays.

## Example

```ts
MAC_MODIFIER_LABELS['Control'] // 'control'
MAC_MODIFIER_LABELS['Alt'] // 'option'
MAC_MODIFIER_LABELS['Shift'] // 'shift'
MAC_MODIFIER_LABELS['Meta'] // 'cmd'
```
