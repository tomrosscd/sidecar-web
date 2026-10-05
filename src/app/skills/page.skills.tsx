import type { Metadata } from 'next'
import { SkillLibrary } from '@/components/skill-library'
import { loadSkills } from '@/lib/skills'

export const metadata: Metadata = { title: 'Skills' }

export default function SkillsPage() {
  const skills = loadSkills().map((s) => ({ ...s, content: undefined }))
  return <SkillLibrary skills={skills} />
}
