import { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import {
  HotkeysProvider,
  useAppHotkeyList,
  useAppHotkeys,
  useHeldKeyCodes,
  useHeldKeys,
  useHotkey,
  useHotkeyRegistrations,
  useHotkeys,
  useKeyHold,
} from '@tanstack/react-hotkeys'
import { appHotkeys } from './app-hotkeys'
import { ActivityContext, Hint, formatHotkey } from './shared'
import type { CustomHotkeys } from '@tanstack/react-hotkeys'
import './styles.css'

// Created once: a new array on every render remounts the devtools panel
const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

const pages = [
  { to: '/', label: 'Tickets', hotkeyId: 'nav.tickets' },
  { to: '/editor', label: 'Editor', hotkeyId: 'nav.editor' },
  { to: '/sequences', label: 'Sequences', hotkeyId: 'nav.sequences' },
  { to: '/shortcuts', label: 'Shortcuts', hotkeyId: 'nav.shortcuts' },
  { to: '/formatting', label: 'Formatting', hotkeyId: 'nav.formatting' },
] as const

const statusLabels = {
  active: 'Active',
  disabled: 'Disabled',
  inactive: 'Not on this page',
  unbound: 'Unbound',
}

/**
 * Lists every declared hotkey, including those on routes whose code has not
 * loaded, followed by undeclared registrations on the current page.
 */
function ShortcutPanel() {
  const items = useAppHotkeyList()
  const undeclared = useHotkeyRegistrations().filter(
    (reg) => reg.options.appHotkeyId === undefined,
  )
  const groups = [...new Set(items.map((item) => item.appHotkey.meta?.group))]

  return (
    <section aria-label="Shortcuts">
      <h2>Shortcuts</h2>
      <p>
        Declared hotkeys from every route, before their route loads. Status
        shows whether the current page registers each one.
      </p>
      {groups.map((group) => (
        <div key={group}>
          <h3>{group}</h3>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Hotkey</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((item) => item.appHotkey.meta?.group === group)
                .map(({ appHotkey, status, isCustom, registrations }) => (
                  <tr key={appHotkey.id} data-status={status}>
                    <td>
                      {appHotkey.meta?.name}
                      <br />
                      <small>{appHotkey.meta?.description}</small>
                    </td>
                    <td>
                      {formatHotkey(appHotkey.hotkey)}
                      {isCustom && <small> (custom)</small>}
                    </td>
                    <td>
                      {statusLabels[status]}
                      {registrations.length > 1 &&
                        ` (${registrations.length} registrations)`}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
      {undeclared.length > 0 && (
        <>
          <h3>Undeclared on this page</h3>
          <p>
            Registered with a plain hotkey string, so they appear only while
            mounted.
          </p>
          <table>
            <tbody>
              {undeclared.map((reg) => (
                <tr key={reg.id}>
                  <td>{reg.options.meta?.name ?? reg.id}</td>
                  <td>{formatHotkey(reg.hotkey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

/** Global shortcuts remain registered while route components mount and unmount. */
function Layout() {
  const navigate = useNavigate()
  const hotkeys = useAppHotkeys()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [activity, setActivity] = useState<Array<string>>([])
  const log = useCallback((message: string) => {
    setActivity((items) => [message, ...items].slice(0, 6))
  }, [])
  const keys = useHeldKeys()
  const codes = useHeldKeyCodes()
  const shift = useKeyHold('Shift')

  useHotkeys(
    pages.map((page) => ({
      hotkey: hotkeys[page.hotkeyId],
      callback: () => {
        void navigate({ to: page.to })
      },
    })),
  )
  useHotkey(hotkeys['panel.toggle'], () => setShowShortcuts((value) => !value))

  return (
    <ActivityContext.Provider value={log}>
      <header>
        <h1>TanStack Hotkeys kitchen sink</h1>
        <p>
          Hold Alt / Option to see shortcut hints. Every hotkey is declared in{' '}
          <code>app-hotkeys.ts</code>; each route loads its code on first visit.
        </p>
        <nav aria-label="Examples">
          {pages.map((page) => (
            <Link
              key={page.to}
              to={page.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: 'active' }}
            >
              {page.label} <Hint id={page.hotkeyId} />
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setShowShortcuts((value) => !value)}
          aria-expanded={showShortcuts}
        >
          {showShortcuts ? 'Hide' : 'Show'} shortcuts <Hint id="panel.toggle" />
        </button>
      </header>
      {showShortcuts && <ShortcutPanel />}
      <main>
        <Outlet />
      </main>
      <section>
        <h2>Key state</h2>
        <p>
          Keys: {keys.join(' + ') || 'None'}
          <br />
          Codes: {Object.values(codes).join(' + ') || 'None'}
          <br />
          Shift: {shift ? 'held' : 'released'}
        </p>
        <h2>Activity</h2>
        <button onClick={() => setActivity([])}>Clear log</button>
        <ul aria-live="polite">
          {activity.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      </section>
      <TanStackDevtools plugins={devtoolsPlugins} />
    </ActivityContext.Provider>
  )
}

// Each route's component loads on first visit. Its hotkeys are declared in
// app-hotkeys.ts, so the shortcut panel lists them before that happens.
const rootRoute = createRootRoute({ component: Layout })
const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/' }).lazy(() =>
    import('./routes/tickets').then((d) => d.Route),
  ),
  createRoute({ getParentRoute: () => rootRoute, path: '/editor' }).lazy(() =>
    import('./routes/editor').then((d) => d.Route),
  ),
  createRoute({ getParentRoute: () => rootRoute, path: '/sequences' }).lazy(
    () => import('./routes/sequences').then((d) => d.Route),
  ),
  createRoute({ getParentRoute: () => rootRoute, path: '/shortcuts' }).lazy(
    () => import('./routes/shortcuts').then((d) => d.Route),
  ),
  createRoute({ getParentRoute: () => rootRoute, path: '/formatting' }).lazy(
    () => import('./routes/formatting').then((d) => d.Route),
  ),
])
const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const STORAGE_KEY = 'tanstack-hotkeys-kitchen-sink-custom-hotkeys'

function loadCustomHotkeys(): CustomHotkeys | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    return null
  }
}

/**
 * The provider owns app hotkeys and the user's custom hotkeys. The app only
 * reads saved custom hotkeys once and writes changes; swap localStorage for a
 * server without changing any route.
 */
function App() {
  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={loadCustomHotkeys()}
      onCustomHotkeysChange={(customHotkeys) =>
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customHotkeys))
      }
      defaultOptions={{ hotkey: { requireReset: true } }}
    >
      <RouterProvider router={router} />
    </HotkeysProvider>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)

// Clean up registrations when this entry module is replaced during development.
import.meta.hot?.dispose(() => root.unmount())
