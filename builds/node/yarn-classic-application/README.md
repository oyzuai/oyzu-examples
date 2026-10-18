# Build the same application with Yarn Classic

Use the native yarn project and lock to build the same small original application or package. This focuses on manager selection, without introducing workspace complexity.

## Prerequisites

Use an Oyzu binary supporting this adapter and an explicitly provisioned `oyzu-toolchain/node:yarn1.22.22-node22` executor with a supported Docker engine. Node selection remains in oyzu.toml. Yarn Classic is an executor prerequisite rather than an Oyzu-managed tool: package.json declares yarn@1.22.22, the native lock selects Classic, and preparation records the manager version and immutable executor identity. Do not add a tools.yarn request: the current tool installer does not admit it. The image is not downloaded or silently replaced by this collection. Initial native dependency preparation needs network access. Modern Yarn remains unsupported.

## Build and consume

Copy the complete project/ outside the collection; retain LICENSE. In that copy run:

```sh
oyzu build --plan
oyzu build --isolated --full
oyzu inspect dist
```

Run the delivered directory's index.cjs with Node and expect Hello from Node.

Read dist/manifest.json for the exact artifact, rather than assuming a generated filename. The full build requests native tests, coverage, lint and format checks. No account or deployment is involved. A plan or generated lock is not a successful execution. Use the matching verification record for the exact source, CLI and executor boundary; the earlier unsupported managed-tool request remains an unsuccessful historical record.

## Native source

<!-- example-source: project/package.json -->

## Recovery and limits

Missing SDK images or native packages must be provisioned explicitly; do not substitute an untracked host runtime. This recipe does not establish modern Yarn, native publication, multi-host qualification or deployment. Remove only this copy's outputs and temporary consumer when finished. Obtain the exact displayed source commit with git checkout before copying the project. See [native builds](https://docs.oyzu.ai/docs/reference/local-builds).
