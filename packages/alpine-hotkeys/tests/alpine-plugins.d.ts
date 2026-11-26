// The Alpine plugins the tests use ship no types.
declare module '@alpinejs/morph' {
  const morph: import('alpinejs').PluginCallback
  export default morph
}

declare module '@alpinejs/csp' {
  const Alpine: typeof import('alpinejs').default
  export default Alpine
}
