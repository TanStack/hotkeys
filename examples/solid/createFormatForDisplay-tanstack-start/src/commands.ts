import type { Hotkey } from '@tanstack/solid-hotkeys'

export interface Command {
  id: string
  name: string
  hotkey: Hotkey
  /** Logged to the activity log when the hotkey fires. */
  message: string
}

/** Used both to register the hotkeys and to render the cheat sheet. */
export const commands: ReadonlyArray<Command> = [
  { id: 'save', name: 'Save', hotkey: 'Mod+S', message: 'Saved' },
  { id: 'search', name: 'Search', hotkey: 'Mod+K', message: 'Search opened' },
  {
    id: 'palette',
    name: 'Command palette',
    hotkey: 'Mod+Shift+P',
    message: 'Command palette opened',
  },
  { id: 'submit', name: 'Submit', hotkey: 'Mod+Enter', message: 'Submitted' },
  {
    id: 'move-up',
    name: 'Move line up',
    hotkey: 'Alt+ArrowUp',
    message: 'Moved line up',
  },
  // A key position: follows the key where Q sits on a US keyboard
  {
    id: 'quick',
    name: 'Quick action',
    hotkey: 'Alt+[KeyQ]',
    message: 'Quick action',
  },
  // A sequence: press G, then I
  {
    id: 'inbox',
    name: 'Go to inbox',
    hotkey: ['G', 'I'],
    message: 'Went to inbox',
  },
  { id: 'close', name: 'Close', hotkey: 'Escape', message: 'Closed' },
]
