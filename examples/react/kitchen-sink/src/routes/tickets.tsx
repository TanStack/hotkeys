import { useState } from 'react'
import { createLazyRoute } from '@tanstack/react-router'
import {
  HotkeysProvider,
  useAppHotkeys,
  useHotkey,
} from '@tanstack/react-hotkeys'
import { Hint, useActivity } from '../shared'

export const Route = createLazyRoute('/')({ component: TicketsRoute })

/** The route's hotkeys fire only while this provider's scope is mounted. */
function TicketsRoute() {
  return (
    <HotkeysProvider scope="tickets">
      <Tickets />
    </HotkeysProvider>
  )
}

/** Single shortcuts share handlers with buttons and respect enabled/input policies. */
function Tickets() {
  const log = useActivity()
  const appHotkeys = useAppHotkeys()
  const [count, setCount] = useState(0)
  const [archived, setArchived] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const create = () => {
    setCount((n) => n + 1)
    log('Ticket created')
  }
  const save = () => log('Pending ticket saved')
  const archive = () => {
    setArchived((n) => n + 1)
    log('Tickets archived')
  }
  // Bindings, meta, and ignoreInputs come from the declaration; enabled is local state.
  useHotkey(appHotkeys['tickets.create'], create, { enabled })
  useHotkey(appHotkeys['tickets.save'], save, { enabled })
  // Unbound by default: this registers nothing until the user assigns a binding.
  useHotkey(appHotkeys['tickets.archive'], archive, { enabled })

  return (
    <section>
      <h2>Tickets</h2>
      <p>
        Created: {count}. Archived: {archived}. Hold Alt / Option for hints.
        Release and press again to create another ticket.
      </p>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />{' '}
        Enable ticket actions
      </label>
      <p>
        <button disabled={!enabled} onClick={create}>
          Create ticket <Hint id="tickets.create" />
        </button>
        <button disabled={!enabled} onClick={save}>
          Save pending <Hint id="tickets.save" />
        </button>
        <button disabled={!enabled} onClick={archive}>
          Archive <Hint id="tickets.archive" />
        </button>
      </p>
      <label>
        Ticket note{' '}
        <input placeholder="Try Alt + the physical C key while typing" />
      </label>
      <p>
        Create declares <code>ignoreInputs: false</code>; Save uses the default
        input filtering. The provider supplies <code>requireReset: true</code>.
        Archive has no default binding; assign one on the Shortcuts route.
      </p>
    </section>
  )
}
