# Your first build

Build a small Rust command-line application and run the delivered executable.
Oyzu discovers the conventional Cargo project; no `build.yaml` is needed.
The application accepts a name and prints a greeting.

## Prerequisites

Use an existing Oyzu installation. Rust 1.99.1 is selected through the ordinary
`oyzu.toml` configuration and `oyzu.lock`, independently of build intent.
No platform account, dependencies, credentials or external service is needed.
Installation may need network access; offline replay needs cached tools.

## Build and inspect

Copy the entire `project/` directory to a new directory outside this collection,
then run these commands there:

```sh
oyzu install --frozen
oyzu build --plan
oyzu build
oyzu inspect dist
```

The plan is a preview. Only a successful build and inspected artifact establish
that output was produced. Read `dist/manifest.json` to locate the primary
artifact; do not guess its versioned filename. Run the delivered executable
with the argument `developer`. Expect exactly:

```text
Hello, developer! Built with Oyzu.
```

The external verification helper performs that consumer check and records the
CLI binary identity, example revision and host. Its expectations stay outside
the copied project. A failure remains a failure; it does not become a verified
badge by skipping an unavailable tool or executor.

## Configuration and source

The only Oyzu configuration selects Rust. Cargo owns the package version,
edition, sources and unit test. The application is not published to crates.io.

<!-- example-source: project/src/main.rs -->

## Failures and cleanup

Missing tools require `oyzu install --frozen`; offline installation requires
cached acquisition data. Correct native compilation or test errors before
retrying. An uninspected partial output is not a delivered artifact. Remove
only this copy's `dist/`, `target/` and `.oyzu/` when finished; installed shared
tools are separate and may be used by other projects.

## Support and exact revision

Product support and recipe verification are separate catalog facts. Only hosts
and profiles named in a successful verification record are qualified. This
recipe does not establish captured execution or cross-compilation support.
Use the commit shown by the documentation page's source link to obtain the
matching project with `git checkout <that-exact-commit>` in this repository.

See [native local builds](https://docs.oyzu.ai/docs/reference/local-builds) and
[Rust builds](https://docs.oyzu.ai/docs/reference/rust) for current behavior.
