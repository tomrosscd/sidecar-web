export const SITE_NAME = 'Sidecar Web'
export const SITE_DESCRIPTION = 'A prompt library for Convert staff, shared with the Sidecar Extension.'

/** Where "Submit a prompt" goes. Swap for a Google Form link when one exists. */
export const SUBMIT_URL = 'mailto:tom@convertdigital.com.au?subject=Sidecar%20prompt%20submission'

export const EXTENSION_URL = 'https://chromewebstore.google.com/detail/sidecar/nmomnjfjindmlfgilkakhgmciheejbni'

/** The skills library is built only when NEXT_PUBLIC_SHOW_SKILLS=true. Off by default. */
export const SHOW_SKILLS = process.env.NEXT_PUBLIC_SHOW_SKILLS === 'true'
