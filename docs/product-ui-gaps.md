# Product UI gaps

- **Breadcrumbs** (1.5.0): renders plain anchors with no `onNavigate`, so links reload the page instead of using the Next router. Worked around by using it as is; the cost is a full page load.
