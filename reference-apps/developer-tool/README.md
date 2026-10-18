# Build a release tool with a native Cargo workspace

A small developer tool combines a library, procedural macro and build script using native Cargo workspace semantics. Changing the generator input changes the delivered tool.

## Build from a clean copy

Copy the complete project/ outside the collection, retain LICENSE, and use the Oyzu binary revision recorded by verification. Install the normal pinned tool environment and run:

```sh
oyzu install --frozen
oyzu build --plan
oyzu build
oyzu inspect dist
```

The plan is read-only preview, not execution evidence. Initial tool and dependency preparation requires network access. No platform account, production credential or private source is required. The verified host/profile is a separate fact from the requested artifact platform.

## Native project

<!-- example-source: project/app/build.rs -->

## Observe the delivered result

Run the delivered codebook executable and expect Release channel: stable. Change channel.txt to preview, rebuild, inspect the new bundle, and run its delivered executable: expect Release channel: preview. The library, procedural macro and generated source are native Cargo relationships; build.rs declares its generator input with rerun-if-changed. Compare artifact digests and native results. A plain build does not claim tests or publication. Repeat an unchanged build to inspect current cache outcomes; host caching support is distinct from captured caching.

## Related concepts and limits

Start with [a first build](../../getting-started/first-build/README.md) and the relevant native baselines in the catalog. The workspace has no third-party crate dependencies. The release artifact contains original code and Rust runtime dependencies with their own distribution obligations; the root Apache license does not relicense the runtime. See the file-publication recipe for evidence and destination semantics.

Failures remain visible: correct the native prerequisite or reported project problem and rerun. Do not replace a failed provider with fake success. Delete only this copy's build outputs and test processes when finished. Obtain the exact documentation source commit with git checkout before copying. See [native builds](https://docs.oyzu.ai/docs/reference/local-builds) and [artifact materialization](https://docs.oyzu.ai/docs/reference/target-workspaces).
