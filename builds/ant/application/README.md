# Package a conventional Ant application

Use native Ant targets to compile and package a Java application.

## Prerequisites and status

The captured Ant builder needs its documented provisioned native Java/Ant executor. Ant acquisition is not supplied by adding an invented tool provider. See the current Ant reference before running.

Product support is separate from example verification. Check the catalog and exact
verification subject before relying on a host, executor or target.

## Build and inspect

Copy the complete `project/` to a directory outside this collection. Run there:

```sh
oyzu build --plan
oyzu build --isolated
oyzu inspect dist
```

The plan is not execution evidence. Initial tool/dependency acquisition needs
network access; offline replay requires the corresponding cache and provisioned
executor. Correct missing prerequisites before retrying. No platform account or
secret belongs in committed configuration.

## Native configuration

build.xml owns compile and jar prerequisites. The project has no external Java dependencies. The native target graph supplies the packaging order.

<!-- example-source: project/build.xml -->

## Consume the delivered artifact

Inspect the delivered JAR, then run java -cp `<delivered-jar>` example.Hello with a compatible provisioned JDK. Expect Hello from Ant.

The executor is provisioned from Oyzu's existing Ant image definition. Its
immutable identity is recorded with the independent consumer. Earlier missing-image
failures remain historical evidence and do not qualify this successful subject.

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
