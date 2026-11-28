---
'@tanstack/hotkeys': patch
---

In React, Octane, Solid, and Svelte, an element-targeted hotkey now keeps working when its element moves to another document or shadow root, or is registered before its element is in the page. These adapters listen on the element's document, so that `onKeyDown` handlers run before the hotkey. They found that document once, at registration, so the hotkey went quiet in these cases:

- An app moves an existing element into a popup or Document Picture-in-Picture window, as a Solid `Portal` does when its `mount` changes.
- An element moves into or out of a shadow root.
- A hotkey registers while its element is in a container that isn't in the page yet. If only the container is attached later, the hotkey fired before handlers on the document, so they couldn't stop it. If the element is moved out of the container, the hotkey never fired.

The hotkey now moves its listener to the element's current document when focus enters the element, before the next key press there.
