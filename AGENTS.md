# Examples repository instructions

## Verification execution policy

Maintainer decision (2026-10-24): GitHub Actions is paused for this repository,
on both GitHub-hosted and self-hosted runners. Bounded local proofs and the
applicable local repository checks are the normal acceptance path. This decision
supersedes older instructions to wait for hosted CI or use Actions for routine
verification, including older billing/plan exceptions.

- Keep Actions disabled. Do not enable, dispatch or rerun workflows, start or
  restart Actions workers, or arrange substitute paid/cloud CI without Micah's
  fresh explicit approval for the named repository, workflow and run scope.
  New hardware, restored billing, a push, an old approval or a recurring brief
  does not reactivate Actions. A one-off approval does not authorize restoring
  automatic push, pull-request or scheduled execution generally; return to the
  prior disabled state after the approved scope.
- Run the applicable bounded local checks and real user-flow proofs. Record the
  exact revision, commands, results and limitations. Report Actions as
  intentionally disabled/unrun, never passed. Preserve required safety,
  trust/compliance checks, observed failures and honest platform coverage.
  Do not silently change branch protection or merge/approval authority.
- Carry this policy into coordinator/worker briefs and relay it to existing
  workers; editing a file does not prove running sessions reloaded it. Ordinary
  authorized local Docker/WSL proofs or an already-authorized remote development
  workspace may continue under their resource rules, without an Actions worker.
- Preserve workflow definitions and runner installations for a future approved
  run. Do not delete source, retained evidence or installed tools under this policy.

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
