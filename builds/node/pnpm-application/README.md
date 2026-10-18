# Build the same application with pnpm

Use the native pnpm project and lock to build the same small original application or package. This focuses on manager selection, without introducing workspace complexity.

## Prerequisites

Use an Oyzu binary supporting this adapter and an explicitly provisioned `oyzu-toolchain/node:pnpm10.11.0-node22` executor with a supported Docker engine. The selected tool requirements remain in oyzu.toml. The image is an external prerequisite, not downloaded or silently replaced by this collection. Initial native dependency preparation needs network access. Yarn here means Classic only.

## Build and consume

Copy the complete project/ outside the collection; retain LICENSE. In that copy run:

```sh
oyzu build --plan
oyzu build --isolated
oyzu inspect dist
```

Run the delivered directory's index.cjs with Node and expect Hello from Node.

Read dist/manifest.json for the exact artifact, rather than assuming a generated filename. No account or deployment is involved. A plan or generated lock is not a successful execution. Use the catalog readiness and exact matching verification record; a native lock alone does not qualify this flow.

## Native source

<!-- example-source: project/package.json -->

## Recovery and limits

Missing SDK images or native packages must be provisioned explicitly; do not substitute an untracked host runtime. This recipe does not establish modern Yarn, native publication, multi-host qualification or deployment. Remove only this copy's outputs and temporary consumer when finished. Obtain the exact displayed source commit with git checkout before copying the project. See [native builds](https://docs.oyzu.ai/docs/reference/local-builds).
