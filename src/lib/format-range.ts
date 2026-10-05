const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2025-03-31" to "31 Mar 2025". Reads the parts directly, so there is no timezone shift. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return ''
  const month = MONTHS[Number(m[2]) - 1]
  return month ? `${Number(m[3])} ${month} ${m[1]}` : ''
}

/**
 * The wording written into the custom field when dates are picked: "1 Jan 2025 – 31 Mar 2025", or a
 * single day. The field stays editable, so the text, not the dates, is what the prompt uses.
 */
export function formatRange(start: string, end?: string): string {
  const a = formatDate(start)
  const b = end ? formatDate(end) : ''
  if (!a) return ''
  return b && b !== a ? `${a} – ${b}` : a
}
