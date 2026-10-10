'use client'

import { Button, Icon } from '@convert/product-ui'
import { useSaved } from '@/lib/use-saved'

/** A bookmark: outline to save, solid once saved. Icon only on cards, with a label where there is room. */
export function SaveButton({ slug, title, showLabel = false }: { slug: string; title: string; showLabel?: boolean }) {
  const { saved, toggle } = useSaved()
  const isSaved = saved.includes(slug)
  const icon = <Icon name="bookmark" className={isSaved ? 'cui-icon-filled' : undefined} />
  const name = `${isSaved ? 'Remove from saved' : 'Save'}: ${title}`
  return showLabel ? (
    <Button variant="quiet" aria-pressed={isSaved} aria-label={name} leadingIcon={icon} onClick={() => toggle(slug)}>
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
      {icon}
    </Button>
  )
}
