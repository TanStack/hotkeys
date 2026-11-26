import { useEffect, useLayoutEffect } from 'react'

/**
 * `useLayoutEffect` in the browser, so registrations and scopes stop while a
 * Suspense boundary hides content it already showed (React keeps passive
 * effects then). React 18 warns when a server render calls `useLayoutEffect`,
 * so the server gets `useEffect`, which does not run there either.
 */
export const useIsomorphicLayoutEffect: typeof useEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect
