'use client'

import { Badge, ContentList, ContentListItem, EmptyState, FilterToolbar, PageLayout } from '@convert/product-ui'
import Link from 'next/link'
import { useMemo } from 'react'
import type { Skill } from '@/lib/skills'
import { useQueryString } from '@/lib/use-query-string'

type SkillCard = Omit<Skill, 'content'> & { content?: undefined }

export function SkillLibrary({ skills }: { skills: SkillCard[] }) {
  const categories = useMemo(() => [...new Set(skills.map((s) => s.category))].sort(), [skills])
  const [search, setSearch] = useQueryString()
  const params = new URLSearchParams(search)
  const q = params.get('q') ?? ''
  const rawCat = params.get('cat') ?? ''
  const category = categories.includes(rawCat) ? rawCat : ''

  const update = (next: { q?: string; category?: string }) => {
    const p = new URLSearchParams()
    const nq = next.q ?? q
    const nc = next.category ?? category
    if (nq.trim()) p.set('q', nq)
    if (nc) p.set('cat', nc)
    const out = p.toString()
    setSearch(out ? `?${out}` : '')
  }

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  const visible = skills.filter((s) => {
    if (category && s.category !== category) return false
    const hay = `${s.title} ${s.summary ?? ''} ${s.category} ${s.useCases.join(' ')}`.toLowerCase()
    return terms.every((t) => hay.includes(t))
  })

  return (
    <PageLayout
      headingOwner="page"
      heading="Skills"
      description="Reusable skills for working with Claude, written and kept by the team."
      toolbar={
        <FilterToolbar
          density="compact"
          searchMode="expanded"
          searchLabel="Search skills"
          searchPlaceholder="Search skills…"
          searchValue={q}
          onSearchChange={(v) => update({ q: v })}
          filterPicker={{
            fields: [{ key: 'category', label: 'Category', options: categories.map((c) => ({ value: c, label: c })) }],
            value: category ? [{ field: 'category', values: [category] }] : [],
            onValueChange: (next) => update({ category: next.find((s) => s.field === 'category')?.values[0] ?? '' }),
          }}
        />
      }
      footer={
        <p role="status">
          {visible.length} of {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
        </p>
      }
    >
      {visible.length === 0 ? (
        <EmptyState live heading="No skills match" description="Try a different search or clear the filter." />
      ) : (
        <ContentList density="compact">
          {visible.map((s) => (
            <ContentListItem
              key={s.slug}
              title={
                <Link href={`/skills/${s.slug}/`} className="cui-text-link cui-text-link-inline">
                  {s.title}
                </Link>
              }
              description={s.summary}
              meta={
                <>
                  <Badge>{s.category}</Badge>
                  {s.featured && <Badge tone="accent">Featured</Badge>}
                  {s.recommended && <Badge tone="positive">Recommended</Badge>}
                </>
              }
            />
          ))}
        </ContentList>
      )}
    </PageLayout>
  )
}
