import { Card, Grid, PageLayout, Stack } from '@convert/product-ui'
import type { Metadata } from 'next'
import { EXTENSION_URL } from '@/config/site'

export const metadata: Metadata = { title: 'Sidecar Extension' }

export default function ExtensionPage() {
  return (
    <PageLayout
      headingOwner="page"
      heading="Sidecar Extension"
      description="A Chrome side panel that sits next to Shopify Sidekick, so you can use these prompts and export your chats without leaving the admin."
      actions={
        <a className="cui-button cui-button-primary" href={EXTENSION_URL} target="_blank" rel="noopener noreferrer">
          Install from the Chrome Web Store
          <span className="cui-sr-only"> (opens in a new tab)</span>
        </a>
      }
      contentWidth="readable"
    >
      <Stack gap={24}>
        <Grid columns={2} gap={16} align="stretch">
          <Card heading="Prompts mode" headingLevel={2} headingSize="collection" density="compact">
            <p>
              Browse this same prompt library in the side panel. Pick a timeframe and comparison, then insert the
              finished prompt straight into the Sidekick conversation, or copy it.
            </p>
          </Card>
          <Card heading="Export mode" headingLevel={2} headingSize="collection" density="compact">
            <p>
              Turn a Sidekick conversation into clean Markdown or CSV. Export the latest prompt, every exchange, or pick
              the ones you want.
            </p>
          </Card>
        </Grid>
        <Card heading="One library, two places" headingLevel={2} headingSize="collection" density="compact">
          <p>
            Sidecar Web and the extension read the same prompt data. When a prompt is added or improved it appears in
            both, and a prompt copied here reads exactly as it does in the extension for the same timeframe and
            comparison.
          </p>
        </Card>
        <Card heading="Privacy" headingLevel={2} headingSize="collection" density="compact">
          <p>The extension runs in your browser. Nothing leaves it unless you copy or download it.</p>
        </Card>
      </Stack>
    </PageLayout>
  )
}
