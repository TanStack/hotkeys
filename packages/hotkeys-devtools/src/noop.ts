import type { HotkeysDevtoolsPanelProps } from './types'

/**
 * The core class the default entry exports outside development. It lives in
 * its own module so that production bundles, which pick this class, do not
 * keep the real core and the Solid runtime it loads.
 */
export class HotkeysDevtoolsCoreNoOp {
  async mount(
    _el: HTMLElement,
    _props: HotkeysDevtoolsPanelProps,
  ): Promise<void> {}
  unmount(): void {}
}
