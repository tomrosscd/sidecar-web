# Release checklist

Sidecar Web reads its prompts and the shared app list at build time. Nothing rebuilds it on a schedule, so a change to either source does not appear until someone rebuilds. This checklist is that step.

## When to rebuild

Rebuild after any of these:

- A change to `prompts.json` in `tomrosscd/sidecar` (new, edited or removed prompts, collections, or the `updated` value).
- A change to `apps.json` in `tomrosscd/convert-apps` (the app switcher list).

A push to `main` in this repo also rebuilds, so a rebuild is only needed when the change was somewhere else.

## How to rebuild

Use either option. Neither needs a code change.

1. **Retry deployment.** In the Cloudflare dashboard, open Workers & Pages, then the `convert-sidecar-web` project, then Deployments. Open the latest **production** deployment and choose **Retry deployment**.
2. **Empty commit.** Run `git commit --allow-empty -m "Rebuild for prompt or app list change"` on `main` and push it. Cloudflare builds every push to `main`. This leaves a trace in the git history.

## Record each rebuild

When the new deployment succeeds, add a line to the "Release record" table in [HANDOFF.md](HANDOFF.md):

| What                     | Where to find it                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `prompts.json` `updated` | The `updated` field at `https://convert-sidecar-prompts.pages.dev/prompts.json`            |
| Prompt count             | The number of entries in `prompts` in the same file                                        |
| `convert-apps` commit    | The short hash of the latest commit on `main` in `tomrosscd/convert-apps`                  |
| Cloudflare deployment ID | The deployment's page in the Cloudflare dashboard (the ID is the last part of its address) |
| Date and who rebuilt     | Today's date and your name                                                                 |

Record the values the build used, not the values from after the build. If `prompts.json` changed while the build ran, rebuild again.

## Check the result

- The deployment shows as successful. A failed build keeps the previous deployment live, so a red build means the change has not gone out.
- Open the site and look at a prompt you changed, or the app switcher if `apps.json` changed.
- If the build fails on prompt validation, fix `prompts.json` in `tomrosscd/sidecar` and rebuild. Do not work around the validation.

## If a deployment is bad

See "Rollback" in [HANDOFF.md](HANDOFF.md).
