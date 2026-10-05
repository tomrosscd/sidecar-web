import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PromptDetail } from '@/components/prompt-detail'
import { loadPrompts } from '@/lib/prompts'

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const { prompts } = await loadPrompts()
  return prompts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const { prompts } = await loadPrompts()
  const p = prompts.find((x) => x.slug === slug)
  return p ? { title: p.title, description: p.description } : {}
}

export default async function PromptPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const { prompts } = await loadPrompts()
  const prompt = prompts.find((p) => p.slug === slug)
  if (!prompt) notFound()
  return <PromptDetail prompt={prompt} />
}
