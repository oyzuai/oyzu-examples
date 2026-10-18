# Consume a delivered npm package

Provision Docker and the compatible oyzu-toolchain/node:npm11.11.0-node22 captured executor first. This package build uses captured execution; the selected host Node/npm tools consume its delivered archive afterward. Run `oyzu install --frozen`, `oyzu build --plan`, `oyzu build --isolated --full` and `oyzu inspect dist`. Native discovery chooses node/package; no build.yaml is needed. Create a separate consumer directory, run the selected npm with `npm install --ignore-scripts --no-audit --no-fund --offline /absolute/path/to/the/delivered.tgz`, then call `require("oyzu-example-greeting").hello("developer")`. Expect `Hello, developer, from the delivered package.` The consumer must use the collected archive, without source links or a registry publication.

## Native source

<!-- example-source: project/index.cjs -->

## Prerequisites and limits

Copy the complete project/ outside this collection, retain LICENSE, and use its ordinary configuration and tool lock. No platform account is required. Initial tool/dependency acquisition needs network access; offline use needs the exact prerequisites already cached. A failed native process or required report remains a failure. See the revision-specific verification record for the measured host, executor and artifact targets; no broader platform qualification is implied. Remove only outputs and temporary consumers you created.
