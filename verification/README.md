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
The subject identifies the authored recipe and its documented scenario.
For scenarios that edit inputs, artifact.digest, artifact.sourceTree, output and
reports identify the same successful consumer phase, including the edited
captured source. They do not relabel an initial artifact as the later result.
An explicitly isolated build is recorded as captured execution; the controller
host and artifact target remain separate fields.
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
The hosted matrix admits only host-native recipes. In particular, npm package
and Go workspace proofs need their documented provisioned executor images and
run in `Provided executor examples`. Changed recipes requiring external
prerequisites are listed as `requiredExternalRecipes`; they block automatic docs
notification even if unrelated native checks pass. A first-build baseline never
substitutes for an affected captured or live recipe. Shared verifier changes
retain all those obligations. Native failures still upload their exact-subject
records for inspection. Run `node --test verification/affected.test.mjs` to check
selection, notification gates and failure-record retention.
Updates under `verification/records/` require the owning recipe's check according
to its metadata; a new native proof record does not require unrelated executors.
For the Go workspace proof, EXAMPLES_GO_IMAGE can explicitly select an already provisioned
compatible Go executor through Oyzu's ordinary `--image go=...` option. The
verifier records that reference, immutable image identity and actual command;
it does not install a compiler or treat a stale default image as compatible.
Editorial/catalog-only changes verify the first-build baseline before requesting
a docs pin update. A manual candidate must supply its complete tag, asset and
checksum tuple; it cannot accidentally combine a candidate tag with the baseline
release's checksum. Externally provisioned executor checks can be run locally
with the same verifier, and are not counted as hosted native passes.
`Provided executor examples` is a separate manual workflow for a dedicated
Linux runner labelled oyzu-examples, with Node and the documented executor
images already provisioned. It neither installs missing SDKs nor grants success
when one is unavailable. `Live publication examples` is a manual job on a
disposable GitHub runner: it uses that repository's short-lived contents token,
separately provisions two local registries, then exercises an existing test
prerelease selected by the operator. It removes only containers it created.
Inspect and delete that test release/tag afterward; the publisher never creates,
finalizes or deletes releases. Neither workflow runs as an untrusted PR job or
receives a website credential. These jobs require the public CLI release first.

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
dispatch to oyzuai/oyzu. Configure OYZU_EXAMPLES_DISPATCH_APP_CLIENT_ID (variable)
and OYZU_EXAMPLES_DISPATCH_APP_PRIVATE_KEY (secret) for a dedicated dispatch App
installed only on Oyzu. GitHub requires contents write for repository dispatch;
the minted token requests only that permission. Do not share the receiving
updater App's key or give this App pull requests authority. Each run mints and
then revokes its token with the immutable-pinned GitHub action. Installation
tokens expire after an hour; never store one as a permanent repository secret.
The examples repository's ordinary default token is not assumed to have
cross-repository write access. Do not copy the site's deploy credential here.
The receiving workflow reads public checks anonymously, validates the exact commit and successful
native checks, updates a single bot-owned draft PR and lets the existing docs
workflow validate/render it. It never pushes website output.

Live publication checks require explicit disposable targets and credentials.
OCI file artifacts, native image publication, GitHub Release assets and native
package publication are separate capabilities. Use only explicitly identified
test witnesses; these cannot establish protected origin, keyless identity,
transparency or an unproved SLSA level. Preserve partial effects and use native
retrieval/consumer checks. Document resource cleanup before running a live job.
