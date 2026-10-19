# Task: editor shortcuts

Checks the `@tanstack/hotkeys#hotkeys-core` and `@tanstack/react-hotkeys#react-hotkeys` skills.

## Request given to the agent

> Add keyboard shortcuts to the `Editor` in `fixture.tsx` with `@tanstack/react-hotkeys`:
>
> 1. Command+S on macOS, or Control+S on Windows and Linux, calls `onSave` when `dirty` is true. The browser's Save Page dialog must never open, even when there is nothing to save.
> 2. Delete calls `onDeleteSelected`, but only while the file list has focus.
> 3. While the confirm dialog is open, Escape calls `onCancelConfirm`, and no other editor shortcut runs.
>
> Keep the exported `Editor` component and its props.

## Grading

`grade.tsx` renders the submitted `Editor` on a simulated macOS platform and presses keys. A submission passes when `gradeEditor` returns no failures. `editor-shortcuts.test.tsx` checks that the expected solution passes, that the starting fixture fails, and that each file in `mistakes/` fails for the reason the skills warn about:

| Mistake                                                                                   | Expected failure                                                       |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `keydown-listener.tsx`: a `useEffect` listener checking `metaKey \|\| ctrlKey`            | Control+S saves on macOS, and Command+S saves while the dialog is open |
| `enabled-flag.tsx`: `enabled: dirty` instead of an early return                           | The browser's Save dialog isn't blocked when nothing changed           |
| `hotkey-above-provider.tsx`: the dialog registers Escape above its own exclusive provider | Escape doesn't close the dialog                                        |
| `ref-current.tsx`: `target: listRef.current`                                              | Delete deletes while focus is outside the list                         |

To grade another attempt, point the test at it:

```sh
HOTKEYS_SKILL_SUBMISSION=/absolute/path/to/Editor.tsx pnpm vitest run tests/skills/editor-shortcuts
```

In this repository the fixtures import the adapter from `../../../src`. In a consumer project, import from `@tanstack/react-hotkeys`.
