/** The devtools color theme. */
export type HotkeysDevtoolsTheme = 'light' | 'dark'

/**
 * Props a devtools host passes to the Hotkeys panel.
 *
 * These match `TanStackDevtoolsPluginProps` from `@tanstack/devtools`. They
 * are declared here because the `@tanstack/devtools-utils` types import
 * `@tanstack/devtools` without depending on it, so published types that use
 * them fail to resolve.
 */
export interface HotkeysDevtoolsPanelProps {
  theme: HotkeysDevtoolsTheme
  devtoolsOpen: boolean
}

/** The class each framework panel creates and mounts the devtools with. */
export type HotkeysDevtoolsCoreClass = new () => {
  mount: (el: HTMLElement, props: HotkeysDevtoolsPanelProps) => Promise<void>
  unmount: () => void
}
