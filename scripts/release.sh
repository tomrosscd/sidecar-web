#!/usr/bin/env bash
# Builds, checks and releases Sidecar Web from this machine. Tom runs this. Agents never do.
#
#   pnpm release
#
# Reads the project settings from .env.release (gitignored, never committed). See RELEASE.md.
# It rebuilds from the latest prompts and app list, runs every check, builds the image in Cloud Build,
# then points the Cloud Run service at the new image. The service's IAP settings and service account
# are not touched: only the image changes.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env.release ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.release
  set +a
fi

for name in SW_PROJECT SW_REGION SW_SERVICE SW_BUILDER SW_STAGING_BUCKET; do
  if [ -z "${!name:-}" ]; then
    echo "Set $name in .env.release (see RELEASE.md)." >&2
    exit 1
  fi
done

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "You have uncommitted changes. Commit or stash them first, so the image matches a commit." >&2
  exit 1
fi

branch="$(git branch --show-current)"
if [ "$branch" != "main" ]; then
  echo "You are on '$branch', not main."
  read -r -p "Release from '$branch' anyway? [y/N] " answer
  [ "$answer" = "y" ] || exit 1
fi

git fetch --quiet origin
if [ "$branch" = "main" ] && [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo "main is not the same as origin/main. Run 'git pull' (or push your commits) first." >&2
  exit 1
fi

tag="$(git rev-parse --short HEAD)"
image="${SW_REGION}-docker.pkg.dev/${SW_PROJECT}/sidecar-web/app:${tag}"

echo "Checking and building commit ${tag} from the latest prompts and app list..."
pnpm product-ui
pnpm apps
pnpm install --frozen-lockfile
pnpm check

feed="${PROMPTS_URL:-https://convert-sidecar-prompts.pages.dev/prompts.json}"
updated="$(curl -fsS "$feed" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.updated+' / '+j.count+' prompts')})" 2>/dev/null || echo "could not read the feed")"

echo
echo "Ready to release ${tag}:"
echo "  project  ${SW_PROJECT}"
echo "  service  ${SW_SERVICE} (${SW_REGION})"
echo "  image    ${image}"
echo "  prompts  ${updated}"
read -r -p "Build the image and deploy it? [y/N] " answer
[ "$answer" = "y" ] || { echo "Stopped. Nothing was uploaded."; exit 0; }

gcloud builds submit --config=cloudbuild.yaml \
  --substitutions="_REGION=${SW_REGION},_TAG=${tag}" \
  --service-account="projects/${SW_PROJECT}/serviceAccounts/${SW_BUILDER}" \
  --gcs-source-staging-dir="gs://${SW_STAGING_BUCKET}/source" \
  --project="${SW_PROJECT}"

gcloud run services update "${SW_SERVICE}" \
  --image="${image}" \
  --region="${SW_REGION}" \
  --project="${SW_PROJECT}"

echo
gcloud run services describe "${SW_SERVICE}" --region="${SW_REGION}" --project="${SW_PROJECT}" \
  --format="value(status.url)"
echo "Released ${tag}. Open the address above, sign in, and check a prompt page."
