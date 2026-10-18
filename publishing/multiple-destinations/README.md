# Publish finalized files to OCI and GitHub

Build a small original Maven JAR, supply explicitly accepted existing signed provenance, and publish its unchanged bytes to several independently required destinations. Retrieve the payload and evidence with native interfaces and run the retrieved JAR. This is generic file publication, not a Maven repository upload or native OCI image publication.

## Prerequisites

Copy project/ outside this collection and retain LICENSE. Use a publisher-capable Oyzu binary and the selected Java/Maven tools. Separately provision a disposable anonymous loopback OCI Distribution registry and an existing GitHub tag plus test prerelease. Do not use a product release. The adapter never creates or finalizes releases, overwrites conflicting assets or rolls back earlier destinations.

Provide the GitHub credential privately through EXAMPLES_GITHUB_TOKEN, with access restricted to the test repository. Never put its value in configuration, logs or metadata. Native tool acquisition and publishing need network access; an offline publication cannot succeed.

## Build first

~~~sh
oyzu install --frozen
oyzu build
oyzu inspect dist
~~~

Read the exact regular-file artifact path, digest and output ID from the manifest. For this native JAR the selector is project/jar-hello; a primary output would use only its target ID. A successful build alone does not supply every publication prerequisite.

<!-- example-source: project/pom.xml -->

## Accept existing evidence and configure destinations

Use independently accepted provenance and signing roots. The local verification harness is an explicit test builder: it observes a real build, signs those observations before publishing, and clearly makes no protected-origin, keyless, transparency or SLSA-level claim. It cannot attest an earlier unobserved build. Production acceptance and managed controls remain separate.

~~~toml
[publish.destinations.local]
kind = "oci"
registry = "http://127.0.0.1:26111"
repository = "examples/files"
artifacts = ["project/jar-hello"]

[publish.destinations.github]
kind = "github-release"
apiUrl = "https://api.github.com"
repository = "your-owner/your-disposable-repository"
tag = "your-preexisting-test-tag"
tokenEnv = "EXAMPLES_GITHUB_TOKEN"
artifacts = ["project/jar-hello"]

[publish.requirements.provenance]
bundlePath = "build.sigstore.json"
publicKey = "<accepted builder public key>"
builderId = "<accepted exact builder identity>"

[publish.requirements.signing]
keyEnv = "PUBLICATION_SIGNING_SEED"
publicKey = "<matching publication public key>"
~~~

This is illustrative configuration requiring real evidence and roots. Keep it in the normal configuration owner; destination maps replace atomically across the cascade. Secret settings are environment references. Required managed controls still apply. Run:

~~~sh
oyzu publish --manifest dist/manifest.json --destination local --destination github
~~~

Publishing does not build, repackage, scan or execute project hooks. The artifact and accepted evidence must already exist. Inspect each destination's receipt; independent destinations are not an atomic transaction.

## Retrieve, repeat and recover

Use the recorded OCI digest reference with the registry's native manifest/blob GET interfaces. Verify manifest, payload, original provenance and publication-intent bytes and their identities. For GitHub, list the existing release's assets and download the JAR plus its .provenance.sigstore.json and .publication.sigstore.json assets. Verify both signatures and their exact subject. Run java -cp with the retrieved JAR and example.Hello; expect Hello from Maven.

Repeat the identical publication: matching content must reconcile as already-present. A changed genuine build at an occupied GitHub filename must refuse as PUBLISH_CONFLICT and leave the original bytes unchanged. For partial recovery, select two disposable registries with the second stopped: the first can succeed while the second fails. Start the second and retry the unchanged selection; reconcile the first and finish the remaining destination. Retain every failed/unfinished outcome; there is no automatic rollback.

## Reproduce the bounded live proof

From this collection checkout, provision two disposable registry containers separately: registry one running on 127.0.0.1:26111, registry two stopped under the name examples-proof-611-retry-registry on port 26112. Use the native Distribution image and record its immutable identity. Provision a separate examples-proof- test tag and prerelease with no unrelated assets.

Run verification/publication.mjs with an absolute CLI, this project path, the first registry URL, test owner/repository, test tag and output-record path. Set EXAMPLES_GITHUB_TOKEN and EXAMPLES_DOCKER_CLI privately. The harness starts the already provisioned second container for retry. It uses a unique native Maven version per attempt so an interrupted proof cannot collide with an earlier proof's filename. It independently verifies evidence and downloads; it does not fake provider responses.

Stop/remove only these disposable containers and delete the disposable test release/tag after inspection, using their recorded identities. Keep credentials and ephemeral keys out of retained records. Runtime images, caches and unrelated tags are not cleanup targets. The recorded result qualifies only its exact CLI, source, host and destinations. Native npm/Python/image publication and real production deployment remain catalog gaps. See [publication reference](https://docs.oyzu.ai/docs/reference/publish).
