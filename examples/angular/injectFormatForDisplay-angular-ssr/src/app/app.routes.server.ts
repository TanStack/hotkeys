import { RenderMode } from '@angular/ssr'
import type { ServerRoute } from '@angular/ssr'

// Render on every request, so labels use each user's platform. A prerendered
// page has no request to read the platform from.
export const serverRoutes: Array<ServerRoute> = [
  { path: '**', renderMode: RenderMode.Server },
]
