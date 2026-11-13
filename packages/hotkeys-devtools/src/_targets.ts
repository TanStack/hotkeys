import type { Target } from '@tanstack/hotkeys'

/**
 * Names a registration target: `'document'`, `'window'`, the result of
 * `describeElement` for an element, or `'element'` for anything else.
 */
function describeTarget(
  target: Target,
  describeElement: (element: HTMLElement) => string,
): string {
  if (typeof document !== 'undefined' && target === document) {
    return 'document'
  }
  if (typeof window !== 'undefined' && target === window) {
    return 'window'
  }
  if (target instanceof HTMLElement) {
    return describeElement(target)
  }
  return 'element'
}

function getClassNames(element: HTMLElement): Array<string> {
  return element.className.split(/\s+/).filter(Boolean)
}

/** A selector-like description, such as `button#save.primary.big`. */
export function getTargetSelector(target: Target): string {
  return describeTarget(target, (element) => {
    const tag = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = getClassNames(element)
    const cls = classes.length > 0 ? `.${classes.join('.')}` : ''
    return `${tag}${id}${cls}`
  })
}

/** A short badge label: `document`, `window`, or the element's tag name. */
export function getTargetLabel(target: Target): string {
  return describeTarget(target, (element) => element.tagName.toLowerCase())
}

/** A tooltip listing the target's tag, id, classes and `data-` attributes. */
export function getTargetTooltip(target: Target): string {
  const description = describeTarget(target, (element) => {
    const parts: Array<string> = [element.tagName.toLowerCase()]
    if (element.id) {
      parts.push(`id="${element.id}"`)
    }
    if (element.className) {
      parts.push(`class="${getClassNames(element).join(', ')}"`)
    }
    for (const attr of Array.from(element.attributes)) {
      if (attr.name.startsWith('data-')) {
        parts.push(`${attr.name}="${attr.value}"`)
      }
    }
    return parts.join(' ')
  })
  return `Listening on ${description}`
}
