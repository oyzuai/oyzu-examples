# Package an SDK-style .NET library

Produce a native NuGet package from a small SDK-style library.

## Prerequisites and status

This recipe requires Docker and uses Linux amd64 isolated execution. Run
`oyzu pin` to lock `oyzu:dotnet` (SDK 10.0.401 by default), then
`oyzu build --isolated`. Oyzu restores the locked SDK into the container and
pulls the `oyzu-execution/base:1` base image by digest. No separately provisioned
SDK executor or host-installed .NET SDK is required for this flow. See
[.NET provisioning](https://docs.oyzu.ai/docs/reference/dotnet#provisioning).

Product support is separate from example verification. Check the catalog and exact
verification subject before relying on a host, executor or target.

## Build and inspect

Copy the complete `project/` to a directory outside this collection. Run there:

```sh
oyzu pin
oyzu build --plan
oyzu build --isolated
oyzu inspect dist
```

The plan is not execution evidence. Initial tool/dependency acquisition needs
network access; offline replay requires the existing lock, cached SDK archive,
NuGet inputs and base image. Correct missing prerequisites before retrying. No
platform account or secret belongs in committed configuration.

Known limit: some stages may still rerun on a warm rebuild until
[oyzuai/oyzu#2516](https://github.com/oyzuai/oyzu/issues/2516) lands. A warm cache
does not guarantee that every stage is reused.

## Native configuration

The SDK project owns framework and package identity. This sample targets net10.0,
matching the default locked SDK. It has no third-party runtime dependency.

<!-- example-source: project/Greeting.cs -->

## Consume the delivered artifact

Use a separate console project targeting net10.0, add the delivered NuGet package from a directory-only NuGet source, and call Greeting.Hello(). Expect Hello from .NET. A restore from a public package feed would not verify this artifact.

The historical captured verification used an SDK 10.0.401 executor and recorded
its immutable identity with the independent package consumer. Those records do
not verify the current locked-tool flow. Earlier missing-image failures remain
historical evidence.

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
