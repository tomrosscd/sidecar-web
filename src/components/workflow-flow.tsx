'use client'

import { Button, Card, Progress } from '@convert/product-ui'
import Link from 'next/link'
import type { ResolvedCollection } from '@/lib/collections'
import { useDoneSteps } from '@/lib/use-saved'
import { PromptCard } from './prompt-card'
import { TimeframeControls } from './timeframe-controls'
import { useView } from './view-provider'
import { WorkflowCanvas, type WorkflowEdge, type WorkflowNode } from './workflow'
import styles from './workflow-flow.module.css'

/**
 * A collection as a workflow: a trigger node for the settings, then each prompt as a step. Steps can be
 * ticked off, and the progress is kept in this browser.
 */
export function WorkflowFlow({ collection }: { collection: ResolvedCollection }) {
  const { prompts, openPrompt } = useView()
  const { done, toggle, available } = useDoneSteps(collection.slug)
  const steps = collection.prompts
  const doneCount = steps.filter((p) => done.includes(p.slug)).length
  const inPack = new Set(steps.map((p) => p.slug))

  const nodes: WorkflowNode[] = [
    {
      id: 'start',
      row: 0,
      width: 640,
      kind: { label: 'Trigger', tone: 'accent' },
      label: 'the trigger: set the period',
      content: (
        <Card heading="Set the period" headingLevel={2} headingSize="collection" density="compact">
          <TimeframeControls />
        </Card>
      ),
    },
    ...steps.map((p, i): WorkflowNode => {
      const isDone = done.includes(p.slug)
      const outside = p.followUp && !inPack.has(p.followUp) ? prompts.find((x) => x.slug === p.followUp) : undefined
      const jump = p.followUp && inPack.has(p.followUp) ? steps.findIndex((x) => x.slug === p.followUp) : -1
      const next = steps[i + 1]
      return {
        id: p.slug,
        row: i + 1,
        width: 640,
        kind: { label: isDone ? `Step ${i + 1} · Done` : `Step ${i + 1}`, tone: isDone ? 'positive' : 'neutral' },
        label: `step ${i + 1}: ${p.title}`,
        content: (
          <>
            <PromptCard
              prompt={p}
              headingLevel={3}
              step={{ number: i + 1, done: isDone, onToggleDone: () => toggle(p.slug) }}
            />
            {jump >= 0 && next?.slug !== p.followUp && (
              <p className={styles.branch}>Suggested follow-up: step {jump + 1}</p>
            )}
            {outside && (
              <p className={styles.branch}>
                Suggested follow-up outside this pack:{' '}
                <Button variant="link" onClick={() => openPrompt(outside.slug)}>
                  {outside.title}
                </Button>
              </p>
            )}
          </>
        ),
      }
    }),
  ]

  const edges: WorkflowEdge[] = nodes.slice(1).map((n, i) => ({
    from: nodes[i].id,
    to: n.id,
    label: i === 0 ? 'first' : steps[i - 1]?.followUp === steps[i]?.slug ? 'suggested next' : 'then',
  }))

  return (
    <div className={styles.flow}>
      <Progress
        label="Workflow progress"
        value={doneCount}
        max={steps.length}
        valueLabel={`${doneCount} of ${steps.length} steps done`}
        hint={available ? undefined : 'Progress is not being saved because this browser is blocking storage.'}
      />
      <WorkflowCanvas nodes={nodes} edges={edges} label={`${collection.title} steps`} defaultNodeWidth={640} />
      <p className={styles.end}>
        {doneCount === steps.length
          ? 'All steps done.'
          : 'Drag a step by its handle, or focus the handle and use the arrow keys.'}{' '}
        <Link href="/collections/" className="cui-text-link cui-text-link-inline">
          All collections
        </Link>
      </p>
    </div>
  )
}
