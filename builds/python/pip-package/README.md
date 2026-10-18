# Build a Python wheel

Build a small importable Python package using the native setuptools backend.

## Prerequisites and status

Oyzu can acquire the selected CPython 3.13 line. Initial preparation needs access to the native build-backend packages. This package has no runtime dependencies.

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

pyproject.toml owns package metadata and the native build backend. The normal configuration selects Python. No custom build YAML or orchestration script is needed.

<!-- example-source: project/src/greeting/__init__.py -->

## Consume the delivered artifact

Find the delivered wheels directory in dist/manifest.json and require exactly one wheel inside it, create a disposable virtual environment with the selected Python, install that exact wheel using pip --no-index --no-deps, then import greeting and require greeting.hello() to return Hello from Python. Installing the source tree does not verify the delivered wheel.

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
