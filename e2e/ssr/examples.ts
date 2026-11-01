/**
 * The server-rendered cheat sheet examples, each served from its production
 * build on its own port. `pnpm test:e2e:ssr` at the repository root builds
 * them first.
 */
export interface SsrExample {
  /** Folder under `examples/`. */
  folder: string
  port: number
  /** Starts the production server. Gets `PORT` in its env. */
  command: string
  /** Built ahead of time: labels render only in the browser. */
  static?: boolean
}

// Astro's Node adapter (standalone) runs as a plain Node server. `astro preview`
// detaches when it isn't attached to a terminal.
const astro = 'node dist/server/entry.mjs'

export const examples: Array<SsrExample> = [
  {
    folder: 'react/useFormatForDisplay-tanstack-start',
    port: 4301,
    command: 'pnpm preview --port 4301 --strictPort',
  },
  {
    folder: 'react/useFormatForDisplay-nextjs',
    port: 4302,
    command: 'pnpm start --port 4302',
  },
  {
    folder: 'react/useFormatForDisplay-react-router',
    port: 4303,
    command: 'pnpm start',
  },
  { folder: 'react/useFormatForDisplay-astro', port: 4304, command: astro },
  { folder: 'preact/useFormatForDisplay-astro', port: 4305, command: astro },
  {
    folder: 'preact/useFormatForDisplay-vite-ssr',
    port: 4306,
    command: 'pnpm start',
  },
  { folder: 'octane/useFormatForDisplay-astro', port: 4307, command: astro },
  {
    folder: 'octane/useFormatForDisplay-server',
    port: 4308,
    command: 'pnpm start',
  },
  {
    folder: 'vue/useFormatForDisplay-nuxt',
    port: 4309,
    // What `nuxt preview` runs
    command: 'node .output/server/index.mjs',
  },
  { folder: 'vue/useFormatForDisplay-astro', port: 4310, command: astro },
  {
    folder: 'vue/useFormatForDisplay-vite-ssr',
    port: 4311,
    command: 'pnpm preview',
  },
  {
    folder: 'vue/useFormatForDisplay-vitepress',
    port: 4312,
    command: 'pnpm preview --port 4312',
    static: true,
  },
  {
    folder: 'solid/createFormatForDisplay-solid-start',
    port: 4313,
    command: 'pnpm start',
  },
  {
    folder: 'solid/createFormatForDisplay-tanstack-start',
    port: 4314,
    command: 'pnpm preview --port 4314 --strictPort',
  },
  { folder: 'solid/createFormatForDisplay-astro', port: 4315, command: astro },
  {
    folder: 'svelte/getFormatForDisplay-sveltekit',
    port: 4316,
    command: 'pnpm start',
  },
  { folder: 'svelte/getFormatForDisplay-astro', port: 4317, command: astro },
  {
    folder: 'angular/injectFormatForDisplay-angular-ssr',
    port: 4318,
    command: 'pnpm serve:ssr',
  },
  {
    folder: 'angular/injectFormatForDisplay-analog',
    port: 4319,
    command: 'pnpm preview',
  },
]

/** `localhost`, not 127.0.0.1: Angular's server only answers allowed hosts. */
export function exampleUrl(example: SsrExample): string {
  return `http://localhost:${example.port}/`
}
