# Build a native Gradle application

Build a Java application through Gradle and consume its delivered JAR.

## Prerequisites and status

Use Oyzu's normal Gradle 8.14.3 and Java 17 tool selections. This conventional Java plugin project can build natively on the host; Oyzu prepares the selected tools, so a Docker executor is not required for this baseline. Initial native tool preparation may need network access. Captured execution is a separate lane requiring the explicitly provisioned oyzu-toolchain/gradle:8.14.3-jdk17 executor and a supported Docker engine.

Product support is separate from example verification. Check the catalog and exact
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

To exercise the captured lane separately, run `oyzu build --isolated` with its
provisioned executor. The collection verifier selects that lane only when
EXAMPLES_GRADLE_CAPTURED=1; ordinary verification uses the native host. A native
host result does not qualify the captured executor.

## Native configuration

Gradle's conventional Java plugin produces the JAR. The consumer explicitly selects the main class. Tool selection stays in the normal configuration. There is no generated wrapper or separate Oyzu workflow language. This baseline does not exercise the application plugin's optional distribution tasks or claim those outputs passed.

<!-- example-source: project/build.gradle -->

## Consume the delivered artifact

Read the delivered JAR path from dist/manifest.json and run it with the selected java -cp `<delivered-jar>` example.Hello. Expect Hello from Gradle.

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
