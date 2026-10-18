# Verification and CI operations

`node verification/catalog.mjs` validates structure and generated navigation;
`--write` refreshes catalog/README.md from its canonical JSON and recipe metadata.
It does not execute builds or grant verified status.

`node verification/verify.mjs RECIPE /absolute/path/to/oyzu RECORD.json` copies
only the committed native project files into temporary storage outside the
repository, runs the real CLI, inspects its bundle and consumes the delivered
artifact. Records identify the exact recipe commit/tree/content digest, CLI
binary digest, commands, host/execution/target, reports and limits. Raw logs stay
in ignored local storage or CI logs. A record for changed content is historical,
not a badge for the new recipe. Failed commands fail the verification process.
The harness selects a disposable empty user configuration through
OYZU_USER_CONFIG so hidden user preferences do not become project prerequisites.
Native machine/organization configuration remains binding, and the shared
verified tool store is retained. This does not suppress invalid selected locks
or grant authority. Failed attempts retain a concise record, without publishing
raw local logs or machine paths.

The native CI job selects affected recipes on PRs and main pushes. Common
verification changes, Monday compatibility runs and manually selected candidate
releases exercise all admitted native consumers. Captured executor and live
publication/deployment checks remain separately attributable; an omitted family
is not reported as verified. Current image prerequisites and blockers are in the
recipe metadata and coverage inventory.

## Published CLI selection

The maintainer selected future public GitHub release artifacts as CI's CLI
source. Configure repository variables OYZU_RELEASE_TAG (an exact tag),
OYZU_RELEASE_ASSET (an exact asset name), OYZU_RELEASE_SHA256 (64 lowercase hex
characters), and, for an archive, OYZU_RELEASE_EXECUTABLE (its relative CLI path;
default oyzu). Keep bundled notices alongside the extracted release. The
bootstrap reads the official oyzuai/oyzu release API, verifies the archive before
extraction, rejects unsafe members, and executes only the selected binary.
It never checks out private source or runs an install script from the artifact.
The release must actually exist and be public: an assumption about future
publication does not make current CI pass. Missing configuration/releases fail
actionably. Local verification uses an already installed CLI.

## Documentation update permissions

A successful relevant main verification sends an examples-verified repository
dispatch to oyzuai/oyzu. Configure OYZU_EXAMPLES_DISPATCH_TOKEN with only the
receiving repository's required dispatch permission, preferably a scoped GitHub
App installation token. The examples repository's ordinary default token is
not assumed to have cross-repository write access. Do not copy the site's deploy
credential here. The receiving workflow validates the exact commit and successful
native checks, updates a single bot-owned draft PR and lets the existing docs
workflow validate/render it. It never pushes website output.

Live publication checks require explicit disposable targets and credentials.
OCI file artifacts, native image publication, GitHub Release assets and native
package publication are separate capabilities. Use only explicitly identified
test witnesses; these cannot establish protected origin, keyless identity,
transparency or an unproved SLSA level. Preserve partial effects and use native
retrieval/consumer checks. Document resource cleanup before running a live job.
