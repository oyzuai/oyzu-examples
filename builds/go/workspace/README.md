# Build related Go workspace modules

Run `oyzu install --frozen`, `oyzu run list`, `oyzu build --plan`, `oyzu build --full` and `oyzu inspect dist`. Native go.work owns both modules. Run the delivered service executable and expect `Hello from the workspace library.` Change the shared implementation to return `Updated workspace library.`, build again, and run the newly collected executable. The output must change without downloading a public substitute for the contained module. Native Go supplies the relationship; this is not two unrelated Oyzu targets.

This workspace uses the captured Go executor on the measured Windows host.
Provision Docker and the Go SDK image oyzu-toolchain/go:1.24-mod0.25.0 with a
compatible compiled Oyzu worker first. An old image without that worker cannot execute the build. Use
the ordinary `--image go=<provided-image>` override when appropriate; the
collection verifier accepts EXAMPLES_GO_IMAGE and records the immutable image
identity. Run the delivered Linux executable in a compatible Linux container,
without source mounts or networking, when the build host is Windows. A Windows
controller is not evidence that the artifact targets Windows.

## Native source

<!-- example-source: project/go.work -->

## Prerequisites and limits

Copy the complete project/ outside this collection, retain LICENSE, and use its ordinary configuration and tool lock. No platform account is required. Initial tool/dependency acquisition needs network access; offline use needs the exact prerequisites already cached. A failed native process or required report remains a failure. See the revision-specific verification record for the measured host, executor and artifact targets; no broader platform qualification is implied. Remove only outputs and temporary consumers you created.
