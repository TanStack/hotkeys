interface Config {
  environment: 'development' | 'production'
  locationType: 'history' | 'hash' | 'none' | 'auto'
  rootURL: string
  EmberENV?: Record<string, unknown>
  APP: Record<string, unknown> & { rootElement?: string; autoboot?: boolean }
}

// The specs serve the app from a subfolder, so the router doesn't read the URL
const ENV: Config = {
  environment: import.meta.env.DEV ? 'development' : 'production',
  rootURL: '/',
  locationType: 'none',
  EmberENV: {},
  APP: {},
}

export default ENV
