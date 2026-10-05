import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SkillDetail } from '@/components/skill-detail'
import { loadSkills } from '@/lib/skills'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return loadSkills().map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const skill = loadSkills().find((s) => s.slug === slug)
  return skill ? { title: skill.title, description: skill.summary } : {}
}

export default async function SkillPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const skill = loadSkills().find((s) => s.slug === slug)
  if (!skill) notFound()
  return <SkillDetail skill={skill} />
}
