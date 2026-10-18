# Build only targets changed from a Git baseline

Two independent native applications demonstrate target selection separately from cache reuse. Copy project/ outside this collection and retain its licenses. Initialize and commit a local Git baseline before generating output, or use an existing clean baseline in your adopted repository. Git must be on PATH; Oyzu never fetches the comparison reference.

## Observe selection

Run `oyzu install --frozen`, commit the selected lock if it changed, then `oyzu build --full` and `oyzu inspect dist`. Run both delivered index.cjs files with the selected Node: expect Hello from api. and Hello from web. Run `oyzu build --affected HEAD --full`: no changes produce an inspectable empty bundle, without treating excluded targets as successful builds or carrying old artifacts forward.

Change api/src/index.cjs to print Updated api. and update its native test expectation. Run `oyzu build --affected HEAD --plan`, then `oyzu build --affected HEAD --full` and `oyzu inspect dist`. Require only api actions and its directory artifact, and run that delivered index.cjs. Expect Updated api. The selection record must identify web as excluded; exclusion is not reuse. A missing baseline or a changed shared configuration can conservatively select the full workspace.

## Native target ownership

<!-- example-source: project/build.yaml -->

## Prerequisites and limits

No account or credential is needed. Initial tool acquisition needs network access; offline builds need cached prerequisites. Native manifests own build/test commands and root oyzu.toml owns tools. Metadata and expectations are outside the copied project. This recipe demonstrates two independent targets; consumers of materialized artifacts are shown in the polyglot reference app. Required native failures remain failures. The exact verification record states the measured host; no remote planner or other-host qualification is implied. Remove only this copied project and outputs you created. See [affected target selection](https://docs.oyzu.ai/docs/reference/affected-builds).
