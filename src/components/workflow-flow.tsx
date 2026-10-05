'use client'

import { Badge, Button, Card, Progress } from '@convert/product-ui'
import Link from 'next/link'
import type { ResolvedCollection } from '@/lib/collections'
import { useDoneSteps } from '@/lib/use-saved'
import { PromptCard } from './prompt-card'
import { TimeframeControls } from './timeframe-controls'
import { useView } from './view-provider'
import styles from './workflow-flow.module.css'

/**
 * A collection as a workflow: a start step for the settings, then each prompt as a step on a dotted
 * canvas, joined by connectors. Steps can be ticked off, and the progress is kept in this browser.
 */
export function WorkflowFlow({ collection }: { collection: ResolvedCollection }) {
  const { prompts, openPrompt } = useView()
  const { done, toggle, available } = useDoneSteps(collection.slug)
  const steps = collection.prompts
  const doneCount = steps.filter((p) => done.includes(p.slug)).length
  const inPack = new Set(steps.map((p) => p.slug))

  return (
    <div className={styles.canvas}>
      <div className={styles.flow}>
        <Progress
          label="Workflow progress"
          value={doneCount}
          max={steps.length}
          valueLabel={`${doneCount} of ${steps.length} steps done`}
          hint={available ? undefined : 'Progress is not being saved because this browser is blocking storage.'}
        />

        <Card
          heading="Set the period"
          headingLevel={2}
          headingSize="collection"
          density="compact"
          action={<Badge tone="accent">Trigger</Badge>}
        >
          <TimeframeControls />
        </Card>

        <ol className={styles.steps}>
          {steps.map((p, i) => {
            const next = steps[i + 1]
            const outside =
              p.followUp && !inPack.has(p.followUp) ? prompts.find((x) => x.slug === p.followUp) : undefined
            const jump =
              p.followUp && inPack.has(p.followUp) && p.followUp !== next?.slug
                ? steps.findIndex((x) => x.slug === p.followUp)
                : -1
            return (
              <li key={p.slug} id={`step-${i + 1}`} className={styles.step}>
                <div className={styles.connector} aria-hidden="true">
                  <span className={styles.label}>
                    {i === 0 ? 'first' : p.slug === steps[i - 1]?.followUp ? 'suggested next' : 'then'}
                  </span>
                </div>
                <PromptCard
                  prompt={p}
                  headingLevel={3}
                  step={{ number: i + 1, done: done.includes(p.slug), onToggleDone: () => toggle(p.slug) }}
                />
                {jump >= 0 && (
                  <p className={styles.branch}>
                    Suggested follow-up:{' '}
                    <a className="cui-text-link cui-text-link-inline" href={`#step-${jump + 1}`}>
                      step {jump + 1}
                    </a>
                  </p>
                )}
                {outside && (
                  <p className={styles.branch}>
                    Suggested follow-up outside this pack:{' '}
                    <Button variant="link" onClick={() => openPrompt(outside.slug)}>
                      {outside.title}
                    </Button>
                  </p>
                )}
              </li>
            )
          })}
        </ol>
        <p className={styles.end}>
          {doneCount === steps.length ? 'All steps done.' : 'End of workflow.'}{' '}
          <Link href="/collections/" className="cui-text-link cui-text-link-inline">
            All collections
          </Link>
        </p>
      </div>
    </div>
  )
}
