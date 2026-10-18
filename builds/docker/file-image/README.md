# Build a minimal Docker file image

Build a scratch image containing a known file and inspect those bytes in the delivered OCI output.

## Prerequisites and status

The admitted scratch/COPY subset is assembled natively by Oyzu without an engine. The independent consumer check uses Docker to load the delivered OCI archive and copy its known file from a stopped container. This image has no base-image download or executable application. Image construction does not establish image publication or a deployed service.

This recipe is executable with the stated prerequisites. Product support is
separate from example verification. Check the catalog and exact
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

Dockerfile owns the image contents. The scratch base deliberately avoids a dependency on a mutable base tag. No language target should be inferred from this Dockerfile-only project.

<!-- example-source: project/Dockerfile -->

## Consume the delivered artifact

Inspect the delivered OCI archive with an OCI-aware tool and require /message.txt to contain Hello from the image. Compare the delivered image identity before any push. Do not describe an image build as a downstream pull or deployment.

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
