import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Don't write AGENTS.md into the example on `next dev`
  agentRules: false,
}

export default nextConfig
