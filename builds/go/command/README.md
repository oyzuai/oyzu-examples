# Build a conventional Go command

Build and run a small Go command without build YAML or module dependencies.

## Prerequisites and status

Oyzu can acquire Go 1.24.13. This recipe requests host execution; it does not qualify cgo or cross-compilation.

This recipe is executable with the stated prerequisites. Product support is
separate from example verification. Check the catalog and exact
verification subject before relying on a host, executor or target.

## Build and inspect

Copy the complete `project/` to a directory outside this collection. Run there:

```sh
oyzu build --plan
oyzu build
oyzu inspect dist
```

The plan is not execution evidence. Initial tool/dependency acquisition needs
network access; offline replay requires the corresponding cache and provisioned
executor. Correct missing prerequisites before retrying. No platform account or
secret belongs in committed configuration.

## Native configuration

go.mod supplies native module identity and the language version. oyzu.toml selects the tool release. There is no go.sum because the module has no external dependencies.

<!-- example-source: project/main.go -->

## Consume the delivered artifact

Find the primary executable in dist/manifest.json, run that exact file, and expect Hello from Go.

Use recorded artifact paths and identities. This baseline build does not claim
tests, coverage, lint or format checks that were not selected. Failed checks and
partial output never become a green verification record.

## Recovery, cleanup and exact revision

Read native error output and correct the reported prerequisite or project error
before rerunning. Do not substitute an untracked compiler, fabricated lock or
fake engine. Remove only this copy's local build/cache/output directories when
finished; do not remove shared installed tools or another task's resources. No
live publication or deployment is performed by this recipe.

Obtain the exact commit named by the documentation's canonical source link with
`git checkout <that-commit>`. Copy the matching entire project and retain LICENSE.
See [current native build support](https://docs.oyzu.ai/docs/reference/local-builds).
