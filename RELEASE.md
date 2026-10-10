# Release checklist

Sidecar Web reads its prompts and the shared app list at build time, and Tom releases it by hand from his machine. Nothing rebuilds it on a push or on a schedule, so a change to either source does not appear until someone releases. This checklist is that step.

## When to release

Release after any of these:

- A change to this repository's code, merged to `main`.
- A change to `prompts.json` in `tomrosscd/sidecar` (new, edited or removed prompts, collections, or the `updated` value).
- A change to `apps.json` in `tomrosscd/convert-apps` (the app switcher list).

## One-time setup

The Google Cloud commands are in [HANDOFF.md](HANDOFF.md), "Google Cloud setup (Tom)". Then copy `.env.release.example` to `.env.release` and fill it in. That file is gitignored: it holds Google Cloud details, which stay out of git.

## How to release

```bash
git checkout main && git pull
```

```bash
pnpm release
```

It refuses to run with uncommitted changes, or if `main` differs from `origin/main`. It fetches Product UI and the app list, installs, runs `pnpm check`, shows the commit, image and prompt count, and asks before it uploads anything. Then it builds the image in Cloud Build and points the Cloud Run service at it.

## Record each release

Add a line to the "Release record" table in [HANDOFF.md](HANDOFF.md):

| What                     | Where to find it                                                                |
| ------------------------ | ------------------------------------------------------------------------------- |
| `prompts.json` `updated` | The `updated` field at `https://convert-sidecar-prompts.pages.dev/prompts.json` |
| Prompt count             | The number of entries in `prompts` in the same file (`pnpm release` prints it)  |
| `convert-apps` commit    | The short hash of the latest commit on `main` in `tomrosscd/convert-apps`       |
| Image tag                | The short commit hash `pnpm release` prints (`...sidecar-web/app:<tag>`)        |
| Date and who released    | Today's date and your name                                                      |

Record the values the build used, not the values from after the build. If `prompts.json` changed while the build ran, release again.

## Check the result

- Open the service address, sign in with Google, and look at a prompt you changed, or the app switcher if `apps.json` changed.
- A failed build or a failed deploy leaves the previous image serving, so an error means the change has not gone out.
- If the build fails on prompt validation, fix `prompts.json` in `tomrosscd/sidecar` and release again. Do not work around the validation.

## If a release is bad

See "Rollback" in [HANDOFF.md](HANDOFF.md).
