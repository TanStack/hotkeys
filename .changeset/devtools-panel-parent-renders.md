---
'@tanstack/react-hotkeys-devtools': patch
'@tanstack/preact-hotkeys-devtools': patch
---

The devtools panel no longer remounts when the component that renders it re-renders, so it keeps its search text, selected hotkey and list width. It still remounts when `theme` or `devtoolsOpen` changes.
