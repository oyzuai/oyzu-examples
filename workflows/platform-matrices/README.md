# Separate host execution from artifact platforms

Run `oyzu install --frozen`, `oyzu build --plan` and `oyzu build --full` for the native host lane. Run its delivered executable. Then provision the documented Linux Go executor and Docker and run `oyzu build --all-platforms --full`. Inspect the bundle: require all three declared artifact platforms, distinct platform outputs and successful required reports. Run the Windows output on Windows and the Linux amd64 output in the provided Linux executor. Inspect the Linux arm64 executable header; this does not claim arm64 runtime execution. The configuration declares artifact intent only; compiler selection stays in oyzu.toml and oyzu.lock. No runtime version axis is put in build.yaml.

## Native source

<!-- example-source: project/build.yaml -->

## Prerequisites and limits

Copy the complete project/ outside this collection, retain LICENSE, and use its ordinary configuration and tool lock. No platform account is required. Initial tool/dependency acquisition needs network access; offline use needs the exact prerequisites already cached. A failed native process or required report remains a failure. See the revision-specific verification record for the measured host, executor and artifact targets; no broader platform qualification is implied. Remove only outputs and temporary consumers you created.
