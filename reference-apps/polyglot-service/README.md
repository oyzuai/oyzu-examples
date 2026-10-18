# Serve a built frontend from a Go service

Two independently built native targets produce a static frontend and a Go service. Oyzu materializes the verified frontend directory for the service; Go embeds those exact files. Run the delivered executable and observe both HTTP responses without checkout files.

## Build from a clean copy

Copy the complete project/ outside the collection, retain LICENSE, and use the Oyzu binary revision recorded by verification. Install the normal pinned tool environment and run:

```sh
oyzu install --frozen
oyzu build --plan
oyzu build
oyzu inspect dist
```

The plan is read-only preview, not execution evidence. Initial tool and dependency preparation requires network access. No platform account, production credential or private source is required. The verified host/profile is a separate fact from the requested artifact platform.

## Native project

<!-- example-source: project/build.yaml -->

## Observe the delivered result

Read the service executable path from dist/manifest.json and start it with --listen 127.0.0.1:8099. Request http://127.0.0.1:8099/ and /api/hello. Expect the delivered HTML and a JSON greeting. The static assets are embedded from the materialized web artifact at compilation; the process does not read checkout files. Stop that process after inspection. This is a local service observation, not a cloud or Kubernetes deployment qualification.

## Related concepts and limits

Start with [a first build](../../getting-started/first-build/README.md) and the relevant native baselines in the catalog. The shared materialize contract orders the Node producer before Go and verifies the directory identity. It needs no redundant depends_on edge. This project intentionally has no database or framework dependencies.

Failures remain visible: correct the native prerequisite or reported project problem and rerun. Do not replace a failed provider with fake success. Delete only this copy's build outputs and test processes when finished. Obtain the exact documentation source commit with git checkout before copying. See [native builds](https://docs.oyzu.ai/docs/reference/local-builds) and [artifact materialization](https://docs.oyzu.ai/docs/reference/target-workspaces).
