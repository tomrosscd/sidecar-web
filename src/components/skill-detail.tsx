'use client'

import { Badge, Button, Card, KeyValueList, PageLayout, Stack } from '@convert/product-ui'
import { withBase } from '@/lib/base-path'
import { copyText } from '@/lib/copy-text'
import type { Skill } from '@/lib/skills'
import styles from './skill-detail.module.css'
import { RouterBreadcrumbs } from './router-breadcrumbs'
import { useToast } from './toast-provider'

export function SkillDetail({ skill }: { skill: Skill }) {
  const notify = useToast()
  const details = [
    skill.owner ? { label: 'Owner', value: skill.owner } : null,
    skill.version !== undefined
      ? { label: 'Version', value: `v${skill.version}${skill.versionLabel ? ` · ${skill.versionLabel}` : ''}` }
      : null,
    skill.updated ? { label: 'Updated', value: skill.updated } : null,
    skill.changelog ? { label: 'Notes', value: skill.changelog } : null,
    skill.useCases.length
      ? {
          label: 'Use cases',
          value: (
            <ul className={styles.list}>
              {skill.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          ),
        }
      : null,
  ].filter((x) => x !== null)

  return (
    <PageLayout
      headingOwner="page"
      heading={skill.title}
      description={skill.summary}
      context={<RouterBreadcrumbs items={[{ label: 'Skills', href: withBase('/skills/') }, { label: skill.title }]} />}
      actions={
        <Button
          variant="primary"
          onClick={async () =>
            (await copyText(skill.content))
              ? notify('Skill copied', skill.title, 'success')
              : notify('Could not copy the skill', undefined, 'error')
          }
        >
          Copy skill
        </Button>
      }
    >
      <Stack gap={24}>
        <div className={styles.badges}>
          <Badge>{skill.category}</Badge>
          {skill.featured && <Badge tone="accent">Featured</Badge>}
          {skill.recommended && <Badge tone="positive">Recommended</Badge>}
        </div>
        {details.length > 0 && (
          <Card heading="About this skill" headingLevel={2} headingSize="collection" density="compact" elevation="flat">
            <KeyValueList items={details} />
          </Card>
        )}
        <Card heading="Skill" headingLevel={2} headingSize="collection" density="compact" elevation="flat">
          <pre className={styles.body}>{skill.content}</pre>
        </Card>
      </Stack>
    </PageLayout>
  )
}
