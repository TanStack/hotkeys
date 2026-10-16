const { existsSync } = require('node:fs')
const { execSync } = require('node:child_process')

/** Whether Chrome is installed where testem's Chrome launcher looks. */
function hasChrome() {
  if (process.platform === 'darwin') {
    return existsSync('/Applications/Google Chrome.app')
  }
  if (process.platform === 'win32') return true
  try {
    execSync(
      'command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser',
      { stdio: 'ignore' },
    )
    return true
  } catch {
    return false
  }
}

// Without Chrome, fall back to Edge, another Chromium browser testem can launch.
const browser =
  process.env.TESTEM_BROWSER || (hasChrome() ? 'Chrome' : 'Headless Edge')

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  cwd: 'dist-tests',
  disable_watching: true,
  browser_start_timeout: 120,
  launch_in_ci: [browser],
  browser_args: {
    Chrome: {
      ci: ['--headless=new', '--disable-dev-shm-usage', '--no-sandbox'],
    },
  },
}
