import { defineAppHotkeys } from '@tanstack/react-hotkeys'

/**
 * Every hotkey in the app, declared up front. This module holds no components
 * or handlers, so it loads with the shell while route code stays lazy. The
 * shortcut panel and the Shortcuts route list these whether or not their
 * route has loaded.
 *
 * Route hotkeys set `scope` to their route, and each route renders a
 * `HotkeysProvider` with that scope, so routes may reuse a hotkey. Global
 * hotkeys omit it and conflict with any app hotkey that reuses theirs.
 * Sequences are hotkeys too: pass an array.
 */
export const appHotkeys = defineAppHotkeys({
  'nav.tickets': {
    hotkey: 'Alt+[Digit1]',
    meta: { name: 'Open Tickets', group: 'Navigation' },
    options: { ignoreInputs: true },
  },
  'nav.editor': {
    hotkey: 'Alt+[Digit2]',
    meta: { name: 'Open Editor', group: 'Navigation' },
    options: { ignoreInputs: true },
  },
  'nav.sequences': {
    hotkey: 'Alt+[Digit3]',
    meta: { name: 'Open Sequences', group: 'Navigation' },
    options: { ignoreInputs: true },
  },
  'nav.shortcuts': {
    hotkey: 'Alt+[Digit4]',
    meta: { name: 'Open Shortcuts', group: 'Navigation' },
    options: { ignoreInputs: true },
  },
  'nav.formatting': {
    hotkey: 'Alt+[Digit5]',
    meta: { name: 'Open Formatting', group: 'Navigation' },
    options: { ignoreInputs: true },
  },
  'nav.scopes': {
    hotkey: 'Alt+[Digit6]',
    meta: { name: 'Open Scopes', group: 'Navigation' },
    options: { ignoreInputs: true },
  },
  'modal.close': {
    hotkey: 'Escape',
    meta: {
      name: 'Close dialog',
      description: "Registered by each open dialog, in that dialog's scope",
      group: 'Navigation',
    },
  },
  'panel.toggle': {
    hotkey: 'Alt+Shift+[KeyK]',
    meta: { name: 'Show shortcuts', group: 'Navigation' },
  },

  'tickets.create': {
    hotkey: 'Alt+[KeyC]',
    scope: 'tickets',
    meta: {
      name: 'Create ticket',
      description: 'Also works while entering a ticket note',
      group: 'Tickets',
    },
    options: { ignoreInputs: false },
  },
  'tickets.save': {
    hotkey: 'Alt+[KeyS]',
    scope: 'tickets',
    meta: { name: 'Save pending ticket', group: 'Tickets' },
  },
  'tickets.archive': {
    hotkey: null,
    scope: 'tickets',
    meta: {
      name: 'Archive tickets',
      description: 'No default binding. Assign one on the Shortcuts route.',
      group: 'Tickets',
    },
  },

  'editor.save': {
    hotkey: 'Mod+[KeyS]',
    scope: 'editor',
    meta: {
      name: 'Save editor',
      description: 'Registered once per editor, on its own target',
      group: 'Editor',
    },
    options: { ignoreInputs: false },
  },
  'editor.clear': {
    hotkey: 'Alt+[Backspace]',
    scope: 'editor',
    meta: { name: 'Clear editor', group: 'Editor' },
    options: { ignoreInputs: false },
  },
  'editor.advance': {
    hotkey: 'Alt+[ArrowRight]',
    scope: 'editor',
    meta: { name: 'Advance counter', group: 'Editor' },
  },
  'editor.release': {
    hotkey: 'Alt+[KeyU]',
    scope: 'editor',
    meta: { name: 'Run on release', group: 'Editor' },
    options: { eventType: 'keyup' },
  },

  'scopes.save': {
    hotkey: 'Mod+[KeyS]',
    scope: 'scopes',
    meta: {
      name: 'Save document',
      description:
        'Same hotkey as Save editor and Save details, in another scope',
      group: 'Scopes',
    },
    options: { ignoreInputs: false },
  },
  'scopes.edit': {
    hotkey: 'Alt+[KeyE]',
    scope: 'scopes',
    meta: { name: 'Edit details', group: 'Scopes' },
  },
  'workspace.add': {
    hotkey: 'Alt+[KeyN]',
    meta: {
      name: 'Add item',
      description: 'No declared scope: each workspace provider supplies one',
      group: 'Scopes',
    },
  },
  'details.save': {
    hotkey: 'Mod+[KeyS]',
    scope: 'details-dialog',
    meta: { name: 'Save details', group: 'Details dialog' },
    options: { ignoreInputs: false },
  },

  'sequences.top': {
    hotkey: ['[KeyG]', '[KeyG]'],
    scope: 'sequences',
    meta: { name: 'Go to top', group: 'Sequences' },
  },
  'sequences.inbox': {
    hotkey: ['[KeyG]', '[KeyI]'],
    scope: 'sequences',
    meta: { name: 'Open inbox', group: 'Sequences' },
  },
  'sequences.chain': {
    hotkey: ['Shift+[KeyR]', 'Shift+[KeyT]'],
    scope: 'sequences',
    meta: { name: 'Shifted chain', group: 'Sequences' },
  },
})

declare module '@tanstack/react-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
