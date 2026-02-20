# @tanstack/preact-hotkeys-devtools

> Preact devtools for [TanStack Hotkeys](https://tanstack.com/hotkeys)

## Installation

```bash
npm install @tanstack/preact-hotkeys-devtools @tanstack/preact-hotkeys
# or
bun add @tanstack/preact-hotkeys-devtools @tanstack/preact-hotkeys
# or
pnpm add @tanstack/preact-hotkeys-devtools @tanstack/preact-hotkeys
```

## Usage

```tsx
import {
  HotkeysDevtoolsPanel,
  hotkeysDevtoolsPlugin,
} from '@tanstack/preact-hotkeys-devtools'
import { useHotkey } from '@tanstack/preact-hotkeys'

function App() {
  // Register the devtools plugin
  useHotkey(
    'Mod+S',
    (event) => {
      event.preventDefault()
      console.log('Save!')
    },
    { plugins: [hotkeysDevtoolsPlugin] },
  )

  return (
    <div>
      <HotkeysDevtoolsPanel />
      {/* Your app */}
    </div>
  )
}
```

## License

MIT
