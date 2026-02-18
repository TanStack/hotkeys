# @tanstack/solid-hotkeys-devtools

> SolidJS devtools for [TanStack Hotkeys](https://tanstack.com/hotkeys)

## Installation

```bash
npm install @tanstack/solid-hotkeys-devtools @tanstack/solid-hotkeys
# or
bun add @tanstack/solid-hotkeys-devtools @tanstack/solid-hotkeys
# or
pnpm add @tanstack/solid-hotkeys-devtools @tanstack/solid-hotkeys
```

## Usage

```tsx
import {
  HotkeysDevtoolsPanel,
  hotkeysDevtoolsPlugin,
} from '@tanstack/solid-hotkeys-devtools'
import { createHotkey } from '@tanstack/solid-hotkeys'

function App() {
  // Register the devtools plugin
  createHotkey(
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
