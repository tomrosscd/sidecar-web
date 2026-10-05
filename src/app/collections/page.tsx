import type { Metadata } from 'next'
import { CollectionList } from '@/components/collection-list'
import { loadCollections } from '@/lib/collections'

export const metadata: Metadata = { title: 'Collections' }

export default async function CollectionsPage() {
  return <CollectionList collections={await loadCollections()} />
}
