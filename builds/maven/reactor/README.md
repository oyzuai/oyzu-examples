# Build and consume a Maven reactor

Run `oyzu install --frozen`, `oyzu build --plan`, `oyzu build` and `oyzu inspect dist`. Maven evaluates the parent and orders the shared library before the application. Select both delivered JAR paths from the bundle and run `java -cp "<application-jar><native-path-separator><library-jar>" example.Hello`. Expect `Hello from the reactor library.` The checkout POMs and local dependency remain native Maven configuration. This fast-build recipe verifies native packaging and consumption; integration-test and WAR reporting remain separate coverage.

## Native source

<!-- example-source: project/pom.xml -->

## Prerequisites and limits

Copy the complete project/ outside this collection, retain LICENSE, and use its ordinary configuration and tool lock. No platform account is required. Initial tool/dependency acquisition needs network access; offline use needs the exact prerequisites already cached. A failed native process or required report remains a failure. See the revision-specific verification record for the measured host, executor and artifact targets; no broader platform qualification is implied. Remove only outputs and temporary consumers you created.
