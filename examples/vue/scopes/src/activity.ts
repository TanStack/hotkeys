import { inject, provide, ref } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface Entry {
  id: number
  scope: string
  message: string
}

interface Activity {
  entries: Ref<Array<Entry>>
  log: (scope: string, message: string) => void
  clear: () => void
}

const ActivityKey: InjectionKey<Activity> = Symbol('Activity')
let nextEntryId = 0

export function provideActivity() {
  const entries = ref<Array<Entry>>([])
  provide(ActivityKey, {
    entries,
    log: (scope, message) => {
      entries.value = [
        { id: nextEntryId++, scope, message },
        ...entries.value,
      ].slice(0, 20)
    },
    clear: () => {
      entries.value = []
    },
  })
}

export function useActivity(): Activity {
  const activity = inject(ActivityKey)
  if (!activity) throw new Error('Missing provideActivity')
  return activity
}

export type ExclusiveOption = boolean | { allow: ReadonlyArray<string> }
