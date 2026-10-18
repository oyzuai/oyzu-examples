# Deliver two related pnpm workspace packages

Build a small greeting library and its application package with native pnpm
workspace discovery. Consume both delivered archives in a new directory, without
workspace links or access to the original source. This is the next step after
the single-package pnpm recipe.

## Prerequisites

Use an Oyzu binary with the captured pnpm workspace adapter and Windows Linux-link
preparation fix when controlling the build from Windows, Docker and the
already provisioned `oyzu-toolchain/node:pnpm10.11.0-node22` image. Node and pnpm
requirements belong in project/oyzu.toml and the native packageManager field.
Initial tool preparation needs network access; the projects have no external
runtime dependencies. A generated native lock is not verification.

## Current verification boundary

The recorded Windows controller and Linux captured executor build both archives,
run the required package tests/quality checks, and install only those archives
into an independent offline consumer. Use the exact CLI digest and recipe tree
in the successful record. Earlier CLIs failed with Unsupported reparse point type
after version projection; that unsuccessful record remains preserved. The fix
handles Docker/WSL Linux links in private execution copies and does not authorize
native Windows symlink recreation or broader filesystem access.

## Build and inspect

Copy the entire project/ directory outside the collection, preserving each
LICENSE. Run from that copy:

```sh
oyzu build --plan
oyzu build --isolated --full
oyzu inspect dist
```

No build.yaml is necessary. pnpm owns workspace membership and local links;
Oyzu orders the packages by their native dependency and projects the delivered
snapshot versions into their package manifests. The source lock and manifests
must remain unchanged. Inspect dist/manifest.json for both archive paths and
their versions. Required package tests and quality checks must pass.

## Consume the delivered packages

Create a separate empty consumer directory with a package.json containing
`{"private":true}`. Replace LIBRARY_ARCHIVE and APPLICATION_ARCHIVE with the
absolute paths from the inspected bundle. Run the following from the copied
project; CONSUMER is the absolute consumer directory:

```sh
oyzu exec -- npm install --prefix CONSUMER --offline --ignore-scripts --no-audit --no-fund LIBRARY_ARCHIVE APPLICATION_ARCHIVE
oyzu exec -- node -e "console.log(require('CONSUMER/node_modules/oyzu-example-workspace-app').greet('developer'))"
```

Use forward slashes in the Node expression on Windows. Expect
`Hello, developer, from the delivered workspace.` The consumer has no workspace
source links and must install only the two archives. Inspection alone does not
prove this relationship works. The collection verifier also checks that both
installed packages are regular directories, the application's dependency equals
the delivered library version, and both packages retain their license.

## Native source

<!-- example-source: project/pnpm-workspace.yaml -->

<!-- example-source: project/packages/app/package.json -->

## Recovery and limits

Missing executors are prerequisites, not permission to install an ambient
replacement. Regenerate a stale pnpm lock with native pnpm through Oyzu and
commit it before verification. Remove only the copied project outputs and its
consumer directory after testing. Check out the exact displayed source commit
before copying. See [native builds](https://docs.oyzu.ai/docs/reference/local-builds).

This dependency-free two-package proof does not qualify private registries,
modern Yarn, every pnpm release, publication or deployment. Host controller,
captured worker and delivered target remain separate recorded facts.
