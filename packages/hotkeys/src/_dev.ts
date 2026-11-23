/**
 * Whether development warnings can print. False in a production build, and
 * where `process.env.NODE_ENV` can't be read.
 *
 * Bundlers replace `process.env.NODE_ENV` with a string and give the browser
 * no `process`, so a `typeof process` check would turn the warnings off in
 * every bundled development build. A page with no bundler has neither, so the
 * read throws there, once, when this module loads.
 *
 * Every guard also checks `process.env.NODE_ENV` inline, after this flag.
 * Rolldown and esbuild keep a warning in production builds when the check
 * comes only from a shared variable or function.
 */
export let canWarn = false
try {
  canWarn = process.env.NODE_ENV !== 'production'
} catch {
  // No `process`
}
