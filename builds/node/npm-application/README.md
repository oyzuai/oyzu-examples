# Build a native npm application

Build a dependency-free Node application and run the delivered directory with Node.

## Prerequisites and status

Oyzu can acquire the declared Node and npm versions. This project uses the host npm dist-application path. No Docker engine, account or registry credentials are needed after tool acquisition.

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

The explicit node/app intent selects the documented dist convention for a custom native build script. The YAML selects the builder; tool versions stay in oyzu.toml. npm owns its native lock. The explicit lint script checks JavaScript syntax; the format script checks LF endings, final newlines and trailing whitespace. These small native checks do not claim a broader ESLint or Prettier audit.

<!-- example-source: project/src/index.cjs -->

## Consume the delivered artifact

Find the primary directory in dist/manifest.json and run its index.cjs using oyzu exec -- node /absolute/path/to/the/artifact/index.cjs. Expect exactly Hello from Node. The checkout source is not the delivered artifact.

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
