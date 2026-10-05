import type { NextConfig } from 'next'

// Skills pages are named page.skills.tsx. They are only treated as routes when the skills library is on,
// so with it off no skills route, page or link exists in the build.
const showSkills = process.env.NEXT_PUBLIC_SHOW_SKILLS === 'true'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined

const nextConfig: NextConfig = {
  // A fully static site for GitHub Pages: no server, database or auth.
  output: 'export',
  pageExtensions: showSkills ? ['tsx', 'ts', 'skills.tsx'] : ['tsx', 'ts'],
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
