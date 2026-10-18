# Contributing

Submit focused changes through a draft pull request and link the tracking issue.
Preserve unrelated work, source provenance, copyright and applicable notices.
Contributions of original first-party code and documentation use Apache-2.0;
do not add third-party material without identifying its source, license and
obligations. The license text is the unmodified Apache Software Foundation text
from https://www.apache.org/licenses/LICENSE-2.0.txt.

Each recipe owns a README, external `example.json`, and a self-contained
`project/`. Keep expected results outside the project. Prefer native discovery;
tool requests belong in the ordinary Oyzu configuration, not build YAML or the
catalog. Generate native locks with native tools through Oyzu; never fabricate
them. Include a license in projects that readers copy independently.

Verify a committed recipe in a temporary directory outside the repository with
the real Oyzu CLI, then inspect and consume its delivered artifact. Record exact
example and CLI identities, tools, host, executor, target, commands and limits.
An executable recipe is not automatically verified. Unavailable checks must
remain blocked or unverified, and an old result does not qualify changed bytes.
Do not execute live publication or deployment without scoped targets and explicit
credentials; document cleanup and preserve partial outcomes.

Build engines, package managers, runtimes and orchestrators are different catalog
facts. A generic task integration is not a native builder. Keep optional governed
flows separate from standalone onboarding. No private product/platform source or
credentials belong in this collection.

The Oyzu docs site selects content at an immutable commit. Fix recipe prose here;
do not maintain a second command list in the website. Respect existing links and
stable recipe IDs when moving content.

Merge with a merge commit. The repository disables squash and rebase merges so
documentation pins remain reachable through the default branch's history.
Never rewrite or discard pinned commits without retaining their original bytes
and identities in an agreed source archive. A local preparation cache also keeps
named refs; it is not permission to remove the canonical history.
