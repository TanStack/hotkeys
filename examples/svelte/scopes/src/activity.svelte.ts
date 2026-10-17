import { getContext, setContext } from 'svelte'

export interface Entry {
  id: number
  scope: string
  message: string
}

export type ExclusiveOption = boolean | { allow: ReadonlyArray<string> }

class Activity {
  entries = $state<Array<Entry>>([])
  #nextId = 0

  log = (scope: string, message: string) => {
    this.entries = [
      { id: this.#nextId++, scope, message },
      ...this.entries,
    ].slice(0, 20)
  }

  clear = () => {
    this.entries = []
  }
}

const key = Symbol('activity')

export function setActivity() {
  return setContext(key, new Activity())
}

export function getActivity(): Activity {
  return getContext(key)
}
