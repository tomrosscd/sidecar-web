'use client'

import { Button } from '@convert/product-ui'
import { useSaved } from '@/lib/use-saved'
import { BookmarkIcon } from './icons'

/** A bookmark: outline to save, solid once saved. Icon only on cards, with a label where there is room. */
export function SaveButton({ slug, title, showLabel = false }: { slug: string; title: string; showLabel?: boolean }) {
  const { saved, toggle } = useSaved()
  const isSaved = saved.includes(slug)
  const name = `${isSaved ? 'Remove from saved' : 'Save'}: ${title}`
  return showLabel ? (
    <Button
      variant="quiet"
      aria-pressed={isSaved}
      aria-label={name}
      leadingIcon={<BookmarkIcon filled={isSaved} />}
      onClick={() => toggle(slug)}
    >
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  ) : (
    <Button
      size="icon"
      variant="quiet"
      aria-pressed={isSaved}
      aria-label={name}
      title={isSaved ? 'Saved. Click to remove' : 'Save'}
      onClick={() => toggle(slug)}
    >
      <BookmarkIcon filled={isSaved} />
    </Button>
  )
}
