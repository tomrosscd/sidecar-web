'use client'

import { Badge, Button } from '@convert/product-ui'
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import styles from './workflow-canvas.module.css'

/*
 * WorkflowCanvas: connected steps on a dotted canvas, in the style of Product UI.
 *
 * Built here first, with the aim of moving into @convert/product-ui if it proves useful. It uses only
 * Product UI components and --cui-* tokens, takes content as React nodes, and keeps application data out.
 * Inspired by the Flowchart on beautifului.dev (layout idea only; no code is shared).
 *
 * - Nodes sit in rows and are joined by connectors that are measured from the rendered cards, so they
 *   follow when a card grows or is moved.
 * - Each node can be moved. The Move handle supports the pointer and the arrow keys (Shift for larger
 *   steps), so there is a keyboard route for every drag.
 * - Selecting a node (clicking or focusing inside it) lights its connectors.
 */

export type WorkflowTone = 'neutral' | 'accent' | 'positive' | 'warning' | 'negative'

export type WorkflowNode = {
  id: string
  /** Rows stack top to bottom. Nodes that share a row sit side by side. */
  row: number
  /** Horizontal centre, from 0 (left) to 1 (right). Defaults to 0.5. */
  x?: number
  /** Preferred width in px. It shrinks to fit a narrow canvas. */
  width?: number
  /** A small tag above the node, such as Trigger or Step 2. */
  kind?: { label: string; tone?: WorkflowTone }
  /** Names the node for the Move handle, such as "Step 2: Funnel review". */
  label: string
  content: ReactNode
}

export type WorkflowEdge = { from: string; to: string; label?: string }

type Offset = { dx: number; dy: number }
type Measure = { height: number; innerTop: number }

const PAD_Y = 24
const ROW_GAP = 64
const KEY_STEP = 16
const KEY_STEP_LARGE = 64
const DEFAULT_WIDTH = 480

export function WorkflowCanvas({
  nodes,
  edges,
  label,
  defaultNodeWidth = 360,
}: {
  nodes: readonly WorkflowNode[]
  edges: readonly WorkflowEdge[]
  /** Accessible name for the list of steps. */
  label: string
  defaultNodeWidth?: number
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const nodeEls = useRef(new Map<string, HTMLElement>())
  const innerEls = useRef(new Map<string, HTMLElement>())
  const [width, setWidth] = useState(0)
  const [measures, setMeasures] = useState<Record<string, Measure>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [offsets, setOffsets] = useState<Record<string, Offset>>({})
  const drag = useRef<{ id: string; startX: number; startY: number; base: Offset } | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const measure = () => {
      setWidth(canvas.clientWidth)
      setMeasures((prev) => {
        const next: Record<string, Measure> = { ...prev }
        let changed = false
        nodeEls.current.forEach((el, id) => {
          const m = { height: el.offsetHeight, innerTop: innerEls.current.get(id)?.offsetTop ?? 0 }
          if (
            !prev[id] ||
            Math.abs(prev[id].height - m.height) > 0.5 ||
            Math.abs(prev[id].innerTop - m.innerTop) > 0.5
          ) {
            next[id] = m
            changed = true
          }
        })
        return changed ? next : prev
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(canvas)
    nodeEls.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [nodes])

  const heightOf = (id: string) => measures[id]?.height ?? 120
  const rows = [...new Set(nodes.map((n) => n.row))].sort((a, b) => a - b)
  const rowHeights = rows.map((r) => Math.max(...nodes.filter((n) => n.row === r).map((n) => heightOf(n.id))))
  const rowTops: number[] = []
  rows.forEach((_, i) => {
    rowTops[i] = i === 0 ? PAD_Y : rowTops[i - 1] + rowHeights[i - 1] + ROW_GAP
  })
  const canvasHeight = (rowTops[rows.length - 1] ?? 0) + (rowHeights[rows.length - 1] ?? 0) + PAD_Y

  const cw = width || DEFAULT_WIDTH
  const basePlace = (n: WorkflowNode) => {
    const w = Math.min(n.width ?? defaultNodeWidth, cw * 0.94)
    return { w, cx: (n.x ?? 0.5) * cw, top: rowTops[rows.indexOf(n.row)] }
  }
  const place = (n: WorkflowNode) => {
    const b = basePlace(n)
    const o = offsets[n.id]
    return { w: b.w, cx: b.cx + (o?.dx ?? 0), top: b.top + (o?.dy ?? 0) }
  }

  /** Clamp an offset so the node stays inside the canvas. */
  const clamp = (n: WorkflowNode, o: Offset): Offset => {
    const b = basePlace(n)
    const cx = Math.min(Math.max(b.cx + o.dx, b.w / 2 + 8), Math.max(cw - b.w / 2 - 8, b.w / 2 + 8))
    const top = Math.min(Math.max(b.top + o.dy, 8), Math.max(canvasHeight - heightOf(n.id) - 8, 8))
    return { dx: cx - b.cx, dy: top - b.top }
  }
  const moveTo = (n: WorkflowNode, o: Offset) => setOffsets((cur) => ({ ...cur, [n.id]: clamp(n, o) }))

  const anchor = (id: string, end: 'top' | 'bottom') => {
    const n = nodes.find((x) => x.id === id)
    if (!n) return { x: 0, y: 0 }
    const { cx, top } = place(n)
    return { x: cx, y: top + (end === 'top' ? (measures[id]?.innerTop ?? 0) : heightOf(id)) }
  }

  const curve = (edge: WorkflowEdge) => {
    const from = anchor(edge.from, 'bottom')
    const to = anchor(edge.to, 'top')
    const k = Math.min(Math.max(Math.abs(to.y - from.y) * 0.55, 24), 84)
    return {
      d: `M ${from.x} ${from.y} C ${from.x} ${from.y + k}, ${to.x} ${to.y - k}, ${to.x} ${to.y}`,
      // The middle of a cubic curve with vertical end tangents.
      mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
    }
  }

  const onPointerDown = (n: WorkflowNode) => (e: PointerEvent<HTMLButtonElement>) => {
    drag.current = { id: n.id, startX: e.clientX, startY: e.clientY, base: offsets[n.id] ?? { dx: 0, dy: 0 } }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (n: WorkflowNode) => (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== n.id) return
    moveTo(n, { dx: d.base.dx + e.clientX - d.startX, dy: d.base.dy + e.clientY - d.startY })
  }
  const onPointerEnd = () => {
    drag.current = null
  }
  const onKeyDown = (n: WorkflowNode) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP
    const delta: Record<string, Offset> = {
      ArrowLeft: { dx: -step, dy: 0 },
      ArrowRight: { dx: step, dy: 0 },
      ArrowUp: { dx: 0, dy: -step },
      ArrowDown: { dx: 0, dy: step },
    }
    const d = delta[e.key]
    if (!d) return
    e.preventDefault()
    const cur = offsets[n.id] ?? { dx: 0, dy: 0 }
    moveTo(n, { dx: cur.dx + d.dx, dy: cur.dy + d.dy })
  }

  const lit = (edge: WorkflowEdge) => selected === edge.from || selected === edge.to
  const moved = Object.keys(offsets).length > 0

  return (
    <div ref={canvasRef} className={styles.canvas} style={{ height: canvasHeight }}>
      <svg className={styles.edges} width={cw} height={canvasHeight} aria-hidden="true">
        {edges.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}`}
            d={curve(edge).d}
            className={lit(edge) ? styles.edgeLit : styles.edge}
          />
        ))}
      </svg>
      {edges.map(
        (edge) =>
          edge.label && (
            <span
              key={`label-${edge.from}-${edge.to}`}
              className={styles.edgeLabel}
              style={{ left: curve(edge).mid.x, top: curve(edge).mid.y }}
              aria-hidden="true"
            >
              {edge.label}
            </span>
          ),
      )}
      {moved && (
        <div className={styles.reset}>
          <Button size="sm" variant="quiet" onClick={() => setOffsets({})}>
            Reset layout
          </Button>
        </div>
      )}
      <ol className={styles.nodes} aria-label={label}>
        {nodes.map((n) => {
          const { w, cx, top } = place(n)
          return (
            <li
              key={n.id}
              ref={(el) => {
                if (el) nodeEls.current.set(n.id, el)
                else nodeEls.current.delete(n.id)
              }}
              className={styles.node}
              data-selected={selected === n.id || undefined}
              style={{ left: cx, top, width: w }}
              onPointerDownCapture={() => setSelected(n.id)}
              onFocusCapture={() => setSelected(n.id)}
            >
              <div className={styles.tagRow}>
                {n.kind ? <Badge tone={n.kind.tone ?? 'neutral'}>{n.kind.label}</Badge> : <span />}
                <button
                  type="button"
                  className={styles.handle}
                  aria-label={`Move ${n.label}. Drag, or use the arrow keys.`}
                  title="Move"
                  onPointerDown={onPointerDown(n)}
                  onPointerMove={onPointerMove(n)}
                  onPointerUp={onPointerEnd}
                  onPointerCancel={onPointerEnd}
                  onKeyDown={onKeyDown(n)}
                >
                  <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                    {[3, 8, 13].flatMap((y) => [
                      <circle key={`l${y}`} cx="3" cy={y} r="1.1" fill="currentColor" />,
                      <circle key={`r${y}`} cx="7.5" cy={y} r="1.1" fill="currentColor" />,
                    ])}
                  </svg>
                </button>
              </div>
              <div
                className={styles.inner}
                ref={(el) => {
                  if (el) innerEls.current.set(n.id, el)
                  else innerEls.current.delete(n.id)
                }}
              >
                {n.content}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
