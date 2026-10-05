# WorkflowCanvas

Connected steps on a dotted canvas, built in Product UI's style. It lives here first, with the aim of moving into `@convert/product-ui` once it has proved itself. The layout idea comes from the Flowchart on beautifului.dev; no code is shared.

## Why it is shaped this way

- Only Product UI components (`Badge`, `Button`) and `--cui-*` tokens. No Tailwind, no raw colours, so it follows the theme.
- No application data inside. A node is `{ id, row, x?, width?, kind?, label, content }`; `content` is any React node. An edge is `{ from, to, label? }`.
- Connectors are measured from the rendered nodes (`ResizeObserver`), so they follow when a card grows or is moved.
- Moving a node has a keyboard route: the Move handle takes arrow keys (Shift for larger steps), as well as the pointer. Nodes are an ordered list, in step order. Selecting a node (click or focus inside it) lights its connectors.

## To do before it goes into Product UI

- Decide the public props (tones for `kind`, whether nodes can be fixed in place, layout reset).
- Stories and a visual and interaction review, including 320px and reduced motion.
- Test drag at touch sizes, and with a screen reader.
- Replace the fixed row layout if branching (several nodes in a row, edges between non-adjacent rows) needs better routing.

Used by `src/components/workflow-flow.tsx`.
