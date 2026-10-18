# Examples repository instructions

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
