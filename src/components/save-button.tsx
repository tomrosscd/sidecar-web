'use client'

import { Button } from '@convert/product-ui'
import { useSaved } from '@/lib/use-saved'

export function SaveButton({ slug, title, size = 'sm' }: { slug: string; title: string; size?: 'sm' | 'default' }) {
  const { saved, toggle } = useSaved()
  const isSaved = saved.includes(slug)
  return (
    <Button
      size={size}
      variant="quiet"
      aria-pressed={isSaved}
      aria-label={`${isSaved ? 'Remove from saved' : 'Save'}: ${title}`}
      onClick={() => toggle(slug)}
    >
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  )
}
