# Package a minimal Helm chart

Package a small Helm chart and render its delivered archive without a cluster.

## Prerequisites and status

Use the current documented Helm executor and provisioned Helm release. No Kubernetes cluster or account is needed for packaging and template rendering. This does not verify a deployment.

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

Chart.yaml, values.yaml and native templates own chart metadata and Kubernetes rendering. This chart has no chart dependencies or image reference.

<!-- example-source: project/templates/configmap.yaml -->

## Consume the delivered artifact

Read the chart archive path from dist/manifest.json, then use the selected native helm template on that archive. Require a ConfigMap named hello-greeting with data.message equal to Hello from Helm. No desired-state manifest is a readiness observation.

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
