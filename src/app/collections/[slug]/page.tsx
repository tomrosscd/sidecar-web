import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollectionDetail } from '@/components/collection-detail'
import { loadCollections } from '@/lib/collections'

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  return (await loadCollections()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const c = (await loadCollections()).find((x) => x.slug === slug)
  return c ? { title: c.title, description: c.description } : {}
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const collection = (await loadCollections()).find((c) => c.slug === slug)
  if (!collection) notFound()
  return <CollectionDetail collection={collection} />
}
