# Task: shortcut settings

Checks the `@tanstack/hotkeys#app-hotkeys` skill with `@tanstack/react-hotkeys#react-hotkeys`.

## Request given to the agent

> The app in `fixture.tsx` has a Save shortcut (Command+S on macOS, Control+S elsewhere) on the editor page and a Print report shortcut (Command+P or Control+P) on the reports page. Using `@tanstack/react-hotkeys`:
>
> 1. `CheatSheet` lists every shortcut with its name and current label, including Print report while the reports page isn't open.
> 2. `ShortcutRow` has a button that records a new shortcut for its action when clicked, and the new shortcut works immediately.
> 3. Changed shortcuts are saved to `localStorage` under `hotkeys`, saving only what the user changed, and restored each time `Root` mounts.
>
> Keep the exported components and their props.

## Grading

`grade.tsx` renders the submission on a simulated macOS platform. A submission passes when `gradeSettings` returns no failures. `shortcut-settings.test.tsx` checks the expected solution, the starting fixture, and these mistakes:

| Mistake                                                                           | Expected failure                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `registrations-cheat-sheet.tsx`: the cheat sheet lists `useHotkeyRegistrations()` | Print report is missing while the reports page isn't open |
| `hotkey-value.tsx`: registers `appHotkeys['doc.save'].hotkey`                     | The new shortcut doesn't save                             |
| `full-list-storage.tsx`: saves every effective hotkey                             | Saved data holds unchanged shortcuts                      |

Conflicts aren't graded: conflict checks don't yet compare a recorded physical binding, such as `Mod+[KeyP]`, with a declared logical one, such as `Mod+P`.

The expected solution skips the `Register` augmentation, because a module augmentation here would change app hotkey types for the package's other tests.

To grade another attempt:

```sh
HOTKEYS_SKILL_SUBMISSION=/absolute/path/to/settings.tsx pnpm vitest run tests/skills/shortcut-settings
```
