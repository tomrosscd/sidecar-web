'use client'

import { Breadcrumbs, type BreadcrumbItem } from '@convert/product-ui'
import { useRouter } from 'next/navigation'
import { routeLinkClick } from '@/lib/client-navigation'

/** Product UI breadcrumbs whose links use the Next router instead of reloading the page. */
export function RouterBreadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  const router = useRouter()
  return <Breadcrumbs items={items} onNavigate={(item, event) => routeLinkClick(router.push, item.href, event)} />
}
