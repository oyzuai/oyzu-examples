# Separate host execution from artifact platforms

Run `oyzu install --frozen`, `oyzu build --plan` and `oyzu build --full` for the native Rust host lane. Run its delivered executable with developer; expect Hello, developer! Built with Oyzu. Then provision the documented Rust cross-platform executor, locked target toolchains and Docker before running `oyzu build --all-platforms --full`. The complete matrix is a separate experimental flow; a host build does not qualify it. Missing target SDKs, locked-tool handoffs or matching executor images must fail explicitly.

The complete matrix is currently blocked beyond image provisioning: restoring a
locked Linux Rust installation from a Windows controller is unfinished, and the
current reference does not qualify general cross-compilation. Treat the matrix
command as a future proof obligation, not a runnable promise that installing an
image alone fixes. The working native host lane remains useful independently.
The next full proof needs a controller capable of the supported locked-worker
handoff, the declared target SDKs and compatible executors; implementing a missing
handoff or provider is separate product work.

After a successful matrix build, inspect the bundle: require all three declared artifact platforms, distinct platform outputs and successful required reports. Run the Windows output on Windows. Provide EXAMPLES_LINUX_CONSUMER_IMAGE as an already provisioned compatible Linux runtime image for the independent Linux amd64 consumer. Inspect the Linux arm64 executable header; this does not claim arm64 runtime execution. The configuration declares artifact intent only; Rust selection stays in oyzu.toml and oyzu.lock. No runtime version axis is put in build.yaml. The current reference records the remaining experimental matrix limits.

## Native source

<!-- example-source: project/build.yaml -->

## Prerequisites and limits

Copy the complete project/ outside this collection, retain LICENSE, and use its ordinary configuration and tool lock. No platform account is required. Initial tool/dependency acquisition needs network access; offline use needs the exact prerequisites already cached. A failed native process or required report remains a failure. See the revision-specific verification record for the measured host, executor and artifact targets; no broader platform qualification is implied. Remove only outputs and temporary consumers you created.

See [Rust artifact platforms](https://docs.oyzu.ai/docs/reference/rust) for executor and target-toolchain prerequisites. This recipe does not claim that Oyzu's full CLI binary matrix or automatic Linux worker installation is qualified.
