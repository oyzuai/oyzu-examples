# Build a package with uv

Use the native uv project and lock to build the same small original application or package. This focuses on manager selection, without introducing workspace complexity.

## Prerequisites

Use an Oyzu binary supporting this adapter and an explicitly provisioned `oyzu-toolchain/uv:0.12.21-python3.12` executor with a supported Docker engine. This captured lane uses the image's uv and CPython runtime, with native requires-python constraining compatibility. The image is an external prerequisite, not downloaded or silently replaced by this collection. The inspected plan and dependency snapshot record its immutable identity and manager version; verification records the actual consumer interpreter. Initial native dependency preparation needs network access.

The current Python captured adapter cannot hand off explicitly pinned Python tools. This recipe therefore has no oyzu.toml and does not claim managed uv acquisition or locked Python execution. It uses the documented provided-runtime contract, without hiding its prerequisites. Keep tool pins for supported host/worker flows separate.

## Build and consume

Copy the complete project/ outside the collection; retain LICENSE. In that copy run:

```sh
oyzu build --plan
oyzu build --isolated
oyzu inspect dist
```

Install the delivered wheel into a fresh virtual environment in a separate instance of the recorded executor, with networking disabled and only the delivered wheel directory mounted read-only. Use pip --no-index --no-deps, then import greeting with isolated Python (-I) from outside the source tree. Expect Hello from Python. No source checkout, editable install or public-feed restore may supply the package.

Read dist/manifest.json for the exact artifact, rather than assuming a generated filename. No account or deployment is involved. A plan or generated lock is not a successful execution. Use matching verification records for the exact source, manager, runtime, controller and target; earlier unsupported tool-preparation attempts remain unsuccessful history.

## Native source

<!-- example-source: project/pyproject.toml -->

## Recovery and limits

Missing SDK images or native packages must be provisioned explicitly; do not substitute an untracked host runtime. This recipe does not establish modern Yarn, native publication, multi-host qualification or deployment. Remove only this copy's outputs and temporary consumer when finished. Obtain the exact displayed source commit with git checkout before copying the project. See [native builds](https://docs.oyzu.ai/docs/reference/local-builds).
