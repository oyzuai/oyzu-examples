# Learning paths and coverage

Generated from coverage.json, learning-paths.json and per-recipe metadata.
Use verification records for exact subjects; structural checks do not run builds.

## Your first hour

Inspect a plan, build, inspect outputs and run native tests.

1. [Your first build](../getting-started/first-build/README.md)
2. [Build a native npm application](../builds/node/npm-application/README.md)
3. [Build a conventional Go command](../builds/go/command/README.md)

## Adopt an existing project

Preserve native conventions and add only necessary exceptions.

1. [Your first build](../getting-started/first-build/README.md)
2. [Order native tasks and build hooks](../workflows/tasks-and-hooks/README.md)
3. [Consume a delivered npm package](../builds/node/npm-package/README.md)
4. [Observe cache reuse and source invalidation](../workflows/incremental-builds/README.md)
5. [Acquire private dependencies without leaking credentials](#private-dependencies)

## Deliver a release

Build, inspect evidence, publish, retrieve and retry safely.

1. [Your first build](../getting-started/first-build/README.md)
2. [Publish finalized files to OCI and GitHub](../publishing/multiple-destinations/README.md)

## Coordinate a larger system

Connect workspaces, generators, artifacts and selected deployment mechanisms.

1. [Build related Go workspace modules](../builds/go/workspace/README.md)
2. [Build and consume a Maven reactor](../builds/maven/reactor/README.md)
3. [Build a release tool with a native Cargo workspace](../reference-apps/developer-tool/README.md)
4. [Separate host execution from artifact platforms](../workflows/platform-matrices/README.md)
5. [Serve a built frontend from a Go service](../reference-apps/polyglot-service/README.md)
6. [Serve the selected static artifact locally](../deployment/local-static/README.md)
7. [Connect an image and Helm chart](#image-chart-composition)
8. [Observe Kubernetes readiness and rollback](#kubernetes-deployment)

## Native baselines

| Recipe | Product support | Recipe readiness |
| --- | --- | --- |
| [Your first build](../getting-started/first-build/README.md) | implemented-partial | executable |
| [Build a native npm application](../builds/node/npm-application/README.md) | implemented-partial | executable |
| [Build a conventional Go command](../builds/go/command/README.md) | implemented-partial | executable |
| [Build a Python wheel](../builds/python/pip-package/README.md) | implemented-partial | executable |
| [Build a single-module Maven application](../builds/maven/application/README.md) | implemented-partial | executable |
| [Build a native Gradle application](../builds/gradle/application/README.md) | implemented-partial | experimental |
| [Package a conventional Ant application](../builds/ant/application/README.md) | implemented-partial | blocked |
| [Package an SDK-style .NET library](../builds/dotnet/library/README.md) | implemented-partial | experimental |
| [Build a minimal Docker file image](../builds/docker/file-image/README.md) | implemented-partial | executable |
| [Package a minimal Helm chart](../builds/helm/configmap/README.md) | implemented-partial | executable |
| [Build the same application with pnpm](../builds/node/pnpm-application/README.md) | implemented-partial | experimental |
| [Build the same application with Yarn Classic](../builds/node/yarn-classic-application/README.md) | implemented-partial | blocked |
| [Build a package with uv](../builds/python/uv-package/README.md) | implemented-partial | blocked |
| [Build a package with Poetry](../builds/python/poetry-package/README.md) | implemented-partial | blocked |
| [Serve a built frontend from a Go service](../reference-apps/polyglot-service/README.md) | implemented-partial | experimental |
| [Build a release tool with a native Cargo workspace](../reference-apps/developer-tool/README.md) | implemented-partial | experimental |
| [Publish finalized files to OCI and GitHub](../publishing/multiple-destinations/README.md) | implemented-partial | experimental |
| [Order native tasks and build hooks](../workflows/tasks-and-hooks/README.md) | implemented-partial | experimental |
| [Serve the selected static artifact locally](../deployment/local-static/README.md) | generic-task | experimental |
| [Consume a delivered npm package](../builds/node/npm-package/README.md) | implemented-partial | experimental |
| [Build related Go workspace modules](../builds/go/workspace/README.md) | implemented-partial | experimental |
| [Build and consume a Maven reactor](../builds/maven/reactor/README.md) | implemented-partial | experimental |
| [Observe cache reuse and source invalidation](../workflows/incremental-builds/README.md) | implemented-partial | experimental |
| [Separate host execution from artifact platforms](../workflows/platform-matrices/README.md) | implemented-partial | experimental |

## Gaps and assessments

No runnable project or Run action is supplied for these entries. Product support
and missing example qualification remain separate facts.

### pnpm-workspace

**Build a pnpm workspace**. Product support: implemented-partial; recipe readiness: planned.

Current pnpm support has bounded native lock and acquisition constraints; this collection has no qualified workspace recipe.

Next proof: Generate the real native lock, build two related packages and consume their delivered archives without workspace source links.

### yarn-classic-workspace

**Build a Yarn Classic workspace**. Product support: implemented-partial; recipe readiness: planned.

Yarn means Classic here. A current recipe and manager-owned lock must be exercised before publishing instructions.

Next proof: Build a Classic workspace through the captured manager and consume its packages independently.

### uv-library

**Build a uv-managed Python library**. Product support: implemented-partial; recipe readiness: planned.

The uv adapter exists, but this collection has no independently verified native uv lock and consumer.

Next proof: Generate uv.lock with the selected native uv, build the wheel and install it in an isolated consumer.

### poetry-package

**Build a Poetry-managed package**. Product support: implemented-partial; recipe readiness: planned.

Poetry support does not qualify every lock format or supply a recorded example.

Next proof: Lock a small package with native Poetry, build through Oyzu and install only its delivered wheel.

### legacy-python

**Build a legacy Python extension**. Product support: implemented-partial; recipe readiness: planned.

A legacy setup.py recipe needs a genuine native compiler prerequisite and a compiled-extension consumer proof.

Next proof: Build and import the delivered extension with the declared native prerequisites, keeping unrelated runtimes unavailable.

### gradle-composite

**Build a Gradle composite**. Product support: implemented-partial; recipe readiness: planned.

Composite builds and custom native test tasks need a focused recipe using the admitted Gradle contracts.

Next proof: Build an included library and application, consume the delivered result and verify the custom suite report.

### ant-tests

**Keep Ant assertions and coverage visible**. Product support: implemented-partial; recipe readiness: planned.

The packaging baseline does not qualify custom targets or JUnit/coverage collection.

Next proof: Run a real Ant test suite, inspect native reports, then introduce a failed assertion and require a failed Oyzu result.

### dotnet-solution

**Build a locked .NET solution**. Product support: implemented-partial; recipe readiness: planned.

The current .NET product proof is Linux captured and needs its explicitly provisioned SDK image; broad host support is unproved.

Next proof: Build a solution with locked restore and project references under SDK 10.0.401, consume its NuGet package and record exact SDK/host facts.

### image-chart-composition

**Connect an image and Helm chart**. Product support: implemented-partial; recipe readiness: planned.

Image output, directory materialization, chart bindings and deployment are separate contracts and still need a collection proof.

Next proof: Materialize a producer into an image, bind its immutable digest into a chart, and verify both delivered artifacts without deploying.

### helm-dependencies

**Package local Helm dependencies**. Product support: implemented-partial; recipe readiness: planned.

The basic chart has no dependency or umbrella-chart proof.

Next proof: Package a local library dependency, render the delivered umbrella chart and check the selected values and packaged dependency identity.

### private-dependencies

**Acquire private dependencies without leaking credentials**. Product support: implemented-partial; recipe readiness: planned.

The source fixtures are design contracts and bounded acquisition proofs; no public collection recipe has qualified disposable authenticated endpoints.

Next proof: Use scoped test repositories, acquire through supported routes and prove replay and reports contain no credential values.

### reports-and-failures

**Inspect reports and failed outputs**. Product support: implemented-partial; recipe readiness: planned.

The successful baselines do not cover all required failure/report scenarios.

Next proof: Fail a real native test after a successful build and require rejected acceptance, retained failed reports and no successful replacement artifact.

### npm-publication

**Publish a native npm package**. Product support: planned; recipe readiness: planned.

Native npm publication is agreed destination scope but is outside the current experimental file-artifact provider slice.

Next proof: After separate provider implementation, publish with native coordinates, retrieve with npm and install in a downstream project.

### python-publication

**Publish a native Python distribution**. Product support: planned; recipe readiness: planned.

Wheels and sdists wrapped in generic OCI objects do not implement native Python publication.

Next proof: After separate provider implementation, publish to a disposable Python index and install the retrieved distribution.

### native-image-publication

**Push a native OCI image**. Product support: planned; recipe readiness: planned.

Generic OCI file-artifact publication does not establish image manifests, layers, indexes or a downstream image pull.

Next proof: Qualify native image publication independently, then pull by immutable digest and run the delivered application.

### other-package-publication

**Assess other native package protocols**. Product support: planned; recipe readiness: planned.

Maven repositories, NuGet, Cargo registries and chart repositories need separate provider and retrieval assessments.

Next proof: Select one concrete protocol and qualify native coordinates, authentication, retrieval, conflict and retry behavior before offering runnable commands.

### other-distribution

**Assess static assets and release binaries**. Product support: planned; recipe readiness: planned.

Release-binary and object/static distribution mechanisms have independent requirements; a generic upload is not their qualification.

Next proof: Select a protocol and scoped test target, retrieve exact payload/evidence and verify its native consumption.

### kubernetes-deployment

**Observe Kubernetes readiness and rollback**. Product support: planned; recipe readiness: planned.

The public deployment-kind contract is draft and is not implemented by a kind SDK or oyzu kind command. A chart build is not an observed deployment.

Next proof: Select a real public integration or explicit external-tool task, deploy an immutable artifact, observe readiness, update and roll back with cleanup.

### machine-deployment

**Activate a service on a disposable machine**. Product support: planned; recipe readiness: planned.

No machine/service provider has been selected or qualified for this collection.

Next proof: Deliver one immutable package to an authorized machine, activate it, observe health and document rollback/cleanup.

### cloud-deployment

**Assess cloud application and serverless targets**. Product support: planned; recipe readiness: planned.

No cloud provider or account scope is selected; desired-state submission alone is not a deployment proof.

Next proof: Choose one public provider integration with scoped credentials and observe the destination serving the selected artifact.

### infrastructure-changes

**Preview and apply infrastructure explicitly**. Product support: generic-task; recipe readiness: planned.

Invoking an external infrastructure tool through tasks does not establish a native graph or policy-authority integration.

Next proof: Use a disposable scoped target, review a native preview, apply only the authorized change and inspect actual outputs/cleanup.

### release-promotion

**Promote the same artifact across environments**. Product support: planned; recipe readiness: planned.

Environment names grant no authority and the collection has no qualified promotion provider.

Next proof: Promote one existing immutable artifact through selected environments without rebuilding, checking authority and observed destination identity.

### ci

**Use Oyzu from CI without private source**. Product support: implemented-partial; recipe readiness: planned.

Public example execution needs an approved downloadable CLI and checksum until a public engine release exists.

Next proof: Configure a public approved binary, verify its checksum, run affected recipes on PRs and retain exact non-secret records.

### assess-make

**Assess Make**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Make integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-cmake

**Assess CMake**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native CMake integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-meson-ninja

**Assess Meson and Ninja**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Meson and Ninja integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-bazel

**Assess Bazel**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Bazel integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-buck2

**Assess Buck2**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Buck2 integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-pants

**Assess Pants**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Pants integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-nx

**Assess Nx**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Nx integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-turborepo

**Assess Turborepo**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Turborepo integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-bun

**Assess Bun**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Bun integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-deno

**Assess Deno**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Deno integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-modern-yarn

**Assess Modern Yarn**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Modern Yarn integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-sbt

**Assess sbt**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native sbt integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-nix

**Assess Nix**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Nix integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-swift-xcode

**Assess SwiftPM and Xcode**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native SwiftPM and Xcode integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-ruby

**Assess Bundler and Rake**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Bundler and Rake integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-elixir

**Assess Mix**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Mix integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-dart-flutter

**Assess Dart and Flutter**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Dart and Flutter integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

### assess-haskell

**Assess Cabal and Stack**. Product support: unsupported; recipe readiness: planned.

This collection has no qualified native Cabal and Stack integration. A generic task invocation is not native graph, acquisition, artifact or evidence support.

Next proof: Select a concrete native project and ownership contract, then prove its real build, dependency capture, delivered artifact and consumer before adding a runnable recipe.

