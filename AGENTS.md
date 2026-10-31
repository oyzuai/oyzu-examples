# Examples repository instructions

## Issue taxonomy

Before creating, splitting, transferring or reclassifying an issue in any
`oyzuai` repository, read and apply the shared
[`classify-issues` skill](https://github.com/oyzuai/agent-workflows/blob/main/skills/classify-issues/SKILL.md) and its bundled
[taxonomy catalog](https://github.com/oyzuai/agent-workflows/blob/main/skills/classify-issues/references/taxonomy.json).
Explicitly fetch these files with repository tools if the skill is not installed;
a link is not an automatic import. Apply exactly one `type:*` and one or two
`area:*` labels, with relevant optional ecosystem, surface, host and concern
labels. Leave priority unset without recorded triage. Preserve `agent:*` and
other workflow labels; read back the issue to verify classification. Keep the
vocabulary in the shared catalog rather than copying it into this repository.
This applies only to authorized issue work and grants no additional authority.

Follow CONTRIBUTING.md. Keep first-party sample projects under Apache-2.0 and
preserve each copied project's LICENSE. No upstream sample source is imported.
Tool binaries and dependencies retain their upstream licenses.

Start scoped work with a draft PR. Keep product support, example maturity and
revision-specific verification separate. Never mark skipped or mocked checks
as live support. Use the installed Oyzu CLI for native builds and tool execution;
do not install compilers outside Oyzu or implement an examples-only engine.

Each project must work when copied outside this repository. Expectation and
verification material stays outside it. Preserve failed results, exact subject
revisions and known host/executor/target limits. Use native manifests and normal
Oyzu configuration rather than catalog metadata as a tool authority.

Do not publish private Oyzu or platform source, credentials, raw proof logs or
local machine paths. Verify source provenance before importing any material.
