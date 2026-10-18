# Observe cache reuse and source invalidation

Provision the documented npm/Node captured executor and Docker first. Run `oyzu build --isolated --full`, inspect dist, and run the delivered index.cjs. Repeat the same build: the bundle must retain the same artifact digest and identify restored work with its original producer, rather than describing old tests as fresh. Change `Hello from Node.` in src/index.cjs to `Updated from Node.`, update its native test expectation, and rebuild. Run the changed delivered application. Finally use `oyzu build --isolated --full --no-cache`: output must agree with the changed build while actions execute freshly. Do not delete shared caches to manufacture a miss.

## Native source

<!-- example-source: project/src/index.cjs -->

## Prerequisites and limits

Copy the complete project/ outside this collection, retain LICENSE, and use its ordinary configuration and tool lock. No platform account is required. Initial tool/dependency acquisition needs network access; offline use needs the exact prerequisites already cached. A failed native process or required report remains a failure. See the revision-specific verification record for the measured host, executor and artifact targets; no broader platform qualification is implied. Remove only outputs and temporary consumers you created.
