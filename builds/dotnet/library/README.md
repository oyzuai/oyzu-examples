# Package an SDK-style .NET library

Produce a native NuGet package from a small SDK-style library.

## Prerequisites and status

Current Oyzu .NET support requires the separately provisioned Linux captured SDK 10.0.401 executor. There is no host adapter or automatic .NET SDK installer. Do not treat the presence of dotnet on Windows as equivalent qualification.

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

## Native configuration

The SDK project owns framework and package identity. This sample targets net10.0, following the currently qualified captured SDK. It has no third-party runtime dependency.

<!-- example-source: project/Greeting.cs -->

## Consume the delivered artifact

Use a separate console project targeting net10.0, add the delivered NuGet package from a directory-only NuGet source, and call Greeting.Hello(). Expect Hello from .NET. A restore from a public package feed would not verify this artifact.

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
