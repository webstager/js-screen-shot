#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

print_usage() {
  cat <<'EOF'
Usage:
  pnpm release:publish
  pnpm release:publish 2.0.2
  pnpm release:publish 2.0.2 --yes

Options:
  -y, --yes    Skip the final git push and publish confirmation.
  -h, --help   Show this help message.
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' was not found." >&2
    exit 1
  fi
}

INPUT_VERSION=""
AUTO_YES=0

for arg in "$@"; do
  case "$arg" in
    --)
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    -y|--yes)
      AUTO_YES=1
      ;;
    *)
      if [ -n "$INPUT_VERSION" ]; then
        echo "Error: only one version argument is allowed." >&2
        print_usage
        exit 1
      fi
      INPUT_VERSION="$arg"
      ;;
  esac
done

require_command git
require_command node
require_command pnpm

CURRENT_VERSION="$(node -p "require('./package.json').version")"
LATEST_TAG="$(git tag --sort=-v:refname | head -n 1 || true)"
CURRENT_BRANCH="$(git branch --show-current)"

if [ -z "$CURRENT_BRANCH" ]; then
  echo "Error: cannot determine the current git branch." >&2
  exit 1
fi

SUGGESTED_VERSION="$(
  node - "$LATEST_TAG" "$CURRENT_VERSION" <<'NODE'
const latestTag = process.argv[2] || "";
const currentVersion = process.argv[3] || "0.0.0";
const isVersion = value => /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(value);
const bumpLastNumber = value =>
  value.replace(/(\d+)(\D*)$/, (_, number, suffix) => `${Number(number) + 1}${suffix}`);
const bumpPatch = value => {
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!match) return "0.0.1";
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}${match[4] || ""}`;
};

const tagVersion = latestTag.replace(/^v/, "");
const suggested = bumpLastNumber(tagVersion || currentVersion);
process.stdout.write(isVersion(suggested) ? suggested : bumpPatch(currentVersion));
NODE
)"

echo "Latest local tag: ${LATEST_TAG:-<none>}"
echo "Current package.json version: $CURRENT_VERSION"
echo "Suggested release version: $SUGGESTED_VERSION"

if [ -z "$INPUT_VERSION" ]; then
  printf "Release version [%s]: " "$SUGGESTED_VERSION"
  read -r INPUT_VERSION || INPUT_VERSION=""
fi

RELEASE_VERSION="${INPUT_VERSION:-$SUGGESTED_VERSION}"
RELEASE_VERSION="${RELEASE_VERSION#v}"
RELEASE_TAG="v$RELEASE_VERSION"

node - "$RELEASE_VERSION" <<'NODE'
const version = process.argv[2] || "";
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Error: invalid npm version "${version}".`);
  process.exit(1);
}
NODE

if [ "$RELEASE_VERSION" = "$CURRENT_VERSION" ]; then
  echo "Error: release version is the same as package.json version ($CURRENT_VERSION)." >&2
  exit 1
fi

if git rev-parse "$RELEASE_TAG" >/dev/null 2>&1; then
  echo "Error: git tag $RELEASE_TAG already exists." >&2
  exit 1
fi

node - "$CURRENT_VERSION" "$RELEASE_VERSION" <<'NODE'
const fs = require("fs");
const oldVersion = process.argv[2];
const newVersion = process.argv[3];

const packagePath = "package.json";
const readmePath = "README.md";
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
pkg.version = newVersion;
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

if (fs.existsSync(readmePath)) {
  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const readme = fs.readFileSync(readmePath, "utf8");
  fs.writeFileSync(
    readmePath,
    readme.replace(new RegExp(escapeRegExp(oldVersion), "g"), newVersion)
  );
}
NODE

echo "Updated package.json and README.md: $CURRENT_VERSION -> $RELEASE_VERSION"

git add package.json README.md
git commit -m "build: release $RELEASE_VERSION"
git tag "$RELEASE_TAG"

if [ "$AUTO_YES" -ne 1 ]; then
  printf "Push branch '%s', push tag '%s', run build-rollup:prod, and publish to npm now? [y/N]: " "$CURRENT_BRANCH" "$RELEASE_TAG"
  read -r CONFIRM || CONFIRM=""
  case "$CONFIRM" in
    y|Y|yes|YES)
      ;;
    *)
      echo "Push and publish skipped. Release commit and local tag have been created."
      exit 0
      ;;
  esac
fi

git push origin "$CURRENT_BRANCH"
git push origin "$RELEASE_TAG"
pnpm run build-rollup:prod
pnpm publish --access public
